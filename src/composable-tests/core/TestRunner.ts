import { TestCase } from "./TestCase";
import { enumerate } from "./Enumeration";

/**
 * The outcome of running one concrete variant of a test case. An immutable record
 * carrying the variant's display name, whether it passed, and — on failure — the
 * error message and the transcript of operations that had been applied.
 */
export class TestResult {
    private constructor(
        public readonly name: string,
        public readonly passed: boolean,
        public readonly errorMessage: string | undefined,
        public readonly transcript: readonly string[]
    ) {}

    /** Creates a passing result named `name`. */
    static pass(name: string, transcript: readonly string[]): TestResult {
        return new TestResult(name, true, undefined, transcript);
    }

    /** Creates a failing result named `name` with `errorMessage` and `transcript`. */
    static fail(name: string, errorMessage: string, transcript: readonly string[]): TestResult {
        return new TestResult(name, false, errorMessage, transcript);
    }
}

/**
 * Runs test cases and collects their results. Each case is ENUMERATED into its
 * concrete variants (every combination of branch choices); each variant is run
 * independently against a freshly-built situation, so the live document is rebuilt
 * per variant and variants do not interfere. An exception (assertion failure or
 * error) is captured as a failing result so one failure does not stop the rest.
 */
export class TestRunner {
    /**
     * Runs every case in `cases`, expanding each into its variants and returning
     * one result per variant.
     */
    async run(cases: readonly TestCase<any>[]): Promise<TestResult[]> {
        const results: TestResult[] = [];
        for (const testCase of cases) {
            const variants = enumerate(testCase.operation);
            for (let i = 0; i < variants.length; i++) {
                const name = variants.length === 1 ? testCase.name : `${testCase.name} [${i + 1}/${variants.length}]`;
                results.push(await this.runVariant(testCase, variants[i], name));
            }
        }
        return results;
    }

    private async runVariant(testCase: TestCase<any>, variant: { applyTo: (s: any) => Promise<void> }, name: string) {
        let situation;
        try {
            // rebuild the configuration fresh for this variant
            situation = await testCase.setup.build();
            await variant.applyTo(situation);
            return TestResult.pass(name, situation.transcript);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const transcript = situation ? situation.transcript : [];
            return TestResult.fail(name, message, transcript);
        }
    }
}
