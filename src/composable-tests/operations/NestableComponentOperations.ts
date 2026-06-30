import { Board } from "@penpot/plugin-types";
import { Operation } from "../core/Operation";
import { Situation } from "../core/Situation";
import { NestableComponentRoles } from "../setups/NestableComponentRoles";

/**
 * Instantiates the current main component and binds the result as the copy. Reads
 * the component of the `mainInstance`, creates a fresh instance of it, and binds
 * that instance to `copyInstance`.
 */
export class InstantiateCopyOperation extends Operation {
    constructor(private readonly roles: NestableComponentRoles) {
        super();
    }

    async applyTo(situation: Situation): Promise<void> {
        const main = situation.get(this.roles.mainInstance);
        const component = main.component();
        if (component === null) {
            throw new Error(`"${main.name}" is not a component instance; cannot instantiate a copy`);
        }
        const copy = component.instance() as Board;
        situation.bind(this.roles.copyInstance, copy);
    }

    toString(): string {
        return "instantiate copy";
    }
}

/**
 * Adds a nesting level around the current copy. Wraps the `copyInstance` in a new
 * outer board, turns that board into a component, re-points `mainInstance` to the
 * new (outer) main, then instantiates the new component and binds it as the new
 * `copyInstance`. `remoteInstance` is left untouched (the fixed origin). After
 * this, the previously tracked copy is nested one level deeper inside the new
 * copy, so content accessors descend to the corresponding deeper shape.
 */
export class MakeNestedComponentOperation extends Operation {
    constructor(private readonly roles: NestableComponentRoles) {
        super();
    }

    async applyTo(situation: Situation): Promise<void> {
        const inner = situation.get(this.roles.copyInstance);

        // a new outer board containing the current copy, made into a component
        const outerBoard = penpot.createBoard();
        outerBoard.name = "OuterComponentRoot";
        outerBoard.appendChild(inner);
        const outerComponent = penpot.library.local.createComponent([outerBoard]);

        // the outer main becomes the current main; remote stays fixed
        situation.bind(this.roles.mainInstance, outerComponent.mainInstance() as Board);

        // an instance of the outer component becomes the new copy
        situation.bind(this.roles.copyInstance, outerComponent.instance() as Board);
    }

    toString(): string {
        return "make nested component";
    }
}
