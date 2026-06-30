import { Role } from "./Role";

/**
 * Marker base class for a bundle of named roles exposed by a setup. A concrete
 * bundle declares the roles a particular configuration provides as `Role` fields;
 * the setup that builds the configuration owns an instance of the bundle and
 * binds its roles. Subclassing this marker lets `Setup` be parametrised by the
 * roles it offers, making the setup-to-roles connection explicit and typed.
 */
export abstract class RoleBundle {
    /**
     * All roles declared on this bundle. Defaults to every `Role`-valued own
     * property, so concrete bundles need only declare their roles as fields.
     */
    allRoles(): Role[] {
        return Object.values(this).filter((value): value is Role => value instanceof Role);
    }
}
