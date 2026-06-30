import { Operation } from "../core/Operation.ts";

/**
 * A complete test: a named operation — the full trajectory, including the step
 * that lays the foundations (creating the starting configuration), any edits or
 * structural changes, and the assertions. Running it applies the operation to a
 * fresh, empty situation.
 */
export class TestCase {
    /**
     * @param name - a stable, human-readable case name (shown in results)
     * @param operation - the trajectory to apply, foundations first, including
     *     assertions
     */
    constructor(
        public readonly name: string,
        public readonly operation: Operation
    ) {}
}
