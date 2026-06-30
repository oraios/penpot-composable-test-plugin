import { Shape } from "@penpot/plugin-types";
import { Role } from "./Role";

/**
 * The mutable state a test trajectory operates on. Carries the role bindings
 * (meaningful shapes of the configuration, resolved to live Plugin API handles)
 * and the ordered log of operations applied so far.
 *
 * Unlike a pure in-memory model, the situation operates on the LIVE Penpot
 * document: an operation mutates the document through the Plugin API and updates
 * the bindings. Role lookup is strict — an unbound role throws diagnostically
 * rather than returning a nullish value.
 */
export class Situation {
    private readonly roles = new Map<string, Shape>();
    private readonly appliedLog: string[] = [];
    private readonly appliedIds = new Set<number>();

    /**
     * Binds `role` to `shape`, replacing any existing binding. Returns this
     * situation to allow fluent setup.
     */
    bind<T extends Shape>(role: Role<T>, shape: T): this {
        this.roles.set(role.name, shape);
        return this;
    }

    /**
     * Resolves `role` to its bound shape. Throws a diagnostic error naming the
     * absent role and the roles that are bound, never returning nullish.
     */
    get<T extends Shape>(role: Role<T>): T {
        const shape = this.roles.get(role.name);
        if (shape === undefined) {
            const present = Array.from(this.roles.keys()).join(", ");
            throw new Error(`Unbound role "${role.name}". Bound roles: [${present}]`);
        }
        return shape as T;
    }

    /** Indicates whether `role` is currently bound. */
    has(role: Role): boolean {
        return this.roles.has(role.name);
    }

    /**
     * Records that an operation described by `description` was applied, appending
     * it to the ordered log.
     */
    recordApplication(description: string): void {
        this.appliedLog.push(description);
    }

    /** The ordered transcript of applied operations, for failure diagnostics. */
    get transcript(): readonly string[] {
        return this.appliedLog;
    }

    /**
     * Marks `operation` as applied in this trajectory (by its stable identity).
     * Accepts anything carrying an `id`, to avoid a dependency on the operation
     * class.
     */
    markApplied(operation: { id: number }): void {
        this.appliedIds.add(operation.id);
    }

    /**
     * Indicates whether `operation` was applied in this trajectory. Used by
     * assertions to branch on which optional steps a given enumerated variant
     * took.
     */
    wasApplied(operation: { id: number }): boolean {
        return this.appliedIds.has(operation.id);
    }
}
