import { Shape } from "@penpot/plugin-types";

/**
 * Tree-search helpers over the Penpot shape hierarchy.
 */
export class ShapeTree {
    /**
     * Returns the first shape in `root`'s subtree (excluding `root` itself) that
     * satisfies `predicate`, searching depth-first, or `null` if none match.
     */
    static findShape(root: Shape, predicate: (shape: Shape) => boolean): Shape | null {
        const children = ShapeTree.childrenOf(root);
        for (const child of children) {
            if (predicate(child)) {
                return child;
            }
            const found = ShapeTree.findShape(child, predicate);
            if (found !== null) {
                return found;
            }
        }
        return null;
    }

    /** The children of `shape`, or an empty array if it has none. */
    private static childrenOf(shape: Shape): Shape[] {
        const container = shape as { children?: Shape[] };
        return container.children ?? [];
    }
}
