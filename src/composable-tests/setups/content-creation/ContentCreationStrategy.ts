import { Board } from "@penpot/plugin-types";

/**
 * A strategy for creating the CONTENT of a component: given the board that will
 * become a component's root, it fills the board with the component's child shapes.
 * The abstract contract is just this one step — what a component contains. Anything
 * needed to locate that content afterwards (e.g. in an instance's subtree) is the
 * concrete strategy's own affair.
 */
export abstract class ContentCreationStrategy {
    /** Populates `board` with the component's content. */
    abstract createContent(board: Board): void;
}
