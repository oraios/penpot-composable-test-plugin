import { Situation } from "./Situation";

let nextOperationId = 0;

/**
 * A single step in a test trajectory. Most operations transform the situation
 * (an edit, a structural change); some only observe it (an assertion). Reified
 * as an object (strategy pattern) so steps are composable and self-describing.
 *
 * Each operation carries a stable identity assigned at construction. Applying it
 * records that identity in the situation, so `Situation.wasApplied` can later be
 * asked whether a particular operation instance ran in the current trajectory —
 * the basis for branching assertions over an enumerated sweep. (Bind an operation
 * to a value once and reuse that value, so the identity asked about is the one
 * that ran.)
 *
 * Application is asynchronous because Plugin API mutations and their propagation
 * may settle asynchronously. An operation mutates the live document and the
 * situation's bindings in place.
 */
export abstract class Operation {
    /** This operation instance's stable identity. */
    readonly id: number = nextOperationId++;

    /** Applies this operation to `situation`, mutating it in place. */
    abstract applyTo(situation: Situation): Promise<void>;

    /** A short, human-readable representation, recorded in the applied-operation log. */
    abstract toString(): string;

    /**
     * Indicates whether applying this operation should be recorded in the
     * situation's applied-operation log. True for operations that do something;
     * overridden to false by no-ops (e.g. the skip of an untaken optional branch),
     * so the log reflects only the operations that were actually applied.
     */
    isRecorded(): boolean {
        return true;
    }
}

/**
 * An ordered composition of operations. Applies its steps left-to-right against
 * the same situation, threading the (mutated) situation through each, and marks
 * each applied step in the situation. The primary composition operator.
 */
export class Sequence extends Operation {
    readonly steps: readonly Operation[];

    constructor(steps: readonly Operation[]) {
        super();
        this.steps = steps;
    }

    async applyTo(situation: Situation): Promise<void> {
        for (const step of this.steps) {
            await step.applyTo(situation);
            if (step.isRecorded()) {
                situation.markApplied(step);
                situation.recordApplication(step.toString());
            }
        }
    }

    toString(): string {
        return `sequence(${this.steps.map((s) => s.toString()).join(", ")})`;
    }
}

/** Composes `steps` into a single ordered `Sequence` operation. */
export function inSequence(...steps: Operation[]): Sequence {
    return new Sequence(steps);
}
