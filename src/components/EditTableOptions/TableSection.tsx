import { v4 } from "uuid";
import { indexes$, primaryKey$, selectedTable$, state, uniqueKeys$ } from "../../state/globalState";
import { TableOptions } from "./TableOptions";
import { DragEvent, memo } from "react";
import { generateCssClass } from "../../utils/styling";
import { Icon } from "../Icon";
import Autocomplete from "../Autocomplete";
import { POSTGRES_TYPES } from "../../utils/sql";
import { Node } from "reactflow";
import { ColumnData, TableData } from "../../types/types";
import { getProperty } from "../utils";
import { TableName } from "./TableName";

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


const handleDragStart = (e: any, columnIndex: number) => {
    e.dataTransfer.setData("text/plain", columnIndex);
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
const isActive = (tableId: string) => selectedTable$.value?.id === tableId;

const onDeleteColumn = (c: ColumnData, index: number) => {
    const cp = [...state.nodes$];
    const tableIndex = cp.findIndex(x => x.id === selectedTable$.value!.id);
    cp[tableIndex].data.columns.splice(index, 1);
    state.nodes$ = cp;

    if (tableIndex > -1) {
        if (indexes$.value[selectedTable$.value!.id]) {
            // delete indexes that reference the col
            const k = [...indexes$.value[selectedTable$.value!.id]];

            const a = k.map(x => {
                const colIndex = x.cols.findIndex(col => col === c.id);
                if (colIndex > -1) {
                    x.cols.splice(colIndex, 1);
                }
                return x;
            }).filter(x => x.cols.length > 0);

            const n = [];
            const temp: string[] = [];
            for (const nn of a) {
                const str = JSON.stringify(nn);
                if (temp.indexOf(str) === -1) {
                    temp.push(str);
                    n.push(nn)
                }
            }

            indexes$.value = { ...indexes$.value, [selectedTable$.value!.id]: n };
        }

        if (primaryKey$.value[selectedTable$.value!.id]) {
            // delete pk that reference the col
            const pk = primaryKey$.value[selectedTable$.value!.id];
            const pkIndex = pk.cols.findIndex(x => x === c.id);
            if (pkIndex > -1) {
                pk.cols.splice(pkIndex, 1);
            }
            primaryKey$.value = { ...primaryKey$.value, [selectedTable$.value!.id]: pk };
        }

        if (uniqueKeys$.value[selectedTable$.value!.id]) {
            // delete uniqueKeys$ that reference col
            const uk = [...uniqueKeys$.value[selectedTable$.value!.id]];
            const ukArr = uk.map(x => {
                const colIndex = x.cols.findIndex(col => col === c.id);
                if (colIndex > -1) {
                    x.cols.splice(colIndex, 1);
                }
                return x;
            }).filter(x => x.cols.length > 0);

            const newArr = [];
            const tempArr: string[] = [];
            for (const nn of ukArr) {
                const str = JSON.stringify(nn);
                if (tempArr.indexOf(str) === -1) {
                    tempArr.push(str);
                    newArr.push(nn)
                }
            }
            uniqueKeys$.value = { ...uniqueKeys$.value, [selectedTable$.value!.id]: newArr };
        }

        // delete all edges that reference the column
        state.edges$ = state.edges$.filter(x => !(x.data?.sourceHandle.includes(c.id) || x.data?.targetHandle.includes(c.id)))
    }
}

const setNullValue = (c: ColumnData) => {
    c.notNull = !c.notNull;
    const cp = [...state.nodes$];
    state.nodes$ = cp;
}

const onTypeChange = (c: ColumnData, value: string) => {
    c.type = value;
    const cp = [...state.nodes$];
    state.nodes$ = cp;
}

const changeColumnName = (table: Node<TableData>, c: ColumnData, value: string) => {
    const tableIndex = state.nodes$.findIndex(x => x.id === table.id);
    const colIndex = table.data.columns.findIndex(x => x.id === c.id);
    const cp: Node<TableData>[] = [...state.nodes$];
    cp[tableIndex].data.columns[colIndex].name = value;
    state.nodes$ = cp;
}

const handleDrop = async (e: DragEvent, tableId: string, columnIndex: number) => {

    e.preventDefault();
    const nodesCp: Node<TableData>[] = JSON.parse(JSON.stringify(state.nodes$));
    const parentIndex = nodesCp.findIndex(x => x.id === tableId);
    const tableNode = nodesCp[parentIndex];
    const draggedPosition = parseInt(e.dataTransfer!.getData("text/plain"), 10);
    e.dataTransfer!.clearData();

    // remove the original
    const [draggedItem] = tableNode.data.columns.splice(draggedPosition, 1);
    // reinsert at the new index
    tableNode.data.columns.splice(columnIndex, 0, draggedItem);
    selectedTable$.value = tableNode;

    state.nodes$ = nodesCp;

};

export const TableSection = memo(() => {

    return (
        <ul className="tables-nav" >
            {
                state.nodes$.map(table => (
                    <li key={table.id}>
                        <details
                            open={isActive(table.id)}
                            style={{ borderLeft: `6px solid ${table.data.backgroundColor}` }}
                            onToggle={(e: any) => {
                                e.preventDefault();
                                if (!selectedTable$.value || selectedTable$.value && selectedTable$.value.id !== table.id) {
                                    selectedTable$.value = table;
                                }

                                if (e.target.open) {
                                    selectedTable$.value = table
                                }

                                if (!e.target.open) {
                                    selectedTable$.value = null
                                }

                            }}
                            className="table-props-container"
                        >
                            <summary
                                className="table-props"
                            >
                                <TableName isActive={isActive} table={table} />
                            </summary>
                            <ul className="table-props">
                                {
                                    selectedTable$.value && selectedTable$.value.id === table.id && selectedTable$.value.data?.columns.map((c: any, index: number) => (
                                        <li
                                            key={c.id}
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDrop={async (e) => handleDrop(e, selectedTable$.value!.id, index)}
                                            onDragOver={handleDragOver}
                                            draggable
                                        >
                                            <div className="row">
                                                <span style={{ display: "flex" }}>
                                                    <input
                                                        id={`input_${c.id}`}
                                                        className="table-input"
                                                        type="text"
                                                        maxLength={128}
                                                        value={c.name}
                                                        onChange={(e) => changeColumnName(table, c, e.target.value)}
                                                        style={{ width: "100px" }}
                                                    />
                                                    <Autocomplete
                                                        suggestions={POSTGRES_TYPES}
                                                        value={c.type || ""}
                                                        onChange={(value) => onTypeChange(c, value)}
                                                        id={"autocomplete_" + c.id}
                                                    />
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center" }}>
                                                    <button type="button"
                                                        className={generateCssClass("icon-btn", { active: !getProperty(c).isNotNull })}
                                                        onClick={() => setNullValue(c)}
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
                                                        onClick={() => onDeleteColumn(c, index)}
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
                ))
            }
        </ul>
    )
});