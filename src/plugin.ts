import { runComposableTests } from "./composable-tests";

// The plugin sandbox: it has the `penpot` API but no DOM. It opens the UI and,
// when the UI requests a run, executes the composable test suite against the live
// document and sends the summary back to the UI for rendering.

penpot.ui.open("Composable Tests", "", { width: 360, height: 520 });

penpot.ui.onMessage<{ type?: string }>((message) => {
    if (typeof message === "object" && message?.type === "run-tests") {
        runComposableTests()
            .then((summary) => {
                penpot.ui.sendMessage({ type: "test-results", summary });
            })
            .catch((error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                penpot.ui.sendMessage({
                    type: "test-results",
                    summary: {
                        total: 0,
                        passed: 0,
                        failed: 1,
                        results: [{ name: "test runner", passed: false, errorMessage, transcript: [] }],
                    },
                });
            });
    }
});
