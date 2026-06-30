import { Board } from "@penpot/plugin-types";
import { Setup } from "../core/Setup";
import { Situation } from "../core/Situation";
import { Operation } from "../core/Operation";
import { ComponentCreationStrategy } from "./ComponentCreationStrategy";
import { NestableComponentRoles } from "./NestableComponentRoles";
import { InstantiateCopyOperation, MakeNestedComponentOperation } from "../operations/NestableComponentOperations";

/**
 * A setup for a component that can be instantiated and nested. It owns the three
 * instance roles (`remoteInstance`, `mainInstance`, `copyInstance`) and a content
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
export class NestableComponentSetup<TStrategy extends ComponentCreationStrategy> extends Setup<NestableComponentRoles> {
    readonly roles = new NestableComponentRoles();

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
        return new InstantiateCopyOperation(this.roles);
    }

    /** An operation that adds a nesting level around the current copy. */
    createOpMakeNested(): Operation {
        return new MakeNestedComponentOperation(this.roles);
    }
}
