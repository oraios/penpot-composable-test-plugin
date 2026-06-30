import { TestCase } from "../test-suite/TestCase.ts";
import { Color } from "../model/Color";
import { ShapePropFillColor } from "../model/ShapeProp.ts";
import { OpChangeProperty } from "../operations/OpChangeProperty";
import { OpAssert } from "../operations/OpAssert";
import { SetupSimpleComponentWithCopy } from "../setups/SetupSimpleComponentWithCopy";
import { inSequence } from "../operations/OpSequence.ts";

// the three distinct fill colours the case uses (read-back values are lower-case)
const BASELINE = new Color("#aaaaaa");
const OVERRIDE = new Color("#ff0000");
const MAIN_CHANGE = new Color("#00ff00");

/**
 * Case B — an override on a copy survives a later change to the main.
 *
 * Override the copy's child fill, then change the main's child fill to a
 * different colour, and assert the copy still shows the override (a touched
 * property is not overwritten by main propagation).
 */
export function createTestCaseB(): TestCase {
    const setup = new SetupSimpleComponentWithCopy(BASELINE);
    const fillColor = new ShapePropFillColor();
    return new TestCase(
        "B: copy override survives later main change",
        setup,
        inSequence(
            new OpChangeProperty(setup.roles.copyChild, fillColor, OVERRIDE),
            new OpChangeProperty(setup.roles.mainChild, fillColor, MAIN_CHANGE),
            new OpAssert("copy child keeps its override after the main changes", (situation) => {
                const copyChild = situation.get(setup.roles.copyChild);
                fillColor.assertEqual(fillColor.read(copyChild), OVERRIDE);
            })
        )
    );
}
