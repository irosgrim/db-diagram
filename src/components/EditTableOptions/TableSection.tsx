import { v4 } from "uuid";
import { primaryKey$, selectedTable$, state } from "../../state/globalState";
import { TableOptions } from "./TableOptions";
import { DragEvent, useState } from "react";
import { generateCssClass, getGoodContrastColor } from "../../utils/styling";
import { Icon } from "../Icon";
import Autocomplete from "../Autocomplete";
import { POSTGRES_TYPES } from "../../utils/sql";
import { Node } from "reactflow";
import { ColumnData, TableData } from "../../types/types";
import { getProperty } from "../utils";

type TableSectionProps = {
    table: Node<TableData>
}

const toggleConstraint = (tableId: string, column: any, type: "primary_key" | "unique" | "none") => {
    const nodesCopy = [...state.nodes$];
    const currNodeIndex = nodesCopy.findIndex(x => x.id === tableId);
    const columnIndex = nodesCopy[currNodeIndex].data.columns.findIndex((c: any) => c.id === column.id);
    if (type === "primary_key") {
        const pk = primaryKey$.value[tableId] ? [...primaryKey$.value[tableId].cols] : [];
        const colIndex = pk.indexOf(column.id);
        if (colIndex === -1) {
            pk.push(column.id);
            nodesCopy[currNodeIndex].data.columns[columnIndex].unique = false;
        } else {
            pk.splice(colIndex, 1);
        }
        primaryKey$.value = { ...primaryKey$.value, [tableId]: { cols: pk } };
    }
    if (type === "unique") {
        nodesCopy[currNodeIndex].data.columns[columnIndex].unique = !nodesCopy[currNodeIndex].data.columns[columnIndex].unique;
    }
    state.nodes$ = [...nodesCopy];
}


