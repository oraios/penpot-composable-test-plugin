import { Operation } from "../core/Operation";
import { Situation } from "../core/Situation";
import { ShapeTarget, resolveTarget } from "../core/ShapeTarget";

/**
 * Removes the shape a target resolves to from the document, via the Plugin API's
 * `remove()`. The structural-deletion counterpart to {@link OpChangeProperty}:
 * resolves `target` against the situation (a role, or a function deriving the
 * shape) and deletes it.
 */
export class OpDeleteShape extends Operation {
    /**
     * @param target - resolves the shape to delete (role or situation-derived)
     * @param targetLabel - a human-readable name for the deleted shape, used in
     *     the applied-operation log; defaults to the target's own string form
     */
    constructor(
        private readonly target: ShapeTarget,
        private readonly targetLabel: string = String(target)
    ) {
        super();
    }

    async applyTo(situation: Situation): Promise<void> {
        const shape = resolveTarget(this.target, situation);
        shape.remove();
    }

    toString(): string {
        return `delete ${this.targetLabel}`;
    }
}
