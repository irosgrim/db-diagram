import { v4 } from "uuid";
import { primaryKey$, selectedTable$, state } from "../../state/globalState";
import { TableOptions } from "./TableOptions";
import { DragEvent, useState } from "react";
import { generateCssClass, getGoodContrastColor } from "../../utils/styling";
import { Icon } from "../Icon";
import Autocomplete from "../Autocomplete";
import { POSTGRES_TYPES } from "../../utils/sql";
import { deleteNodes } from "../../App";
import { Node } from "reactflow";
import { ColumnData, TableData } from "../../types/types";
import { getProperty } from "../utils";
import { COLUMN_NODE_HEIGHT } from "../Nodes/consts";

type TableSectionProps = {
    table: Node<TableData>
}

const toggleConstraint = (column: any, type: "primary_key" | "unique" | "none") => {
    const nodesCopy = [...state.nodes$];
    const currNodeIndex = nodesCopy.findIndex(x => x.id === column.id);
    if (type === "primary_key") {
        const pk = primaryKey$.value[column.parentNode] ? [...primaryKey$.value[column.parentNode].cols] : [];
        const colIndex = pk.indexOf(column.id);
        if (colIndex === -1) {
            pk.push(column.id);
            nodesCopy[currNodeIndex].data.unique = false;
        } else {
            pk.splice(colIndex, 1);
        }
        primaryKey$.value = { ...primaryKey$.value, [column.parentNode]: { cols: pk } };
    }
    if (type === "unique") {
        nodesCopy[currNodeIndex].data.unique = !nodesCopy[currNodeIndex].data.unique;
    }
    state.nodes$ = [...nodesCopy];
}


export const TableSection = ({ table }: TableSectionProps) => {
    const [editing, setEditing] = useState(false);

    const handleDragStart = (e: any, node: any) => {
        const nodeIndex = state.nodes$.findIndex(x => x.id === node.id);
        e.dataTransfer.setData("text/plain", nodeIndex);
    };

    const handleDrop = (e: DragEvent, node: Node<ColumnData>) => {
        e.preventDefault();

        const nodeIndex = state.nodes$.findIndex(x => x.id === node.id);
        const parentIndex = state.nodes$.findIndex(x => x.id === node.parentNode);
        const draggedPosition = parseInt(e.dataTransfer!.getData("text/plain"), 10);
        e.dataTransfer!.clearData();

        const parentTableId = node.parentNode;

        let reorderedNodes = [...state.nodes$];

        // remove the original
        const [draggedItem] = reorderedNodes.splice(draggedPosition, 1);
        // reinsert at the new index
        reorderedNodes.splice(nodeIndex, 0, draggedItem);

        reorderedNodes = reorderedNodes.map((n, index) => {
            if (n.type !== "group" && n.parentNode === parentTableId) {
                n.position.y = ((index - parentIndex) * 20);
            }
            return n;
        });

        state.nodes$ = [...reorderedNodes];
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const addColumn = (currentTable: Node<TableData>) => {
        const nodesCopy = [...state.nodes$];
        const { id } = currentTable;
        let lastColumnIndex = 0;
        let colNr = 0;
        const columnNames = [];

        for (let i = 0; i < nodesCopy.length; i++) {
            if (nodesCopy[i].id === currentTable.id) {
                nodesCopy[i].data.height += COLUMN_NODE_HEIGHT;
                // nodesCopy[i].style.height += COLUMN_NODE_HEIGHT;
            }

            if (nodesCopy[i].type === "column" && nodesCopy[i].parentNode === id) {
                lastColumnIndex = i;
                colNr += 1;
                columnNames.push(nodesCopy[i].data.name);
            }
            // move the indexes section down by 20px
            if ((nodesCopy[i].type === "separator" || nodesCopy[i].type === "index") && nodesCopy[i].parentNode === id) {
                nodesCopy[i].position.y += COLUMN_NODE_HEIGHT;
            }
        }

        let newColName = `column_${colNr}`;
        if (columnNames.indexOf(newColName) > -1) {
            newColName += "_" + 1;
        }
        const col = {
            id: `${currentTable.id}/col_${v4()}`,
            type: "column",
            position: { x: 0, y: (colNr * COLUMN_NODE_HEIGHT) + COLUMN_NODE_HEIGHT },
            data: { name: newColName, type: "VARCHAR", unique: false, notNull: false },
            parentNode: currentTable.id, extent: "parent",
            draggable: false,
            expandParent: true,
        };

        nodesCopy.splice(lastColumnIndex + 1, 0, col);

        // setNodes(nodesCopy)
        state.nodes$ = [...nodesCopy];
    }
    const isActive = selectedTable$.value === table.id;
    return (
        <li>
            <details
                open={isActive}
                style={{ borderLeft: `6px solid ${table.data.backgroundColor}` }}
                onToggle={(e: any) => {
                    if (e.target.open) {
                        selectedTable$.value = table.id;
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
                        state.nodes$.filter(n => n.parentNode === table.id && n.type === "column").map((c) => (
                            <li
                                key={c.id}
                                onDragStart={(e) => handleDragStart(e, c)}
                                onDrop={(e) => handleDrop(e, c)}
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
                                            value={c.data.name}
                                            onChange={(e) => {
                                                c.data.name = e.target.value;
                                                const cp = [...state.nodes$];
                                                state.nodes$ = cp;
                                            }}
                                            style={{ width: "100px" }}
                                        />
                                        <Autocomplete
                                            suggestions={POSTGRES_TYPES}
                                            value={c.data.type || ""}
                                            onChange={(value) => {
                                                c.data.type = value;
                                                const cp = [...state.nodes$];
                                                state.nodes$ = cp;
                                            }}
                                        />
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <button type="button"
                                            className={generateCssClass("icon-btn", { active: !getProperty(c).isNotNull })}
                                            onClick={() => {
                                                let nCopies = [...state.nodes$];
                                                const curr = nCopies.findIndex(x => x.id === c.id);
                                                nCopies[curr].data.notNull = !nCopies[curr].data.notNull;
                                                state.nodes$ = nCopies;
                                            }}
                                            title="nullable value"
                                        >
                                            <Icon type="null" />
                                        </button>

                                        <button type="button"
                                            title="primary key"
                                            className={generateCssClass("icon-btn", { active: primaryKey$.value[c.parentNode] && primaryKey$.value[c.parentNode].cols.includes(c.id) })}
                                            onClick={() => toggleConstraint(c, "primary_key")}
                                        >
                                            <Icon type="flag" />
                                        </button>

                                        <button type="button"
                                            className={generateCssClass("icon-btn", { active: c.data.unique })}
                                            title="unique"
                                            onClick={() => toggleConstraint(c, "unique")}
                                            disabled={primaryKey$.value[c.parentNode]?.cols.includes(c.id)}
                                        >
                                            <Icon type="star" />
                                        </button>
                                        <button type="button"
                                            className={generateCssClass("icon-btn")}
                                            onClick={() => deleteNodes([c])}
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