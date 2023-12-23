import { useCallback, useRef, useState } from "react";
import ReactFlow, { addEdge, applyNodeChanges, ConnectionMode, Controls, Edge, MarkerType, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import "../style/edge.scss"
import FloatingEdge from "./FloatingEdge";
import Column from "./Column";
import { v4 } from "uuid";

import "../style/table.scss";
import "../style/modal.scss";
import { Table } from "./Table";
import Autocomplete from "./Autocomplete";
import { Icon } from "./Icon";
import { generateCssClass, randomColor } from "../utils/styling";
import { generateSqlSchema, POSTGRES_TYPES } from "../utils/sql";
import { Select } from "./Select";
import { sampleEdges, sampleNodes } from "./sample";
import { currentModal$, edgeOptions$, indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";
import { useOnClickOutside } from "../hooks/onClickOutside";
import { Modal } from "./Modal";
import { AddConstraint } from "./AddConstraint";
import { AddIndexes } from "./AddIndexes";
import { TableSection } from "./TableSection";
import { EdgeOptions } from "./EdgeOption";
import { ContextMenu } from "./Contextmenu";
import { ReferentialActions } from "./ReferentialActions";
import { AddReferentialActions } from "./AddReferentialActions";

const fitViewOptions = { padding: 4 };

const nodeTypes = { column: Column, group: Table };

const edgeTypes = {
    floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];


export const deleteNodes = (nodesToDelete: any[]) => {
    let nodesCopy = [...state.nodes$];
    let edgesCopy = [...state.edges$];

    for (const nodeToDelete of nodesToDelete) {
        // get the parent table of the node
        const parentTableId = nodeToDelete.parentNode;
        const parentTable = nodesCopy.find(node => node.id === parentTableId);

        if (nodeToDelete.type === "group") {
            // delete table and nodes, edges associated with table
            nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id && node.parentNode !== nodeToDelete.id);
            edgesCopy = edgesCopy.filter(edge => edge.source.split("/")[0] !== nodeToDelete.id && edge.target.split("/")[0] !== nodeToDelete.id);
        } else {
            // delete  column
            nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id);

            // delete indexes
            const v = indexes$.value[parentTableId] ? indexes$.value[parentTableId].filter(idx => idx.cols.indexOf(nodeToDelete.id) === -1) : [];
            if (v.length) {
                indexes$.value = { ...indexes$.value, [parentTableId]: v };
            }

            // delete pk
            if (primaryKey$.value[parentTableId]) {
                const pkCopy = { ...primaryKey$.value[parentTableId] };
                const idx = pkCopy.cols.findIndex(x => x === nodeToDelete.id);
                pkCopy.cols.splice(idx, 1);
                primaryKey$.value = { ...primaryKey$.value, [parentTableId]: pkCopy }
            }

            // delete unique constraint
            if (uniqueKeys$.value[parentTableId]) {
                const unCopy = [...uniqueKeys$.value[parentTableId]];
                const existingUn = unCopy.filter(u => !u.cols.includes(nodeToDelete.id));
                uniqueKeys$.value = { ...uniqueKeys$.value, [parentTableId]: existingUn };
            }

            // delete edges connected to this column
            edgesCopy = edgesCopy.filter(edge => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id);

            if (parentTable) {
                // update positions of remaining columns and resize the table
                const remainingColumns = nodesCopy.filter(node => node.parentNode === parentTableId && node.type !== "group");
                let yPos = 20; // initial Y position for the first column

                nodesCopy = nodesCopy.map(node => {
                    if (node.parentNode === parentTableId && node.type !== "group") {
                        const updatedNode = { ...node, position: { x: 0, y: yPos } };
                        yPos += 20; // increment Y position for the next column
                        return updatedNode;
                    }
                    return node;
                });

                // update the table size
                const updatedTable = { ...parentTable, data: { ...parentTable.data, height: 20 * remainingColumns.length }, style: { ...parentTable.style, height: (20 * remainingColumns.length) + 20 } };
                nodesCopy = nodesCopy.map(node => node.id === parentTableId ? updatedTable : node);
            }
        }
    }

    // Update the state
    state.nodes$ = [...nodesCopy];
    state.edges$ = [...edgesCopy];
};



