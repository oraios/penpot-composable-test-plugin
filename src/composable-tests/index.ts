import { TestSuite } from "./core/TestSuite";
import { allCases } from "./cases";

/**
 * Builds the enumerated test suite for the live Penpot document. The suite expands
 * every case into its concrete variants once (assigning stable ids) and serves
 * both the tree the UI renders and the runs it requests. Intended to be created
 * once by the plugin, which then sends its `tree()` to the UI and runs selected
 * ids on demand.
 */
export function createTestSuite(): TestSuite {
    return new TestSuite(allCases());
}

export { TestSuite } from "./core/TestSuite";
export type { TestRunObserver } from "./core/TestRunObserver";
export type { TestTree, TestGroupInfo, TestInfo } from "./core/TestTree";
export { TestResult } from "./core/TestResult";
