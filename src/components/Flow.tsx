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
import { generateCssClass, getGoodContrastColor, randomColor } from "../utils/styling";
import { Index } from "./Index";
import { MultiSelect } from "./MultiSelect";
import { generateSqlSchema, postgresTypes } from "../utils/sql";
import { Select } from "./Select";
import { sampleEdges, sampleNodes } from "./sample";
import { edgeOptions } from "../state/globalState";
import { useOnClickOutside } from "../hooks/onClickOutside";

const fitViewOptions = { padding: 4 };
const defaultTable: any = [];

const nodeTypes = { column: Column, group: Table, index: Index, separator: ({ data }: any) => <div style={{ marginLeft: "1rem" }}>{data.label}</div> };

const edgeTypes = {
    floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];


export const Flow = () => {

    const [nodes, setNodes] = useState<any[]>([...defaultTable]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any[]>(initialEdges);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [, setSelectedColumn] = useState<string | null>(null);
    const [changingTableName, setChangingTableName] = useState<string | null>(null);
    const [schema, setSchema] = useState<string | null>(null);
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const fkOpts = useRef(null);

    useOnClickOutside(fkOpts, () => edgeOptions.value = { ...edgeOptions.value, showEdgeOptions: null })

    const onNodesChange = useCallback(
        (changes: any) => {
            return setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );

    const onConnect = useCallback(
        (params: any) => {
            const edgeExists = edges.some(edge =>
                edge.source === params.source &&
                edge.target === params.target &&
                edge.sourceHandle === params.sourceHandle &&
                edge.targetHandle === params.targetHandle
            );

            if (!edgeExists) {
                setEdges((eds) =>
                    addEdge(
                        { ...params, type: "floating", markerEnd: { type: MarkerType.Arrow }, data: { label: "relation", type: "foreign-key" } },
                        eds
                    )
                );
            } else {
                console.log("This edge already exists.");
            }
        },
        [edges, setEdges]
    );

    // useEffect(() => console.log({ edges, nodes }), [edges, nodes])

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
                data: { name: "id", type: "SERIAL", constraint: "primary_key", notNull: true, index: false },
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

    const deleteNodes = (nodesToDelete: any[]) => {
        let nodesCopy = [...nodes];
        let edgesCopy = [...edges];

        for (const nodeToDelete of nodesToDelete) {
            // getthe parent table of the node
            const parentTableId = nodeToDelete.parentNode;
            const parentTable = nodesCopy.find(node => node.id === parentTableId);

            if (nodeToDelete.type === "group") {
                // delete table and nodes, edges associated with table
                nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id && node.parentNode !== nodeToDelete.id);
                edgesCopy = edgesCopy.filter(edge => edge.source.split("/")[0] !== nodeToDelete.id && edge.target.split("/")[0] !== nodeToDelete.id);
            } else {
                // delete  column
                nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id);

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
        setNodes(nodesCopy);
        setEdges(edgesCopy);
    };


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

    const handleDragStart = (e: any, node: any) => {
        const nodeIndex = nodes.findIndex(x => x.id === node.id);
        e.dataTransfer.setData("text/plain", nodeIndex);
    };

    const handleDrop = (e: any, node: any) => {
        e.preventDefault();

        const nodeIndex = nodes.findIndex(x => x.id === node.id);
        const parentIndex = nodes.findIndex(x => x.id === node.parentNode);
        const draggedPosition = parseInt(e.dataTransfer.getData("text/plain"), 10);
        e.dataTransfer.clearData();

        const parentTableId = node.parentNode;

        let reorderedNodes = [...nodes];

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

        setNodes(reorderedNodes);
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
    };

    const [firstTable, setFirstTable] = useState<any[] | null>([
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

        // Assuming the parent table ID is stored in a property like `parentNode`
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
                edgeOptions.value.showEdgeOptions &&
                <div className="modal">
                    <div className="modal-body" ref={fkOpts}>
                        <ul>
                            <li><button onClick={() => edgeOptions.value = { ...edgeOptions.value, fkType: { ...edgeOptions.value.fkType, [edgeOptions.value.showEdgeOptions]: "simple" } }}>simple fk</button></li>
                            <li><button onClick={() => edgeOptions.value = { ...edgeOptions.value, fkType: { ...edgeOptions.value.fkType, [edgeOptions.value.showEdgeOptions]: "composite" } }}>composite fk</button></li>
                        </ul>
                    </div>
                </div>
            }
            {
                firstTable && (
                    <div className="modal">
                        <div className="modal-body">
                            <span className="heading-wrapper">
                                <h4 className="heading">Create table</h4>
                                <button type="button" onClick={() => {
                                    setNodes(sampleNodes);
                                    //@ts-ignore
                                    setEdges(sampleEdges);
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
                                                            suggestions={postgresTypes}
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
                                                                    { id: "primary_key", icon: "key", name: "primary key" },
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
                                    <button type="button" onClick={() => {
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
                                            data: { name: "new_column_" + n, type: "VARCHAR(30)", constraint: "none", notNull: false, index: false },
                                            parentNode: tableId, extent: "parent",
                                            draggable: false,
                                            expandParent: true,
                                        };
                                        setFirstTable([...firstTable, colTemplate])
                                    }}>+ add column</button>
                                </div>
                            </section>
                            <footer className="modal-footer">
                                <span>
                                    <button onClick={() => {
                                        setNodes(firstTable);
                                        setFirstTable(null);
                                    }}>
                                        OK
                                    </button>
                                    <button type="button" onClick={() => setFirstTable(null)}>Cancel</button>
                                </span>
                            </footer>
                        </div>
                    </div>
                )
            }
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
                <aside className={generateCssClass("aside", { hidden: sidebarHidden })}>
                    <button className="hide-btn" onClick={() => setSidebarHidden(x => !x)}>{
                        sidebarHidden ? "►" : "◀︎"
                    } </button>
                    <div className="sidebar-content">
                        <button className="new-btn" onClick={newTable}>+ New Table</button>
                        <nav>
                            <ul className="tables-nav">
                                {
                                    nodes.filter(n => n.type === "group").map(t => (
                                        <li key={t.id}>
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
                                                        style={{ color: changingTableName !== t.id ? getGoodContrastColor(t.data.backgroundColor) : "initial" }}
                                                        className="table-name-input"
                                                        type="text"
                                                        maxLength={20}
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
                                                        changingTableName === t.id && (
                                                            <>
                                                                <button
                                                                    style={{ backgroundColor: "#ffffff", border: "1px solid #000000", height: "22px", width: "22px" }}
                                                                    onClick={() => setChangingTableName(null)}
                                                                >
                                                                    <Icon type="check" />
                                                                </button>
                                                                <input
                                                                    type="color"
                                                                    style={{ height: "30px", width: "30px", border: "none" }}
                                                                    value={t.data.backgroundColor}
                                                                    onBlur={() => setChangingTableName(null)}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        let nCopies = [...nodes];
                                                                        const curr = nCopies.findIndex(x => x.id === t.id);
                                                                        nCopies[curr].data.backgroundColor = value;
                                                                        setNodes(nCopies);
                                                                    }}
                                                                    title="change table color"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    <button
                                                        className={generateCssClass("icon-btn", { active: changingTableName === t.id })}
                                                        style={{ width: "40px", height: "40px" }}
                                                        onClick={() => setChangingTableName(x => (x === null ? t.id : null))}
                                                        title="edit table name and color"
                                                    >
                                                        <Icon type="edit" color={selectedTable === t.id ? getGoodContrastColor(t.data.backgroundColor) : "#000000"} />
                                                    </button>
                                                </summary>
                                                <ul className="table-props">
                                                    {
                                                        nodes.filter(n => n.parentNode === t.id && n.type === "column").map((c) => (
                                                            <li
                                                                className="border-bottom"
                                                                key={c.id}
                                                                onDragStart={(e) => handleDragStart(e, c)}
                                                                onDrop={(e) => handleDrop(e, c)}
                                                                onDragOver={handleDragOver}
                                                                draggable
                                                            >
                                                                <div className="row border-bottom">
                                                                    <input
                                                                        className="table-input"
                                                                        type="text"
                                                                        maxLength={30}
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
                                                                            onSelectionChange={(type) => toggleConstraint(c, type as "primary_key" | "unique" | "none")}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        className="icon-btn"
                                                                        onClick={() => deleteNodes([c])}
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
                                        </li>
                                    ))
                                }
                            </ul>
                        </nav>
                    </div>
                </aside>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodesDelete={deleteNodes}
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