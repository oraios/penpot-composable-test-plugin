import { Shape, Board } from "@penpot/plugin-types";
import { Role } from "../core/Role";
import { RoleBundle } from "../core/RoleBundle";

/**
 * The roles exposed by a "component with a copy" configuration. The participants
 * that take part in propagation are the CHILD shapes of the main and of the copy
 * (the component roots are boards); these are named here, along with the copy's
 * root. A setup owns an instance of this bundle and binds its roles.
 */
export class ComponentRoles extends RoleBundle {
    /** The main component's child shape (the one an edit-to-main targets). */
    readonly mainChild = new Role<Shape>("main-child");

    /** The copy instance's corresponding child shape. */
    readonly copyChild = new Role<Shape>("copy-child");

    /** The copy instance's root (the instantiated board). */
    readonly copyRoot = new Role<Board>("copy-root");
}
