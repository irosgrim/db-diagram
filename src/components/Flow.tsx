import { useCallback, useState } from 'react';
import ReactFlow, { addEdge, applyNodeChanges, ConnectionMode, Controls, Edge, MarkerType, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import "../style/edge.scss"
import FloatingEdge from './FloatingEdge';
import CustomNode from './CustomNode';
import Column from './Column';
import { v4 } from "uuid";
import DeleteIcon from "../icons/delete.svg"
import KeyIcon from "../icons/key.svg"
import NullIcon from "../icons/null.svg"

import '../style/table.scss';
import { Table } from './Table';
import Autocomplete from './Autocomplete';

const randomColor = () => {
    const minVal = 150; // light factor
    const red = Math.floor(Math.random() * (256 - minVal) + minVal);
    const green = Math.floor(Math.random() * (256 - minVal) + minVal);
    const blue = Math.floor(Math.random() * (256 - minVal) + minVal);

    return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
}

const fitViewOptions = { padding: 4 };
const books = [
    {
        id: 'table_1',
        data: { name: 'books', nameBg: "#f78ae0" },
        position: { x: 10, y: 200 },
        className: 'light',
        style: { backgroundColor: '#ffffff', width: "200px", padding: 0 },
        resizing: true,
        type: "group",
    },

    {
        id: 'table_1/col_1',
        type: 'column',
        position: { x: 0, y: 20 },
        data: { name: "id", type: "serial", primaryKey: true, nullable: true, index: false },
        parentNode: "table_1", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: 'table_1/col_2',
        type: 'column',
        position: { x: 0, y: 40 },
        data: { name: "title", type: "varchar(50)", primaryKey: false, nullable: false, index: false },
        parentNode: "table_1", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: 'table_1/col_3',
        type: 'column',
        position: { x: 0, y: 60 },
        data: { name: "isbn", type: "varchar(50)", primaryKey: false, nullable: false, index: false },
        parentNode: "table_1", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: 'table_1/col_4',
        type: 'column',
        position: { x: 0, y: 80 },
        data: { name: "date", type: "date", primaryKey: false, nullable: false, index: false },
        parentNode: "table_1", extent: "parent",
        draggable: false,
        expandParent: true,
    },
];

const users = [
    {
        id: 'table_2',
        data: { name: 'users', nameBg: "#6638f0" },
        position: { x: 20, y: 200 },
        className: 'light',
        style: { backgroundColor: '#ffffff', width: 200, height: 20, padding: 0 },
        resizing: true,
        type: "group",
    },

    {
        id: 'table_2/col_1',
        type: 'column',
        position: { x: 0, y: 20 },
        data: { name: "id", type: "serial", primaryKey: false, nullable: false, index: false },
        parentNode: "table_2", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: 'table_2/col_2',
        type: 'column',
        position: { x: 0, y: 40 },
        data: { name: "name", type: "varchar(30)", primaryKey: false, nullable: false, index: false },
        parentNode: "table_2", extent: "parent",
        draggable: false,
        expandParent: true,
    },
    {
        id: 'table_2/col_3',
        type: 'column',
        position: { x: 0, y: 60 },
        data: { name: "age", type: "int(2)", primaryKey: false, nullable: false, index: false },
        parentNode: "table_2", extent: "parent",
        draggable: false,
        expandParent: true,
    },
];

const nodeTypes = { column: Column, group: Table, custom: CustomNode };

const edgeTypes = {
    floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];

export const Flow = () => {
    const [nodes, setNodes] = useState<any[]>([...users, ...books]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    //@ts-ignore
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

    const onNodesChange = useCallback(
        (changes: any) => {
            //@ts-ignore
            return setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );

    const onConnect = useCallback(
        //@ts-ignore
        (params) =>
            setEdges((eds) =>
                addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow }, data: { label: "meow" } }, eds)
            ),
        []
    );

    const newTable = () => {
        const highestNum = nodes.filter(x => x.type === "group").map(x => {
            const [, n] = x.id.split("_");
            return +n;
        }).sort((a, b) => b - a)[0];
        const nT = [
            {
                id: `table_${highestNum + 1}`,
                data: { name: `new_table_${highestNum + 1}`, nameBg: randomColor() },
                position: { x: 10 + highestNum + 10, y: 200 + highestNum + 10 },
                className: 'light',
                style: { backgroundColor: '#ffffff', width: "200px", padding: 0 },
                resizing: true,
                type: "group",
            },
            {
                id: `table_${highestNum + 1}/col_1`,
                type: 'column',
                position: { x: 0, y: 20 },
                data: { name: "id", type: "serial", primaryKey: true, nullable: false, index: false },
                parentNode: `table_${highestNum + 1}`, extent: "parent",
                draggable: false,
                expandParent: true,
            },
        ];

        setNodes(oldNodes => [...oldNodes, ...nT]);
    }

    return (
        <div className="flow">
            <aside style={{ backgroundColor: "#ffffff", width: "300px", height: "100%", borderRight: "1px solid rgb(220 220 220)" }}>
                <button className="new-btn" onClick={newTable}>+ New Table</button>
                <nav>
                    <ul className="tables-nav">
                        <li>
                            {
                                nodes.filter(n => n.type === "group").map(t => (
                                    <details open={selectedTable === t.id} key={t.id} style={{ borderLeft: `6px solid ${t.data.nameBg}` }}>
                                        <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>{t.data.name}</div> <button style={{ width: "40px" }}>
                                                <img src={DeleteIcon} alt="" />
                                            </button>
                                        </summary>
                                        <ul className="table-props">
                                            {
                                                nodes.filter(n => n.parentNode === t.id).map(c => (
                                                    <li className="border-bottom" key={c.id}>
                                                        <div className="row border-bottom">
                                                            <input
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
                                                                suggestions={["int", "varchar(x)", "date", "bigint", "serial", "time"]}
                                                                value={c.data.type || ""}
                                                                onChange={(value) => {
                                                                    c.data.type = value;
                                                                    const cp = [...nodes];
                                                                    setNodes(cp);
                                                                }}
                                                            />
                                                            <button>
                                                                <img src={NullIcon} alt="" />
                                                            </button>
                                                            <button>
                                                                <img src={KeyIcon} alt="" />
                                                            </button>
                                                            <button onClick={() => {

                                                                const curr = nodes.findIndex(x => x.id === c.id);
                                                                let nCopies = [...nodes];
                                                                nCopies.splice(curr, 1);

                                                                const cols = nCopies.filter(xx => {
                                                                    const [table, column] = xx.id.split("/");
                                                                    return table === t.id && column !== undefined;
                                                                })
                                                                console.log(cols.length)
                                                                let cur = -1;
                                                                const newCopies = nCopies.map((y) => {
                                                                    const [table, column] = y.id.split("/");
                                                                    console.log(table)
                                                                    if (table === t.id && column !== undefined) {
                                                                        cur += 1;
                                                                        return { ...y, position: { x: 0, y: (cur * 20) + 20 } }
                                                                    }
                                                                    if (table === t.id && column === undefined) {
                                                                        const d = { ...y, data: { ...y.data, height: 20 * cols.length }, style: { ...y.style, height: (20 * cols.length) + 20 } };
                                                                        return JSON.parse(JSON.stringify(d))
                                                                    } else {
                                                                        return y;
                                                                    }

                                                                })
                                                                //@ts-ignore
                                                                setNodes(newCopies);
                                                            }}>
                                                                <img src={DeleteIcon} alt="" />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))
                                            }
                                            <div className="row padding-top">
                                                <button>add index</button>
                                                <button onClick={() => {
                                                    const colNr: number = nodes.filter(x => {
                                                        const [table, column] = x.id.split("/");
                                                        return column !== undefined && table === t.id
                                                    }).length;

                                                    const col = {
                                                        id: `${t.id}/col_${v4()}`,
                                                        type: 'column',
                                                        position: { x: 0, y: (colNr * 20) + 20 },
                                                        data: { name: `column_${colNr}`, type: "varchar", primaryKey: false, nullable: false },
                                                        parentNode: t.id, extent: "parent",
                                                        draggable: false,
                                                        expandParent: true,
                                                    };
                                                    const newNodes = [...nodes, col];
                                                    //@ts-ignore
                                                    setNodes(newNodes)
                                                }}>+ add column</button>
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
    );
}