export const Flow = () => {

    const [, , onEdgesChange] = useEdgesState<any[]>(initialEdges);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [, setSelectedColumn] = useState<string | null>(null);
    const [schema, setSchema] = useState<string | null>(null);
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [menu, setMenu] = useState<{ node: Node, x: number, y: number } | null>(null);
    const fkOpts = useRef(null);

    const ref = useRef(null);

    useOnClickOutside(fkOpts, () => edgeOptions$.value = null)

    const onNodesChange = useCallback(
        (changes: any) => {
            return state.nodes$ = applyNodeChanges(changes, state.nodes$);
            // return setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [state.nodes$]
    );

    const onNodeContextMenu = useCallback(
        (event: any, node: any) => {
            event.preventDefault();
            setMenu({
                node: node,
                x: event.clientX,
                y: event.clientY
            });
        },
        [setMenu],
    );

    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    const onConnect = useCallback(
        (params: any) => {
            const edgeExists = state.edges$.some(edge =>
                edge.source === params.source &&
                edge.target === params.target &&
                edge.sourceHandle === params.sourceHandle &&
                edge.targetHandle === params.targetHandle
            );

            if (!edgeExists) {
                state.edges$ = addEdge(
                    { ...params, type: "floating", markerEnd: { type: MarkerType.Arrow }, data: { label: "relation", compositeGroup: null, color: "", onDelete: null, onUpdate: null } },
                    state.edges$
                );
            } else {
                console.log("edge already exists.");
            }
        },
        [state.edges$]
    );

    const newTable = () => {
        const allTables = state.nodes$.filter(x => x.type === "group");
        let highestNum = allTables.map(x => {
            const [, n] = x.id.split("_");
            return +n;
        }).sort((a, b) => b - a)[0] || 0;

        let newId = `table_${highestNum + 1}`;
        let newName = `table_${highestNum + 1}`;

        let nameExists = true;

        while (nameExists) {
            const name = allTables.find(x => x.data.name === newName);
            if (name) {
                highestNum += 1;
                newName = `table_${highestNum}`;
            } else {
                nameExists = false;
            }
        }

        const nT = [
            {
                id: newId,
                data: { name: newName, backgroundColor: randomColor() },
                position: { x: 10 + highestNum + 10, y: 200 + highestNum + 10 },
                className: "light",
                style: { backgroundColor: "#ffffff", width: "200px", padding: 0 },
                resizing: true,
                type: "group",
            },
            {
                id: `table_${highestNum + 1}/col_1`,
                type: "column",
                position: { x: 0, y: 20 },
                data: { name: "id", type: "SERIAL", unique: false, notNull: true, index: false },
                parentNode: newId, extent: "parent",
                draggable: false,
                expandParent: true,
            },
        ];

        state.nodes$ = [...state.nodes$, ...nT];
    }

    const showDbSchema = () => {
        if (schema) {
            setSchema(null);
        } else {
            setSchema(generateSqlSchema({
                nodes: state.nodes$,
                edges: state.edges$,
                primaryKey: primaryKey$.value,
                indexes: indexes$.value,
                uniqueKeys: uniqueKeys$.value,
            }))
        }
    }

    const [firstTable, setFirstTable] = useState<any[] | null>([
        {
            id: "table_1",
            data: { name: "table_1", backgroundColor: "#f78ae0", height: null },
            position: { x: 10, y: 200 },
            className: "light",
            style: { backgroundColor: "#ffffff", minWidth: "200px", padding: 0, width: 200, height: 40 },
            resizing: true,
            width: 200,
            height: 40,
            type: "group",
        },
        {
            id: "table_1/col_1",
            type: "column",
            position: { x: 0, y: 20 },
            data: { name: "id", type: "SERIAL", unique: false, notNull: true, index: false },
            parentNode: "table_1", extent: "parent",
            draggable: false,
            expandParent: true,
            width: 200,
            height: 20,
        },
    ]);

    const firstDragStart = (e: any, node: any) => {
        const nodeIndex = firstTable!.findIndex(x => x.id === node.id);
        e.dataTransfer.setData("text/plain", nodeIndex);
    };

    const firstDrop = (e: any, node: any) => {
        e.preventDefault();

        const nodeIndex = firstTable!.findIndex(x => x.id === node.id);
        const draggedPosition = parseInt(e.dataTransfer.getData("text/plain"), 10);
        e.dataTransfer.clearData();

        const parentTableId = node.parentNode;

        let reorderedNodes = [...firstTable!];

        // remove the original
        const [draggedItem] = reorderedNodes.splice(draggedPosition, 1);
        // reinsert at the new index
        reorderedNodes.splice(nodeIndex, 0, draggedItem);

        reorderedNodes = reorderedNodes.map((n, index) => {
            if (n.type !== "group" && n.parentNode === parentTableId) {
                n.position.y = (index * 20);
            }
            return n;
        });

        setFirstTable(reorderedNodes);
    };


    const firstDragOver = (e: any) => {
        e.preventDefault();
    };


    return (
        <>
            {
                currentModal$.value && <Modal onClose={() => currentModal$.value = null}>
                    <>
                        {currentModal$.value.type === "add-constraint" && <AddConstraint onClose={() => currentModal$.value = null} />}
                        {currentModal$.value.type === "add-index" && (
                            <>
                                <h3>Add index</h3>
                                <AddIndexes onClose={() => currentModal$.value = null} />
                            </>
                        )}
                        {currentModal$.value.type === "add-referential-actions" && (
                            <AddReferentialActions onClose={() => currentModal$.value = null} />
                        )}

                    </>
                </Modal>
            }
            {
                edgeOptions$.value &&
                <Modal onClose={() => edgeOptions$.value = null}>
                    <EdgeOptions />

                </Modal>
            }
            {
                state.nodes$.length === 0 && firstTable && (
                    <div className="modal">
                        <div className="modal-body">
                            <span className="heading-wrapper">
                                <h4 className="heading">Create table</h4>
                                <button type="button"
                                    className="normal-btn"
                                    onClick={() => {
                                        primaryKey$.value = {};
                                        uniqueKeys$.value = {};
                                        indexes$.value = {}
                                        state.nodes$ = [...sampleNodes];
                                        state.edges$ = [...sampleEdges];
                                        setFirstTable(null);
                                    }}>Load sample</button>
                            </span>
                            <section>
                                <div className="new-table-props">
                                    <input
                                        placeholder="table name"
                                        className="table-name-input"
                                        type="text"
                                        maxLength={20}
                                        defaultValue={firstTable[0].data.name}
                                        onChange={(e) => {
                                            const firstTableCopy = [...firstTable];
                                            firstTableCopy[0].data.name = e.target.value;
                                            setFirstTable(firstTableCopy);
                                        }}
                                    />

                                    <input
                                        type="color"
                                        style={{ height: "30px", width: "30px", border: "none" }}
                                        onBlur={() => true}
                                        onChange={(e) => {
                                            const firstTableCopy = [...firstTable];
                                            firstTableCopy[0].data.backgroundColor = e.target.value;
                                            setFirstTable(firstTableCopy);
                                        }}
                                        value={firstTable[0].data.backgroundColor}
                                        title="change table color"
                                    />
                                </div>
                                <h4 className="heading">Columns:</h4>
                                <div className="new-columns-list-wrapper">
                                    <ul className="new-columns">
                                        {
                                            firstTable.filter(x => x.type === "column").map(col => (
                                                <li
                                                    key={col.id}
                                                    draggable
                                                    onDragStart={(e) => firstDragStart(e, col)}
                                                    onDrop={(e) => firstDrop(e, col)}
                                                    onDragOver={firstDragOver}
                                                >
                                                    <div className="table-col-props-wrapper">
                                                        <div className="table-name-input-wrapper">
                                                            <span>
                                                                <Icon type="dots-grid" height="20" width="14" color="#ababab" />
                                                            </span>
                                                            <input
                                                                placeholder="column name"
                                                                className="table-name-input"
                                                                type="text"
                                                                maxLength={30}
                                                                defaultValue={col.data.name}
                                                                onChange={(e) => {
                                                                    const firstTableCopy = [...firstTable];
                                                                    const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                                    firstTableCopy[currentNodeIndex].data.name = e.target.value;
                                                                    setFirstTable(firstTableCopy);
                                                                }}
                                                            />
                                                        </div>
                                                        <Autocomplete
                                                            suggestions={POSTGRES_TYPES}
                                                            value={col.data.type}
                                                            onChange={(val) => {
                                                                const firstTableCopy = [...firstTable];
                                                                const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                                firstTableCopy[currentNodeIndex].data.type = val;
                                                                setFirstTable(firstTableCopy);
                                                            }}
                                                        />
                                                        <button
                                                            className={generateCssClass("icon-btn", { active: !col.data.notNull })}
                                                            onClick={() => {
                                                                const firstTableCopy = [...firstTable];
                                                                const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                                firstTableCopy[currentNodeIndex].data.notNull = !firstTableCopy[currentNodeIndex].data.notNull;
                                                                setFirstTable(firstTableCopy);
                                                            }}
                                                            title="nullable value"
                                                        >
                                                            <Icon type={"null"} />
                                                        </button>

                                                        <div
                                                            className={generateCssClass("icon-btn")}
                                                            title={col.data.constraint}
                                                        >
                                                            <Select
                                                                type="single" options={[
                                                                    { id: "primary_key", icon: "flag", name: "primary key" },
                                                                    { id: "unique", icon: "star", name: "unique" },
                                                                    { id: "none", icon: "circle", name: "none" },
                                                                ]}
                                                                selected={col.data.constraint}
                                                                onSelectionChange={(val) => {
                                                                    const firstTableCopy = [...firstTable];
                                                                    const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                                    firstTableCopy[currentNodeIndex].data.constraint = val;
                                                                    setFirstTable(firstTableCopy);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="icon-btn"
                                                        title="delete column"
                                                        onClick={() => {
                                                            const firstTableCopy = [...firstTable];
                                                            const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                            firstTableCopy.splice(currentNodeIndex, 1);
                                                            setFirstTable(firstTableCopy);
                                                        }}
                                                    >
                                                        <Icon type="delete" />
                                                    </button>
                                                </li>
                                            ))
                                        }

                                    </ul>
                                </div>
                                <div className="new-column-wrapper">
                                    <button type="button"
                                        className="normal-btn"
                                        onClick={() => {
                                            const tableId = firstTable[0].id;
                                            const colId = `${tableId}/${v4()}`;
                                            const n = firstTable.reduce((acc, curr) => {
                                                if (curr.type === "column") {
                                                    acc += 1;
                                                }
                                                return acc;
                                            }, 0);
                                            const colTemplate = {
                                                id: colId,
                                                type: "column",
                                                position: { x: 0, y: 20 + (n * 20) },
                                                data: { name: "new_column_" + n, type: "VARCHAR(30)", unique: false, notNull: false, index: false },
                                                parentNode: tableId, extent: "parent",
                                                draggable: false,
                                                expandParent: true,
                                            };
                                            setFirstTable([...firstTable, colTemplate])
                                        }}>+ Add column</button>
                                </div>
                            </section>
                            <footer className="modal-footer">
                                <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                    <button
                                        className="normal-btn"
                                        type="button"
                                        onClick={() => setFirstTable(null)}
                                    >Cancel</button>
                                    <button
                                        className="normal-btn"
                                        style={{ marginLeft: "0.5rem" }}
                                        onClick={() => {
                                            state.nodes$ = [...firstTable]
                                            primaryKey$.value = {};
                                            uniqueKeys$.value = {};
                                            indexes$.value = {}
                                            state.edges$ = [];
                                            setFirstTable(null);
                                        }}>
                                        OK
                                    </button>

                                </div>
                            </footer>
                        </div>
                    </div>
                )
            }
            <header className="header">
                <h3>DB diagram</h3>
                <button
                    style={{ backgroundColor: "transparent", borderRadius: "5px", border: "1px solid #9fc8b9", color: "#9fc8b9" }}
                    onClick={() => showDbSchema()}>Show DB schema</button>
                {
                    schema && <pre className="schema-preview">
                        {schema}
                    </pre>
                }
            </header>
            <div className="flow">
                <aside className={generateCssClass("aside", { hidden: sidebarHidden })}>
                    <button className="hide-btn normal-btn" onClick={() => setSidebarHidden(x => !x)}>{
                        sidebarHidden ? <Icon type="arrow-right" /> : <Icon type="arrow-left" />
                    } </button>
                    <div className="sidebar-content">
                        <button className="new-btn" onClick={newTable}><Icon type="plus" width="12" /> <span style={{ marginLeft: "1rem" }}>Add new table</span></button>
                        <nav>
                            <ul className="tables-nav">
                                {
                                    state.nodes$.filter(n => n.type === "group").map(t => (
                                        <TableSection
                                            table={t} key={t.id}
                                            isActive={selectedTable === t.id}
                                            onOpen={(tableId) => setSelectedTable(tableId)}
                                            onClose={() => setSelectedTable(null)}
                                        />
                                    ))
                                }
                            </ul>
                        </nav>
                    </div>
                </aside>
                <ReactFlow
                    ref={ref}
                    nodes={state.nodes$}
                    edges={state.edges$}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodesDelete={deleteNodes}
                    onEdgesDelete={(edges) => {
                        for (const edge of edges) {
                            const edgeIndex = state.edges$.findIndex(ed => ed.id === edge.id);
                            const edgesCopy = [...state.edges$];
                            edgesCopy.splice(edgeIndex, 1);
                            state.edges$ = edgesCopy;
                        }
                    }}
                    onNodeDragStart={(e: any) => {
                        if (e.currentTarget.dataset.id) {
                            const [table, column] = e.currentTarget.dataset.id.split("/");
                            if (column) {
                                setSelectedColumn(e.currentTarget.dataset.id);
                            }
                            setSelectedTable(table);
                        }
                    }}
                    onNodeClick={(e: any) => {
                        if (e.currentTarget.dataset.id) {
                            const [table, column] = e.currentTarget.dataset.id.split("/");
                            if (column) {
                                setSelectedColumn(e.currentTarget.dataset.id);
                            }
                            setSelectedTable(table);
                        }
                    }}
                    //@ts-ignore
                    edgeTypes={edgeTypes}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={fitViewOptions}
                    connectionMode={ConnectionMode.Loose}
                    onPaneClick={onPaneClick}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        console.log("context")
                    }}
                    onNodeContextMenu={onNodeContextMenu}
                    style={{ backgroundColor: "rgb(242 242 242)", width: "calc(100% - 300px)!important" }}
                >
                    <Controls position="bottom-right" />
                    {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
                </ReactFlow>
            </div>
        </>
    );
}