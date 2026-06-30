// The plugin UI (runs in the iframe; has the DOM, talks to the sandbox via
// postMessage). It offers a "Run tests" button and renders the run summary the
// sandbox returns.

import "./style.css";

const runTestsBtn = document.getElementById("run-tests-btn") as HTMLButtonElement;
const testResultsEl = document.getElementById("test-results") as HTMLElement;

/** A serialisable summary of a composable test run, as produced by the sandbox. */
interface TestRunSummary {
    total: number;
    passed: number;
    failed: number;
    results: Array<{ name: string; passed: boolean; errorMessage?: string; transcript: string[] }>;
}

runTestsBtn?.addEventListener("click", () => {
    runTestsBtn.disabled = true;
    testResultsEl.hidden = false;
    testResultsEl.textContent = "Running tests…";
    parent.postMessage({ type: "run-tests" }, "*");
});

window.addEventListener("message", (event: MessageEvent) => {
    if (event.data?.type === "test-results") {
        runTestsBtn.disabled = false;
        renderTestResults(event.data.summary as TestRunSummary);
    }
});

/**
 * Renders a test run summary into the results area.
 *
 * @param summary - the run summary received from the sandbox
 */
function renderTestResults(summary: TestRunSummary): void {
    testResultsEl.hidden = false;
    testResultsEl.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "test-summary body-s";
    heading.textContent = `${summary.passed}/${summary.total} passed`;
    testResultsEl.appendChild(heading);

    for (const result of summary.results) {
        const row = document.createElement("div");
        row.className = "test-case body-s";
        row.dataset.passed = String(result.passed);
        row.textContent = `${result.passed ? "PASS" : "FAIL"} — ${result.name}`;
        testResultsEl.appendChild(row);

        if (!result.passed) {
            if (result.errorMessage) {
                const error = document.createElement("div");
                error.className = "test-error body-s";
                error.textContent = result.errorMessage;
                testResultsEl.appendChild(error);
            }
            // show the concrete sequence of operations that was applied in this variant
            if (result.transcript.length > 0) {
                const trace = document.createElement("ol");
                trace.className = "test-transcript body-s";
                for (const step of result.transcript) {
                    const item = document.createElement("li");
                    item.textContent = step;
                    trace.appendChild(item);
                }
                testResultsEl.appendChild(trace);
            }
        }
    }
}
