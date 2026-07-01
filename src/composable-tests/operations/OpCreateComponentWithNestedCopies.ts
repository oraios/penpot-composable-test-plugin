import { Board } from "@penpot/plugin-types";
import { Situation } from "../core/Situation";
import { Color } from "../model/Color";
import { Operation } from "../core/Operation";
import { Role } from "../core/Role";
import { RoleBundle } from "../core/RoleBundle";

/** The layout applied to the outer board (see the crash note on the op below). */
export type NestedLayout = "none" | "flex" | "grid";

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
 * Each nested sub-instance head in the copy references — by position — the
 * corresponding slot in the outer main (see {@link ../util/SlotIntegrity}).
 *
 * The `layout` matters for the referential-integrity crash. Deleting a copy
 * sub-head goes through the workspace delete, which fires a `:layout/update`
 * reflow on the parent:
 *   - "none": no reflow — deleting a sub-head merely hides it; stays valid.
 *   - "flex": reflow only repositions geometry — also stays valid.
 *   - "grid": the reflow runs `reorder-grid-children`, which REORDERS the copy's
 *     children. Reordering a copy's sub-heads without assigning swap slots breaks
 *     the positional match with the main -> :missing-slot. The real component that
 *     crashes is a GRID, so this is the value that reproduces the bug.
 */
export class OpCreateComponentWithNestedCopies extends Operation {
    readonly roles = new RolesNestedCopies();

    /**
     * @param nestedCount - how many inner instances the outer component contains
     * @param baselineColor - the inner rectangle's fill colour
     * @param layout - the outer board's layout ("grid" reproduces the crash)
     */
    constructor(
        private readonly nestedCount: number,
        private readonly baselineColor: Color,
        private readonly layout: NestedLayout = "none"
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

        if (this.layout === "grid") {
            // a 1-row, N-column grid with each instance in its own cell
            const grid = outerBoard.addGridLayout();
            while (grid.rows.length < 1) grid.addRow("flex", 1);
            while (grid.columns.length < this.nestedCount) grid.addColumn("flex", 1);
            for (let i = 0; i < this.nestedCount; i++) {
                grid.appendChild(innerComponent.instance(), 1, i + 1);
            }
        } else {
            // add the flex layout BEFORE the children so they are laid out in order
            if (this.layout === "flex") outerBoard.addFlexLayout();
            for (let i = 0; i < this.nestedCount; i++) {
                outerBoard.appendChild(innerComponent.instance());
            }
        }

        const outerComponent = penpot.library.local.createComponent([outerBoard]);

        // a copy of the outer component; its nested sub-heads are what the bug concerns
        const outerCopy = outerComponent.instance() as Board;

        situation.bind(this.roles.outerMain, outerComponent.mainInstance() as Board);
        situation.bind(this.roles.outerCopy, outerCopy);
    }

    toString(): string {
        const layout = this.layout === "none" ? "" : ` (${this.layout})`;
        return `create${layout} component with ${this.nestedCount} nested instances, plus a copy`;
    }
}
