import { selectedTable$, state } from "../../state/globalState";
import { Node } from "reactflow";
import { TableData } from "../../types/types";
import { useRef, useState } from "react";
import { generateCssClass, getGoodContrastColor } from "../../utils/styling";
import { Icon } from "../Icon";
import { useOnClickOutside } from "../../hooks/onClickOutside";

const changeTableColor = (table: Node<TableData>, val: string) => {
    const value = val;
    let nCopies = [...state.nodes$];
    const curr = nCopies.findIndex(x => x.id === table.id);
    nCopies[curr].data.backgroundColor = value;
    state.nodes$ = [...nCopies];
}

const changeTableName = (table: Node<TableData>, val: string) => {
    const value = val;
    let nCopies = [...state.nodes$];
    const curr = nCopies.findIndex(x => x.id === table.id);
    // TODO: prevent renaming to existing table name
    nCopies[curr].data.name = value;
    state.nodes$ = [...nCopies];
}

type TableNameProps = {
    isActive: (tableId: string) => boolean;
    table: Node<TableData>;
}

export const TableName = ({ isActive, table }: TableNameProps) => {
    const [editing, setEditing] = useState(false);
    const tableNameRef = useRef(null);

    useOnClickOutside(tableNameRef, () => setEditing(false))
    return (
        <div
            ref={tableNameRef}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", backgroundColor: isActive(table.id) || editing ? table.data.backgroundColor : "initial" }}>
            <input
                id={`input_${table.id}`}
                style={{ color: isActive(table.id) || editing ? getGoodContrastColor(table.data.backgroundColor) : "initial" }}
                className="table-name-input"
                type="text"
                maxLength={20}
                value={table.data.name}
                onChange={(e) => changeTableName(table, e.target.value)}
                disabled={!editing}
            />
            <div style={{ position: "absolute", height: "100%", width: "210px", display: editing ? "none" : "block" }}></div>

            {
                editing && selectedTable$.value && (selectedTable$.value.id === table.id) && (
                    <>
                        <button type="button"
                            className="icon-btn"
                            onClick={() => setEditing(false)}
                        >
                            <Icon type="check" />
                        </button>
                        <input
                            type="color"
                            style={{ height: "30px", width: "30px", border: "none" }}
                            value={table.data.backgroundColor}
                            onBlur={() => setEditing(false)}
                            onChange={(e) => changeTableColor(table, e.target.value)}
                            title="change table color"
                        />
                    </>
                )
            }
            <button type="button"
                className={generateCssClass("icon-btn", { active: editing })}
                style={{ width: "40px", height: "40px" }}
                onClick={() => setEditing(!editing)}
                title="edit table name and color"
            >
                <Icon type="edit" color={isActive(table.id) ? getGoodContrastColor(table.data.backgroundColor) : "#000000"} />
            </button>
        </div>
    )
}