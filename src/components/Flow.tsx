import { useCallback, useState } from "react";
import ReactFlow, { addEdge, applyNodeChanges, ConnectionMode, Controls, Edge, MarkerType, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import "../style/edge.scss"
import FloatingEdge from "./FloatingEdge";
import Column from "./Column";
import { v4 } from "uuid";

import "../style/table.scss";
import { Table } from "./Table";
import Autocomplete from "./Autocomplete";
import { Icon } from "./Icon";
import { generateCssClass, getGoodContrastColor, randomColor } from "../utils/styling";
import { Index } from "./Index";
import { MultiSelect } from "./MultiSelect";
import { generateSqlSchema, postgresTypes } from "../utils/sql";
import { Select } from "./Select";

const fitViewOptions = { padding: 4 };
const defaultTable = [
    {
        id: "table_1",
        data: { name: "table_1", backgroundColor: "#f78ae0" },
        position: { x: 10, y: 200 },
        className: "light",
        style: { backgroundColor: "#ffffff", minWidth: "200px", padding: 0 },
        resizing: true,
        type: "group",
    },
    {
        id: "table_1/col_1",
        type: "column",
        position: { x: 0, y: 20 },
        data: { name: "id", type: "SERIAL", constraint: "primary_key", notNull: true, index: false },
        parentNode: "table_1", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: "table_2",
        data: { name: "table_2", backgroundColor: "#6638f0" },
        position: { x: 100, y: 250 },
        className: "light",
        style: { backgroundColor: "#ffffff", minWidth: "200px", padding: 0 },
        resizing: true,
        type: "group",
    },
    {
        id: "table_2/col_1",
        type: "column",
        position: { x: 0, y: 20 },
        data: { name: "id", type: "SERIAL", constraint: "primary_key", notNull: true, index: false },
        parentNode: "table_2", extent: "parent",
        draggable: false,
        expandParent: true,
    },
];

const nodeTypes = { column: Column, group: Table, index: Index, separator: ({ data }: any) => <div style={{ marginLeft: "1rem" }}>{data.label}</div> };

const edgeTypes = {
    floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];

export const Flow = () => {

    const [nodes, setNodes] = useState<any[]>([...defaultTable]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [, setSelectedColumn] = useState<string | null>(null);
    const [changingTableName, setChangingTableName] = useState<string | null>(null);
    const [schema, setSchema] = useState<string | null>(null)

    const onNodesChange = useCallback(
        (changes: any) => {
            return setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );

    const onConnect = useCallback(
        //@ts-ignore
        (params) =>
            setEdges((eds) =>
                addEdge({ ...params, type: "floating", markerEnd: { type: MarkerType.Arrow }, data: { label: "relation", type: "foreign-key" } }, eds)
            ),
        []
    );

    // useEffect(() => console.log(edges), [edges])

    const newTable = () => {
        const allTables = nodes.filter(x => x.type === "group");
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
                data: { name: "id", type: "serial", constraint: "primary_key", notNull: false, index: false },
                parentNode: newId, extent: "parent",
                draggable: false,
                expandParent: true,
            },
        ];

        setNodes(oldNodes => [...oldNodes, ...nT]);
    }

    const getProperty = (node: any) => {
        return {
            isNotNull: node.data.notNull,
            isIndex: node.data.index,
            constraint: node.data.constraint,
        }
    }

    const addColumn = (currentTable: any) => {
        const nodesCopy = [...nodes];
        const { id } = currentTable;
        let lastColumnIndex = 0;
        let colNr = 0;
        const columnNames = [];

        for (let i = 0; i < nodesCopy.length; i++) {
            if (nodesCopy[i].id === currentTable.id) {
                nodesCopy[i].data.height += 20;
                nodesCopy[i].style.height += 20;
            }

            if (nodesCopy[i].type === "column" && nodesCopy[i].parentNode === id) {
                lastColumnIndex = i;
                colNr += 1;
                columnNames.push(nodesCopy[i].data.name);
            }
            // move the indexes section down by 20px
            if ((nodesCopy[i].type === "separator" || nodesCopy[i].type === "index") && nodesCopy[i].parentNode === id) {
                nodesCopy[i].position.y += 20;
            }
        }

        let newColName = `column_${colNr}`;
        if (columnNames.indexOf(newColName) > -1) {
            newColName += "_" + 1;
        }
        const col = {
            id: `${currentTable.id}/col_${v4()}`,
            type: "column",
            position: { x: 0, y: (colNr * 20) + 20 },
            data: { name: newColName, type: "VARCHAR", constraint: "none", notNull: false },
            parentNode: currentTable.id, extent: "parent",
            draggable: false,
            expandParent: true,
        };

        nodesCopy.splice(lastColumnIndex + 1, 0, col);

        setNodes(nodesCopy)
    }

    const deleteColumn = (currentTable: any, currentColumn: any) => {

        const curr = nodes.findIndex(x => x.id === currentColumn.id);
        let nCopies = [...nodes];
        nCopies.splice(curr, 1);

        const cols = nCopies.filter(xx => xx.type !== "group" && xx.parentNode === currentTable.id);

        let cur = -1;
        const newCopies = nCopies.map((y) => {
            if (y.type !== "group" && y.parentNode === currentTable.id) {
                cur += 1;
                return { ...y, position: { x: 0, y: (cur * 20) + 20 } }
            }
            if (y.type === "group" && y.id === currentTable.id) {
                const d = { ...y, data: { ...y.data, height: 20 * cols.length }, style: { ...y.style, height: (20 * cols.length) + 20 } };
                return d;
            } else {
                return y;
            }
        });

        setNodes(newCopies);
    }

    const addIndex = (currentTable: any) => {
        const nodesCopy = [...nodes];
        let totalColumns = 0;
        let totalIndexes = 0;
        let lastIndex = 0;
        let lastColumnIndex = 0;

        for (let i = 0; i < nodes.length; i++) {
            const currNode = nodes[i];
            if (currNode.id === currentTable.id) {
                nodesCopy[i].data.height += 20;
                nodesCopy[i].style.height += 20;
            }
            if (currNode.type === "column" && currNode.parentNode === currentTable.id) {
                totalColumns += 1;
                lastColumnIndex = i;
            }
            if (currNode.type === "index" && currNode.parentNode === currentTable.id) {
                totalIndexes += 1;
                lastIndex = i;
            }
        }

        const newIndexNode = {
            id: `${currentTable.id}/index_${v4()}`,
            type: "index",
            position: { x: 0, y: (20 * (totalColumns + totalIndexes)) + 20 },
            data: { columns: [], unique: true },
            parentNode: currentTable.id,
            extent: "parent",
            draggable: false,
            expandParent: true,
        };

        if (lastIndex === 0) {
            nodesCopy.splice(lastColumnIndex + 1, 0, newIndexNode);
        } else {
            nodesCopy.splice(lastIndex + 1, 0, newIndexNode);
        }
        setNodes(nodesCopy);

    }

    const changeIndexes = (currentIndexNode: any, newIndexes: { id: string; name: string }[]) => {
        const nodesCopy = [...nodes];
        let deletion = false;
        let nodeIndexToUpdate = 0;


        if (!newIndexes.length) {
            for (let i = 0; i < nodes.length; i++) {
                const currentNode = nodes[i];

                if (currentNode.id === currentIndexNode.parentNode) {
                    nodesCopy[i].data.height -= 20;
                    nodesCopy[i].style.height -= 20;
                }
                if (currentNode.id === currentIndexNode.id) {
                    deletion = true;
                    nodeIndexToUpdate = i;
                }
                if (currentNode.type === "index" && currentNode.parentNode === currentIndexNode.parentNode && deletion === true) {
                    nodesCopy[i].position.y -= 20;
                }
            }
            nodesCopy.splice(nodeIndexToUpdate, 1);

        } else {
            const index = nodes.findIndex(x => x.id === currentIndexNode.id);
            nodes[index].data.columns = newIndexes;
        }
        setNodes(nodesCopy);
    }

    const toggleConstraint = (column: any, type: "primary_key" | "unique" | "none") => {
        let nodesCopy = [...nodes];

        for (let i = 0; i < nodesCopy.length; i++) {
            const currentNode = nodesCopy[i];
            if (currentNode.parentNode === column.parentNode && type === "primary_key" && currentNode.data.constraint === "primary_key" && currentNode.id !== column.id) {
                currentNode.data.constraint = "none";
            }
            if (currentNode.id === column.id) {
                currentNode.data.constraint = type;
            }
        }
        setNodes(nodesCopy)
    }


    const showDbSchema = () => {
        if (schema) {
            setSchema(null);
        } else {
            setSchema(generateSqlSchema(nodes, edges))
        }
    }

    const getEdgeName = (edge: any) => {
        const sourceC = edge.source;
        const targetC = edge.target;

        const sourceTable = nodes.find(x => x.id === sourceC.split("/")[0]);
        const sourceColumn = nodes.find(x => x.id === sourceC);

        const targetTable = nodes.find(x => x.id === targetC.split("/")[0]);
        const targetColumn = nodes.find(x => x.id === targetC);

        const data = {
            sourceTable: sourceTable.data.name,
            sourceColumn: sourceColumn.data.name,
            targetTable: targetTable.data.name,
            targetColumn: targetColumn.data.name
        }

        return <>
            {data.sourceColumn} to {data.targetTable}({data.targetColumn})

        </>
    }

    return (
        <>
            <header className="header">
                <h3>DB diagram</h3>
                <button onClick={() => showDbSchema()}>show db schema</button>
                {
                    schema && <pre className="schema-preview">
                        {schema}
                    </pre>
                }
            </header>
            <div className="flow">
                <aside style={{ backgroundColor: "#ffffff", width: "300px", height: "100%", borderRight: "1px solid rgb(220 220 220)" }}>
                    <button className="new-btn" onClick={newTable}>+ New Table</button>
                    <nav>
                        <ul className="tables-nav">
                            <li>
                                {
                                    nodes.filter(n => n.type === "group").map(t => (
                                        <details
                                            open={selectedTable === t.id}
                                            key={t.id}
                                            style={{ borderLeft: `6px solid ${t.data.backgroundColor}`, opacity: selectedTable === t.id ? 1 : selectedTable === null ? 1 : 0.5 }}
                                            onToggle={(e: any) => {
                                                if (e.target.open && selectedTable !== t.id) {
                                                    setSelectedTable(t.id);
                                                } else if (!e.target.open && selectedTable === t.id) {
                                                    setSelectedTable(null);
                                                }
                                            }}
                                            className="table-props-container"
                                        >
                                            <summary
                                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", backgroundColor: selectedTable === t.id ? t.data.backgroundColor : "initial" }}
                                                className="table-props"
                                            >
                                                <input
                                                    style={{ color: selectedTable === t.id ? getGoodContrastColor(t.data.backgroundColor) : "initial" }}
                                                    className="table-name-input"
                                                    type="text"
                                                    value={t.data.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        let nCopies = [...nodes];
                                                        const curr = nCopies.findIndex(x => x.id === t.id);
                                                        // TODO: prevent renaming to existing table name
                                                        nCopies[curr].data.name = value;
                                                        setNodes(nCopies);
                                                    }}
                                                    disabled={changingTableName !== t.id}
                                                />
                                                <div style={{ position: "absolute", height: "100%", width: "210px", display: changingTableName === t.id ? "none" : "block" }}></div>

                                                {
                                                    changingTableName === t.id && <input type="color" style={{ height: "30px", width: "30px", border: "none" }} value={t.data.backgroundColor} onChange={(e) => {
                                                        const value = e.target.value;
                                                        let nCopies = [...nodes];
                                                        const curr = nCopies.findIndex(x => x.id === t.id);
                                                        nCopies[curr].data.backgroundColor = value;
                                                        setNodes(nCopies);
                                                    }}
                                                        title="change table color"
                                                    />
                                                }
                                                <button
                                                    className={generateCssClass("icon-btn", { active: changingTableName === t.id })}
                                                    style={{ width: "40px", height: "40px" }}
                                                    onClick={() => setChangingTableName(x => (x === null ? t.id : null))}
                                                    title="edit table name and color"
                                                >
                                                    <Icon type="edit" color={selectedTable === t.id ? getGoodContrastColor(t.data.nameBg) : "#000000"} />
                                                </button>
                                            </summary>
                                            <ul className="table-props">
                                                {
                                                    nodes.filter(n => n.parentNode === t.id && n.type === "column").map(c => (
                                                        <li className="border-bottom" key={c.id}>
                                                            <div className="row border-bottom">
                                                                <input
                                                                    className="table-input"
                                                                    type="text"
                                                                    value={c.data.name}
                                                                    onChange={(e) => {
                                                                        c.data.name = e.target.value;
                                                                        const cp = [...nodes];
                                                                        setNodes(cp);
                                                                    }}
                                                                    style={{ width: "100px" }}
                                                                />
                                                                <Autocomplete
                                                                    suggestions={postgresTypes}
                                                                    value={c.data.type || ""}
                                                                    onChange={(value) => {
                                                                        c.data.type = value;
                                                                        const cp = [...nodes];
                                                                        setNodes(cp);
                                                                    }}
                                                                />
                                                                <button
                                                                    className={generateCssClass("icon-btn", { active: !getProperty(c).isNotNull })}
                                                                    onClick={() => {
                                                                        let nCopies = [...nodes];
                                                                        const curr = nCopies.findIndex(x => x.id === c.id);
                                                                        nCopies[curr].data.notNull = !nCopies[curr].data.notNull;
                                                                        setNodes(nCopies);
                                                                    }}
                                                                    title="nullable value"
                                                                >
                                                                    <Icon type="null" />
                                                                </button>
                                                                {/* <button
                                                                    className={generateCssClass("icon-btn", { active: getProperty(c).isPrimaryKey })}
                                                                    onClick={() => togglePrimaryKey(c)}
                                                                    title="primary key"
                                                                >
                                                                    <Icon type="key" />
                                                                </button> */}
                                                                <div
                                                                    className={generateCssClass("icon-btn")}
                                                                    title="constraint"
                                                                >
                                                                    <Select
                                                                        type="single" options={[
                                                                            { id: "primary_key", icon: "key", name: "primary key" },
                                                                            { id: "unique", icon: "star", name: "unique" },
                                                                            { id: "none", icon: "circle", name: "none" },
                                                                        ]}
                                                                        selected={c.data.constraint}
                                                                        onSelectionChange={(type) => toggleConstraint(c, type)}
                                                                    />
                                                                </div>
                                                                <button
                                                                    className="icon-btn"
                                                                    onClick={() => deleteColumn(t, c)}
                                                                    title="delete column"
                                                                >
                                                                    <Icon type="delete" />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))
                                                }
                                                <div className="row padding-top">
                                                    <button onClick={() => addColumn(t)}>+ add column</button>
                                                    <h5>Indexes::</h5>
                                                    {
                                                        nodes.filter(x => x.parentNode === t.id && x.type === "index").map(x => (
                                                            <MultiSelect
                                                                options={nodes.filter((cols) => cols.parentNode === t.id && cols.type === "column").map(cc => ({ id: cc.id, name: cc.data.name }))}
                                                                selected={x.data.columns}
                                                                onSelectionChange={(value) => changeIndexes(x, value)}
                                                                key={x.id}
                                                            />
                                                        ))
                                                    }
                                                    <button onClick={() => addIndex(t)}>add index</button>
                                                </div>
                                                <div>
                                                    <h5>Foreign Keys</h5>
                                                    {
                                                        edges.filter(x => {
                                                            const [sourceTable,] = x.source.split("/");
                                                            return sourceTable === t.id;
                                                        }).map(x => (
                                                            <div key={x.id}>
                                                                {getEdgeName(x)}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </ul>
                                        </details>
                                    ))
                                }
                            </li>
                        </ul>
                    </nav>
                </aside>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
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
                    edgeTypes={edgeTypes}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={fitViewOptions}
                    connectionMode={ConnectionMode.Loose}
                    style={{ backgroundColor: "rgb(242 242 242)", width: "calc(100% - 300px)!important" }}
                >
                    <Controls position="bottom-right" />
                </ReactFlow>
            </div>
        </>
    );
}