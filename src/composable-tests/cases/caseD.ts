import { Board, Shape } from "@penpot/plugin-types";
import { TestCase } from "../test-suite/TestCase.ts";
import { Situation } from "../core/Situation";
import { Color } from "../model/Color";
import { OpAssert } from "../operations/OpAssert";
import { OpSequence } from "../operations/OpSequence.ts";
import { OpOptional } from "../operations/OpOptional.ts";
import { OpCreateComponentWithNestedCopies } from "../operations/OpCreateComponentWithNestedCopies";
import { OpDeleteShape } from "../operations/OpDeleteShape";
import { SlotIntegrity } from "../util/SlotIntegrity";

const BASELINE = new Color("#aaaaaa");
const NESTED_COUNT = 3;

/**
 * Case D — deleting a nested sub-head of a copy must not break slot alignment.
 *
 * Builds a component whose main holds several nested component instances, plus a
 * copy of it, then SWEEPS whether one of the copy's nested sub-heads is deleted.
 * In both variants it asserts the swap-slot invariant: every remaining sub-head
 * must still reference its positional slot in the main (see {@link SlotIntegrity}).
 *
 * - Without the deletion the invariant holds (the variant passes).
 * - With the deletion it does NOT: removing a sub-head shifts the remaining ones,
 *   so their shape-refs no longer match their position and — with no swap slot —
 *   the file fails referential-integrity validation.
 *
 * WARNING: against current Penpot the delete variant reproduces a hard crash of
 * the whole document (the referential-integrity check throws on the corrupt
 * state). The deletion is what real users do; this case is the regression test
 * for the fix. Prefer running its variants individually, and expect the delete
 * variant to take the project down until the underlying bug is fixed.
 */
export function createTestCaseD(): TestCase {
    const foundation = new OpCreateComponentWithNestedCopies(NESTED_COUNT, BASELINE);
    const { outerMain, outerCopy } = foundation.roles;

    // the copy's first nested sub-head, resolved at apply-time
    const firstSubhead = (s: Situation): Shape => (s.get(outerCopy).children ?? [])[0];
    const deleteFirstSubhead = new OpDeleteShape(firstSubhead, "first copy sub-head");

    return new TestCase(
        "D: deleting a nested copy sub-head must preserve slot alignment",
        new OpSequence(
            foundation,
            // sweep with/without the deletion (the delete variant is the repro)
            new OpOptional(deleteFirstSubhead),
            new OpAssert("every copy sub-head still references its positional slot in the main", (s) => {
                SlotIntegrity.assertAligned(s.get(outerCopy) as Board, s.get(outerMain) as Board);
            })
        )
    );
}
