import { TestCase } from "./test-suite/TestCase.ts";
import { createTestCaseB } from "./cases/caseB";
import { createTestCaseK } from "./cases/caseK";
import { createTestCaseD } from "./cases/caseD";
import { createTestCaseE } from "./cases/caseE";

/**
 * All composable test cases currently defined. A factory (not a constant): each
 * case captures live setup state and is rebuilt per run, and the runner further
 * rebuilds the configuration per enumerated variant.
 *
 * NOTE: case E reproduces the :missing-slot bug by reordering a sub-head in a
 * component's MAIN, which currently HANGS the app (the runner lives inside it).
 * Run it individually and expect a hang until the bug is fixed — do NOT "run all".
 */
export function allCases(): readonly TestCase[] {
    return [createTestCaseB(), createTestCaseK(), createTestCaseD(), createTestCaseE()];
}
