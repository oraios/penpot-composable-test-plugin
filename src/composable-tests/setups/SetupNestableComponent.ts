import { Board } from "@penpot/plugin-types";
import { Setup } from "../core/Setup";
import { Situation } from "../core/Situation";
import { Operation } from "../core/Operation";
import { Role } from "../core/Role";
import { RoleBundle } from "../core/RoleBundle";
import { ContentCreationStrategy } from "./content-creation/ContentCreationStrategy.ts";

/**
 * The instance roles of a nestable-component configuration. Three component
 * INSTANCES are tracked, with these meanings as the configuration evolves:
 *   - `remoteInstance` — the originally created main instance (the fixed origin);
 *     never re-pointed.
 *   - `mainInstance` — the CURRENT outermost main; re-pointed to the new outer
 *     component on each nesting.
 *   - `copyInstance` — the instance whose deep content reflects propagation; set
 *     by instantiate, and replaced on each nesting by the new outer instance.
 * Content shapes (e.g. a child rect) are not roles here — they are found inside a
 * given instance via the content-creation strategy.
 */
class RolesNestableComponent extends RoleBundle {
    readonly remoteInstance = new Role<Board>("remote-instance");
    readonly mainInstance = new Role<Board>("main-instance");
    readonly copyInstance = new Role<Board>("copy-instance");
}

/**
 * Instantiates the current main component and binds the result as the copy. Reads
 * the component of the `mainInstance`, creates a fresh instance of it, and binds
 * that instance to `copyInstance`.
 */
class OpInstantiateCopy extends Operation {
    constructor(private readonly roles: RolesNestableComponent) {
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
class OpMakeNestedComponent extends Operation {
    constructor(private readonly roles: RolesNestableComponent) {
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

/**
 * A setup for a component that can be instantiated and nested. It owns the three
 * instance roles (`remoteInstance`, `mainInstance`, `copyInstance`) and a content-
 * creation strategy, and it provides the operations that grow the configuration —
 * so a case obtains them from the setup (`setup.createOpInstantiate()`,
 * `setup.createOpMakeNested()`), keeping the operations bound to this setup's
 * roles. The strategy type `TStrategy` is preserved so its content accessors
 * (e.g. locating a child) are available to the case.
 *
 * `build` creates the component and points both `remoteInstance` and
 * `mainInstance` at its main instance. The factory operations re-point the roles
 * as the configuration evolves (see the individual operations).
 */
export class SetupNestableComponent<TStrategy extends ContentCreationStrategy> extends Setup<RolesNestableComponent> {
    readonly roles = new RolesNestableComponent();

    /**
     * @param strategy - creates and locates the component's content
     */
    constructor(public readonly strategy: TStrategy) {
        super();
    }

    async build(): Promise<Situation> {
        // create the board, fill it via the strategy, and make it a component
        const board = penpot.createBoard();
        board.name = "ComponentRoot";
        board.resize(100, 100);
        this.strategy.createContent(board);

        const component = penpot.library.local.createComponent([board]);
        const main = component.mainInstance() as Board;

        // remote and main both start at the original main; copy is set by instantiate
        const situation = new Situation();
        situation.bind(this.roles.remoteInstance, main);
        situation.bind(this.roles.mainInstance, main);
        return situation;
    }

    describe(): string {
        return "nestable component";
    }

    /** An operation that instantiates the current main and binds it as the copy. */
    createOpInstantiate(): Operation {
        return new OpInstantiateCopy(this.roles);
    }

    /** An operation that adds a nesting level around the current copy. */
    createOpMakeNested(): Operation {
        return new OpMakeNestedComponent(this.roles);
    }
}
