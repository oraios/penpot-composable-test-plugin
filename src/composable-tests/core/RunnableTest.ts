import { Operation } from "./Operation";
import { Setup } from "./Setup";
import { RoleBundle } from "./RoleBundle";
import { TestResult } from "./TestResult";

/**
 * One concrete, runnable test: a single enumerated variant of a case, carrying a
 * stable id (its identity across enumeration, the UI, and run requests), a display
 * name, and the setup + operation needed to run it. Running rebuilds the
 * configuration fresh (so variants do not interfere) and captures any failure as a
 * failing result.
 */
export class RunnableTest {
    /**
     * @param id - stable opaque identity (used as the UI key and in run requests)
     * @param name - display name (e.g. "instance #1")
     * @param setup - builds a fresh situation for this variant
     * @param operation - the concrete (fully chosen) trajectory to apply
     */
    constructor(
        public readonly id: string,
        public readonly name: string,
        private readonly setup: Setup<RoleBundle>,
        private readonly operation: Operation
    ) {}

    /** Runs this test against a freshly-built situation, returning its result. */
    async run(): Promise<TestResult> {
        let situation;
        try {
            situation = await this.setup.build();
            await this.operation.applyTo(situation);
            return TestResult.pass(this.name, situation.transcript);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const transcript = situation ? situation.transcript : [];
            return TestResult.fail(this.name, message, transcript);
        }
    }
}
