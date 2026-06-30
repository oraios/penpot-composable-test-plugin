import { TestCase } from "./test-suite/TestCase.ts";
import { createTestCaseB } from "./cases/caseB";
import { createTestCaseK } from "./cases/caseK";
import { createTestCaseD } from "./cases/caseD";

/**
 * All composable test cases currently defined. A factory (not a constant): each
 * case captures live setup state and is rebuilt per run, and the runner further
 * rebuilds the configuration per enumerated variant.
 */
export function allCases(): readonly TestCase[] {
    return [createTestCaseB(), createTestCaseK(), createTestCaseD()];
}