export const TableSection = ({ table }: TableSectionProps) => {
    const [editing, setEditing] = useState(false);

    const handleDragStart = (e: any, columnIndex: number) => {
        e.dataTransfer.setData("text/plain", columnIndex);
    };

    const handleDrop = (e: DragEvent, tableId: string, columnIndex: number) => {
        e.preventDefault();
        const parentIndex = state.nodes$.findIndex(x => x.id === tableId);
        const tableNode = state.nodes$[parentIndex];
        const draggedPosition = parseInt(e.dataTransfer!.getData("text/plain"), 10);
        e.dataTransfer!.clearData();

        // remove the original
        const [draggedItem] = tableNode.data.columns.splice(draggedPosition, 1);
        // reinsert at the new index
        tableNode.data.columns.splice(columnIndex, 0, draggedItem);

        const nodesCp = [...state.nodes$];
        state.nodes$ = [...nodesCp];
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const addColumn = (currentTable: Node<TableData>) => {
        let colNr = currentTable.data.columns!.length;
        const nodesCopy = [...state.nodes$];

        const currentTableIndex = nodesCopy.findIndex(x => x.id === currentTable.id);
        const columnNames: string[] = [];

        let newColName = `column_${colNr}`;
        if (columnNames.indexOf(newColName) > -1) {
            newColName += "_" + 1;
        }
        const col: ColumnData = {
            id: `${currentTable.id}/col_${v4()}`,
            name: newColName,
            type: "VARCHAR",
            unique: false,
            notNull: false,
        };
        nodesCopy[currentTableIndex].data.columns.push(col);
        state.nodes$ = [...nodesCopy];
    }

    const isActive = selectedTable$.value?.id === table.id;

    return (
        <li>
            <details
                open={isActive}
                style={{ borderLeft: `6px solid ${table.data.backgroundColor}` }}
                onToggle={(e: any) => {
                    if (e.target.open) {
                        selectedTable$.value = table;
                    } else if (!e.target.open) {
                        selectedTable$.value = null;
                    }
                }}
                className="table-props-container"
            >
                <summary
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", backgroundColor: isActive || editing ? table.data.backgroundColor : "initial" }}
                    className="table-props"
                >
                    <input
                        id={`input_${table.id}`}
                        style={{ color: isActive || editing ? getGoodContrastColor(table.data.backgroundColor) : "initial" }}
                        className="table-name-input"
                        type="text"
                        maxLength={20}
                        value={table.data.name}
                        onChange={(e) => {
                            const value = e.target.value;
                            let nCopies = [...state.nodes$];
                            const curr = nCopies.findIndex(x => x.id === table.id);
                            // TODO: prevent renaming to existing table name
                            nCopies[curr].data.name = value;
                            state.nodes$ = [...nCopies];
                        }}
                        disabled={!editing}
                    />
                    <div style={{ position: "absolute", height: "100%", width: "210px", display: editing ? "none" : "block" }}></div>

                    {
                        editing && (
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        let nCopies = [...state.nodes$];
                                        const curr = nCopies.findIndex(x => x.id === table.id);
                                        nCopies[curr].data.backgroundColor = value;
                                        state.nodes$ = [...nCopies];
                                    }}
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
                        <Icon type="edit" color={isActive ? getGoodContrastColor(table.data.backgroundColor) : "#000000"} />
                    </button>
                </summary>
                <ul className="table-props">
                    {
                        selectedTable$.value && selectedTable$.value.data?.columns.map((c: any, index: number) => (
                            <li
                                key={c.id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDrop={(e) => handleDrop(e, selectedTable$.value!.id, index)}
                                onDragOver={handleDragOver}
                                draggable
                            >
                                <div className="row">
                                    <span style={{ display: "flex" }}>
                                        <input
                                            id={`input_${c.id}`}
                                            className="table-input"
                                            type="text"
                                            maxLength={30}
                                            value={c.name}
                                            onChange={(e) => {
                                                c.name = e.target.value;
                                                const cp = [...state.nodes$];
                                                state.nodes$ = cp;
                                            }}
                                            style={{ width: "100px" }}
                                        />
                                        <Autocomplete
                                            suggestions={POSTGRES_TYPES}
                                            value={c.type || ""}
                                            onChange={(value) => {
                                                c.type = value;
                                                const cp = [...state.nodes$];
                                                state.nodes$ = cp;
                                            }}
                                        />
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <button type="button"
                                            className={generateCssClass("icon-btn", { active: !getProperty(c).isNotNull })}
                                            onClick={() => {
                                                c.notNull = !c.notNull;
                                                const cp = [...state.nodes$];
                                                state.nodes$ = cp;
                                            }}
                                            title="nullable value"
                                        >
                                            <Icon type="null" />
                                        </button>

                                        <button type="button"
                                            title="primary key"
                                            className={generateCssClass("icon-btn", { active: primaryKey$.value[selectedTable$.value!.id] && primaryKey$.value[selectedTable$.value!.id].cols.includes(c.id) })}
                                            onClick={() => toggleConstraint(selectedTable$.value!.id, c, "primary_key")}
                                        >
                                            <Icon type="flag" />
                                        </button>

                                        <button type="button"
                                            className={generateCssClass("icon-btn", { active: c.unique })}
                                            title="unique"
                                            onClick={() => toggleConstraint(selectedTable$.value!.id, c, "unique")}
                                            disabled={primaryKey$.value[selectedTable$.value!.id]?.cols.includes(c.id)}
                                        >
                                            <Icon type="star" />
                                        </button>
                                        <button type="button"
                                            className={generateCssClass("icon-btn")}
                                            onClick={() => {
                                                const cp = [...state.nodes$];
                                                const tableIndex = cp.findIndex(x => x.id === selectedTable$.value!.id);
                                                if (tableIndex > -1) {
                                                    cp[tableIndex].data.columns.splice(index, 1);
                                                }
                                                state.nodes$ = cp;
                                            }}
                                            title="delete column"
                                        >
                                            <Icon type="delete" />
                                        </button>
                                    </span>
                                </div>
                            </li>
                        ))
                    }

                </ul>
                <span style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button"
                        onClick={() => addColumn(table)}
                        title="add column"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#9fc8b9", border: "none", padding: "0.5rem", color: "#092635", borderRadius: "5px", marginRight: "1rem", fontWeight: "bold"
                        }}
                    >
                        <Icon type="plus" height="12" />
                        <span style={{ marginLeft: "0.5rem" }}>Add new column</span>
                    </button>
                </span>

                <TableOptions currentTable={table} />
            </details>
        </li>
    )
}