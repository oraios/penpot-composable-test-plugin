import { Situation } from "./Situation";
import { Operation, Sequence } from "./Operation";

/**
 * The identity operation: applies nothing. Used as the "absent" branch of an
 * optional step, so a sweep can include a variant in which that step did not run.
 */
export class Skip extends Operation {
    async applyTo(_situation: Situation): Promise<void> {
        // intentionally does nothing
    }

    toString(): string {
        return "skip";
    }

    /** A skip did nothing, so it is left out of the applied-operation log. */
    override isRecorded(): boolean {
        return false;
    }
}

/**
 * A branch point: exactly one of its alternatives is taken. It is not applied
 * directly — it exists to be ENUMERATED, expanding a composition into one
 * concrete trajectory per alternative. Applying it directly is a usage error.
 */
export class OneOf extends Operation {
    readonly alternatives: readonly Operation[];

    constructor(alternatives: readonly Operation[]) {
        super();
        this.alternatives = alternatives;
    }

    async applyTo(_situation: Situation): Promise<void> {
        throw new Error("OneOf must be enumerated, not applied directly");
    }

    toString(): string {
        return `one-of(${this.alternatives.map((a) => a.toString()).join(" | ")})`;
    }
}

/**
 * Sweeps "with and without `operation`": a branch point between applying it and
 * skipping it (a `OneOf` over `[operation, Skip]`). Enumerates to two trajectories,
 * one including `operation` and one not. The same `operation` instance can then be
 * queried via `Situation.wasApplied` inside an assertion to branch on which
 * trajectory ran.
 */
export class Optional extends OneOf {
    constructor(operation: Operation) {
        super([operation, new Skip()]);
    }
}

/**
 * Expands `operation` into its concrete variants — every combination of branch
 * choices, with no `OneOf` remaining. A leaf yields itself; a `Sequence` yields
 * the cartesian product of its steps' expansions (each product a `Sequence`); a
 * `OneOf` yields the union of its alternatives' expansions. The runner runs each
 * resulting concrete operation against a freshly-built situation.
 */
export function enumerate(operation: Operation): Operation[] {
    if (operation instanceof OneOf) {
        return operation.alternatives.flatMap(enumerate);
    }
    if (operation instanceof Sequence) {
        return cartesianProduct(operation.steps.map(enumerate)).map((steps) => new Sequence(steps));
    }
    return [operation];
}

/** The cartesian product of the given lists, preserving order. */
function cartesianProduct<T>(lists: T[][]): T[][] {
    return lists.reduce<T[][]>((acc, list) => acc.flatMap((prefix) => list.map((item) => [...prefix, item])), [[]]);
}
