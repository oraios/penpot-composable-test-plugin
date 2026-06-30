import { Shape, Board } from "@penpot/plugin-types";
import { Setup } from "../core/Setup";
import { Situation } from "../core/Situation";
import { Color } from "../model/Color";
import { ComponentRoles } from "./ComponentRoles";

/**
 * Builds a "simple component with a copy" configuration: a one-child component
 * (a board containing a single rectangle) plus one instance of it. Binds the
 * main's and the copy's child rectangles to its `mainChild` / `copyChild` roles
 * and the copy's root to `copyRoot`. The child rectangle starts with a known
 * baseline fill, so a later "value followed" check is distinguishable from
 * coincidence.
 */
export class SimpleComponentWithCopySetup extends Setup<ComponentRoles> {
    readonly roles = new ComponentRoles();

    /**
     * @param baselineColor - the child rectangle's initial fill colour
     */
    constructor(private readonly baselineColor: Color) {
        super();
    }

    async build(): Promise<Situation> {
        // create the board + child rectangle that will become the component
        const board = penpot.createBoard();
        board.name = "ComponentRoot";
        board.resize(100, 100);

        const rect = penpot.createRectangle();
        rect.name = "Child";
        rect.resize(50, 50);
        rect.fills = [{ fillColor: this.baselineColor.hex, fillOpacity: this.baselineColor.opacity }];
        board.appendChild(rect);

        // turn the board into a component; its main instance is the board itself
        const component = penpot.library.local.createComponent([board]);
        const mainRoot = component.mainInstance();

        // instantiate a copy of the component on the current page
        const copyRoot = component.instance();

        const situation = new Situation();
        situation.bind(this.roles.mainChild, this.onlyChildOf(mainRoot));
        situation.bind(this.roles.copyChild, this.onlyChildOf(copyRoot));
        situation.bind(this.roles.copyRoot, copyRoot);
        return situation;
    }

    describe(): string {
        return "simple component with a copy";
    }

    /** Returns the single child of `root`, failing if it does not have exactly one. */
    private onlyChildOf(root: Shape): Shape {
        const children = (root as Board).children;
        if (!children || children.length !== 1) {
            throw new Error(`Expected "${root.name}" to have exactly one child, found ${children?.length ?? 0}`);
        }
        return children[0];
    }
}
