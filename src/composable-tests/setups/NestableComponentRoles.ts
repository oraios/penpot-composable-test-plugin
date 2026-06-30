import { Board } from "@penpot/plugin-types";
import { Role } from "../core/Role";
import { RoleBundle } from "../core/RoleBundle";

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
 * given instance via the creation strategy.
 */
export class NestableComponentRoles extends RoleBundle {
    readonly remoteInstance = new Role<Board>("remote-instance");
    readonly mainInstance = new Role<Board>("main-instance");
    readonly copyInstance = new Role<Board>("copy-instance");
}
