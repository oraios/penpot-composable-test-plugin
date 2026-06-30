import { Situation } from "./Situation";
import { RoleBundle } from "./RoleBundle";

/**
 * A strategy that builds the initial situation for a test. Creates the starting
 * configuration in the live document (e.g. a component with a copy) and binds the
 * meaningful shapes to its roles, returning the populated situation.
 *
 * A setup OWNS its role bundle (type `TRoles`): the roles it exposes are a typed
 * property, so a case refers to participants via `setup.roles.X` rather than a
 * free-floating constant — making the setup-to-roles connection explicit and
 * compiler-checked. `build()` binds those same roles in the situation it returns.
 */
export abstract class Setup<TRoles extends RoleBundle> {
    /** The roles this setup's configuration exposes (bound by `build`). */
    abstract readonly roles: TRoles;

    /** Builds a fresh situation with its configuration created and roles bound. */
    abstract build(): Promise<Situation>;

    /** A short description of the configuration this setup builds. */
    abstract describe(): string;
}
