import { Board } from "@penpot/plugin-types";
import { Situation } from "../core/Situation";
import { Color } from "../model/Color";
import { Operation } from "../core/Operation";
import { Role } from "../core/Role";
import { RoleBundle } from "../core/RoleBundle";

/**
 * The roles exposed by a "component whose main contains several nested instances"
 * configuration. The participants the bug concerns are the outer component's main
 * (which holds the nested sub-instance slots) and a copy of that outer component
 * (whose nested sub-heads must each reference the matching slot by position).
 */
class RolesNestedCopies extends RoleBundle {
    /** The outer component's main instance (its children are the nested slots). */
    readonly outerMain = new Role<Board>("outer-main");

    /** A copy (instance) of the outer component. */
    readonly outerCopy = new Role<Board>("outer-copy");
}

/**
 * The foundation operation for a component whose main contains several nested
 * component instances, plus one copy of it.
 *
 * It creates an inner component (a small board with a rectangle), then an outer
 * board holding `nestedCount` instances of that inner component, turns the outer
 * board into a component, and finally instantiates one copy of it.
 *
 * This is the minimal shape behind the referential-integrity crash: each nested
 * sub-instance head in the copy references — by position — the corresponding slot
 * in the outer main (see {@link ../util/SlotIntegrity}). Removing one of the
 * copy's sub-heads shifts the remaining ones, breaking that positional match.
 */
export class OpCreateComponentWithNestedCopies extends Operation {
    readonly roles = new RolesNestedCopies();

    /**
     * @param nestedCount - how many inner instances the outer component contains
     * @param baselineColor - the inner rectangle's fill colour
     */
    constructor(
        private readonly nestedCount: number,
        private readonly baselineColor: Color
    ) {
        super();
    }

    async applyTo(situation: Situation): Promise<void> {
        // inner component: a small board with a single rectangle
        const innerBoard = penpot.createBoard();
        innerBoard.name = "Icon";
        innerBoard.resize(24, 24);
        const rect = penpot.createRectangle();
        rect.name = "rect";
        rect.resize(24, 24);
        rect.fills = [{ fillColor: this.baselineColor.hex, fillOpacity: this.baselineColor.opacity }];
        innerBoard.appendChild(rect);
        const innerComponent = penpot.library.local.createComponent([innerBoard]);

        // outer component: a board holding `nestedCount` instances of the inner one
        const outerBoard = penpot.createBoard();
        outerBoard.name = "Row";
        outerBoard.resize(24 * this.nestedCount, 24);
        for (let i = 0; i < this.nestedCount; i++) {
            outerBoard.appendChild(innerComponent.instance());
        }
        const outerComponent = penpot.library.local.createComponent([outerBoard]);

        // a copy of the outer component; its nested sub-heads are what the bug concerns
        const outerCopy = outerComponent.instance() as Board;

        situation.bind(this.roles.outerMain, outerComponent.mainInstance() as Board);
        situation.bind(this.roles.outerCopy, outerCopy);
    }

    toString(): string {
        return `create component with ${this.nestedCount} nested instances, plus a copy`;
    }
}
