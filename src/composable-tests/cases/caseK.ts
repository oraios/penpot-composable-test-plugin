import { Shape } from "@penpot/plugin-types";
import { TestCase } from "../test-suite/TestCase.ts";
import { Situation } from "../core/Situation";
import { Color } from "../model/Color";
import { ShapePropFillColor } from "../model/ShapeProp.ts";
import { OpChangeProperty } from "../operations/OpChangeProperty";
import { OpAssert } from "../operations/OpAssert";
import { SetupNestableComponent } from "../setups/SetupNestableComponent";
import { ContentCreationStrategyRectangle } from "../setups/content-creation/ContentCreationStrategyRectangle.ts";
import { OpSequence } from "../operations/OpSequence.ts";
import { OpOptional } from "../operations/OpOptional.ts";

// distinct fill colours (read-back values are lower-case)
const BASELINE = new Color("#aaaaaa");
const RED = new Color("#ff0000"); // remote edit
const GREEN = new Color("#00ff00"); // main edit
const BLUE = new Color("#0000ff"); // copy edit

/**
 * Case K — the consolidated synchronisation sweep (precedence portion).
 *
 * On a freshly created component, sweep DEPTH 0/1/2 (two optional nestings) and
 * WHICH EDITS were made (three independent optional edits to the remote, main and
 * copy rect), then assert the override-precedence rule at the copy: a copy
 * override wins; otherwise a main change; otherwise a remote change; otherwise the
 * baseline. Propagation is AUTOMATIC — the trajectory contains only the edits, and
 * the value that surfaces at the copy is what is checked. The edit targets are the
 * tracked instance roles' rects (resolved via the strategy at the current depth),
 * so the same composition holds at any depth.
 *
 * (The reset checkpoint of the original case is omitted: the Plugin API exposes no
 * override-reset operation.)
 */
export function createTestCaseK(): TestCase {
    const setup = new SetupNestableComponent(new ContentCreationStrategyRectangle(BASELINE));
    const fillColor = new ShapePropFillColor();
    const { remoteInstance, mainInstance, copyInstance } = setup.roles;

    // resolve each instance's rect at the current depth via the strategy
    const rectOf =
        (role: typeof remoteInstance) =>
        (s: Situation): Shape =>
            setup.strategy.getRectangle(s.get(role));

    const changeRemote = new OpChangeProperty(rectOf(remoteInstance), fillColor, RED, "remote rect");
    const changeMain = new OpChangeProperty(rectOf(mainInstance), fillColor, GREEN, "main rect");
    const changeCopy = new OpChangeProperty(rectOf(copyInstance), fillColor, BLUE, "copy rect");

    // the colour expected at the copy under the precedence rule
    const expectedAtCopy = (s: Situation): Color => {
        if (s.wasApplied(changeCopy)) return BLUE;
        if (s.wasApplied(changeMain)) return GREEN;
        if (s.wasApplied(changeRemote)) return RED;
        return BASELINE;
    };

    return new TestCase(
        "K: synchronisation precedence sweep",
        setup,
        new OpSequence(
            // instantiate first (nesting wraps the copy), then sweep depth 0/1/2
            setup.createOpInstantiate(),
            new OpOptional(setup.createOpMakeNested()),
            new OpOptional(setup.createOpMakeNested()),
            // sweep which edits were made
            new OpOptional(changeRemote),
            new OpOptional(changeMain),
            new OpOptional(changeCopy),
            new OpAssert("copy shows the highest-precedence applied edit", (s) => {
                const copyRect = setup.strategy.getRectangle(s.get(copyInstance));
                fillColor.assertEqual(fillColor.read(copyRect), expectedAtCopy(s));
            })
        )
    );
}
