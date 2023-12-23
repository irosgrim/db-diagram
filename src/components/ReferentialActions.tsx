import { ON_DELETE, ON_UPDATE, REFERENTIAL_ACTIONS } from "../utils/sql"

type ReferentialActionsProps = {
    defaultOnDelete: ON_DELETE;
    defaultOnUpdate: ON_UPDATE;
    onChangeDelete: (value: ON_DELETE) => void;
    onChangeUpdate: (value: ON_UPDATE) => void;
}

export const ReferentialActions = ({ defaultOnDelete, defaultOnUpdate, onChangeDelete, onChangeUpdate }: ReferentialActionsProps) => {
    return (
        <span className="fk-ref-actions">
            <select id="on-delete"
                onChange={(e) => onChangeDelete(e.target.value === "-" ? null : e.target.value as unknown as ON_DELETE)}
                defaultValue={defaultOnDelete || "-"}
            >
                <option value="-">NO ACTION</option>
                {
                    REFERENTIAL_ACTIONS.onDelete.map(action => (
                        <option value={action} key={action}>{action}</option>
                    ))
                }
            </select>

            <select id="on-update"
                onChange={(e) => onChangeUpdate(e.target.value === "-" ? null : e.target.value as unknown as ON_UPDATE)}
                defaultValue={defaultOnUpdate || "-"}
            >
                <option value="-">NO ACTION</option>
                {
                    REFERENTIAL_ACTIONS.onUpdate.map(action => (
                        <option value={action} key={action}>{action}</option>
                    ))
                }
            </select>
        </span>
    )
}