import { Board, Shape } from "@penpot/plugin-types";
import { Situation } from "../../core/Situation";
import { Color } from "../../model/Color";
import { ShapeTree } from "../../util/ShapeTree";
import { StrategyContentCreation } from "./StrategyContentCreation";

/** The name given to the single rectangle this strategy places in a component. */
const RECT_NAME = "Child";

/**
 * A content-creation strategy whose component content is a single named rectangle.
 * It locates that rectangle inside any instance of the component by name, so the
 * "the rect of this instance" accessor works at any nesting depth (the rect is
 * found by descending whatever instance is handed in).
 */
export class StrategyRectContentCreation extends StrategyContentCreation {
    /**
     * @param baselineColor - the rectangle's initial fill colour
     */
    constructor(private readonly baselineColor: Color) {
        super();
    }

    createContent(board: Board): void {
        const rect = penpot.createRectangle();
        rect.name = RECT_NAME;
        rect.resize(50, 50);
        rect.fills = [{ fillColor: this.baselineColor.hex, fillOpacity: this.baselineColor.opacity }];
        board.appendChild(rect);
    }

    /**
     * Returns this strategy's rectangle as it appears inside `instance` (found by
     * name within the instance's subtree). Throws if it cannot be found — a
     * structural invariant of the configuration.
     *
     * @param _situation - the current situation (unused; accepted for a uniform
     *     accessor shape across strategies)
     * @param instance - the component instance to search within
     */
    getRect(_situation: Situation, instance: Shape): Shape {
        const rect = ShapeTree.findShape(instance, (shape) => shape.name === RECT_NAME);
        if (rect === null) {
            throw new Error(`Could not find child "${RECT_NAME}" inside instance "${instance.name}"`);
        }
        return rect;
    }
}
