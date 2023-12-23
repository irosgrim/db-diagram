import { REFERENTIAL_ACTIONS } from "./utils/sql";

export type CompositeFkOptions = {
    id: string;
    color: string;
    onDelete: typeof REFERENTIAL_ACTIONS.onDelete | null;
    onUpdate: typeof REFERENTIAL_ACTIONS.onUpdate | null;
}