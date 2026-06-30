import { TestRunner, TestResult } from "./core/TestRunner";
import { allCases } from "./cases";

// (allCases is a factory: cases capture live setup state, so build fresh each run)

/**
 * A serialisable summary of a test run, suitable for sending to the plugin UI.
 * Carries per-case outcomes plus aggregate counts.
 */
export interface TestRunSummary {
    total: number;
    passed: number;
    failed: number;
    results: Array<{
        name: string;
        passed: boolean;
        errorMessage?: string;
        transcript: string[];
    }>;
}

/**
 * Runs the full composable test suite against the live Penpot document and
 * returns a serialisable summary. Intended to be invoked from the plugin in
 * response to the UI's "Run tests" action.
 */
export async function runComposableTests(): Promise<TestRunSummary> {
    const runner = new TestRunner();
    const results = await runner.run(allCases());
    return summarise(results);
}

/** Builds a serialisable summary from per-case results. */
function summarise(results: readonly TestResult[]): TestRunSummary {
    const passed = results.filter((r) => r.passed).length;
    return {
        total: results.length,
        passed,
        failed: results.length - passed,
        results: results.map((r) => ({
            name: r.name,
            passed: r.passed,
            errorMessage: r.errorMessage,
            transcript: [...r.transcript],
        })),
    };
}
