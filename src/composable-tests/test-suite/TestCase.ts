import { Operation } from "../core/Operation.ts";
import { Setup } from "../core/Setup.ts";
import { RoleBundle } from "../core/RoleBundle.ts";

/**
 * A complete test: a named pairing of a setup (the starting configuration) and an
 * operation (the trajectory, including any inline assertions). Running it builds
 * the situation from the setup and applies the operation. Generic over the
 * setup's role bundle so the setup's typed roles are preserved.
 */
export class TestCase<TRoles extends RoleBundle = RoleBundle> {
    /**
     * @param name - a stable, human-readable case name (shown in results)
     * @param setup - builds the starting situation and owns its roles
     * @param operation - the trajectory to apply, including assertions
     */
    constructor(
        public readonly name: string,
        public readonly setup: Setup<TRoles>,
        public readonly operation: Operation
    ) {}
}
