import { TestCase } from "../core/TestCase";
import { inSequence } from "../core/Operation";
import { Color } from "../model/Color";
import { FillColorProperty } from "../model/ShapeProperty";
import { ChangePropertyOperation } from "../operations/ChangePropertyOperation";
import { AssertOperation } from "../operations/AssertOperation";
import { SimpleComponentWithCopySetup } from "../setups/SimpleComponentWithCopySetup";

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
    const setup = new SimpleComponentWithCopySetup(BASELINE);
    const fillColor = new FillColorProperty();
    return new TestCase(
        "B: copy override survives later main change",
        setup,
        inSequence(
            new ChangePropertyOperation(setup.roles.copyChild, fillColor, OVERRIDE),
            new ChangePropertyOperation(setup.roles.mainChild, fillColor, MAIN_CHANGE),
            new AssertOperation("copy child keeps its override after the main changes", (situation) => {
                const copyChild = situation.get(setup.roles.copyChild);
                fillColor.assertEqual(fillColor.read(copyChild), OVERRIDE);
            })
        )
    );
}
