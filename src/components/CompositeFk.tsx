import { useEffect, useState } from "react"
import { state } from "../state/globalState";
import { v4 } from "uuid";
import { Edge, MarkerType, Node } from "reactflow";
import { randomColor } from "../utils/styling";
import React from "react";
import { Icon } from "./Icon";

type CompositeFkProps = {
    sourceTable: Node;
    targetTable: Node;
    edge: Edge | null;
    onClose: () => void;
}


const setCompositeGroupAndColor = (edge: Edge, groupId: string, color: string) => {
    edge.data.compositeGroup = groupId;
    edge.data.color = color;
    delete edge.sourceHandle;
    delete edge.targetHandle;
}

const findMatchingEdgeIndex = (edges: Edge[], edgeToMatch: Edge) => {
    return edges.findIndex(e =>
        edgeToMatch.id === e.id ||
        (e.source === edgeToMatch.source && e.target === edgeToMatch.target) ||
        (e.source === edgeToMatch.target && e.target === edgeToMatch.source)
    );
}

export const CompositeFk = ({ sourceTable, targetTable, edge, onClose }: CompositeFkProps) => {
    const [newEdges, setNewEdges] = useState<Edge[]>([]);
    const [deleted, setDeleted] = useState<string[]>([]);

    const [, setSelectedColumn] = useState<any | null>(null);
    const sourceColumns = state.nodes$.filter(x => x.parentNode === sourceTable.id);
    const targetColumns = state.nodes$.filter(x => x.parentNode === targetTable.id);

    useEffect(() => {
        if (edge?.data.compositeGroup !== null) {

            const wholeGroup = state.edges$.filter(x => x.data.compositeGroup === edge?.data.compositeGroup);
            setNewEdges(wholeGroup);
        } else {
            setNewEdges([...newEdges, edge])
        }
    }, []);

    const newEdge = () => {
        setSelectedColumn(null);
        const emptyEdge: Edge = {
            source: "",
            target: "",
            type: "floating",
            markerEnd: {
                type: MarkerType.Arrow
            },
            data: {
                label: "relation",
                compositeGroup: null,
                color: ""
            },
            id: v4()
        }
        setNewEdges([...newEdges, emptyEdge]);
    }


    const handleChange = (value: string, target: "source" | "target", index: number) => {
        if (value) {
            const col = sourceColumns.find(c => c.id === value);
            setSelectedColumn(col)
            const edgesCopy = [...newEdges];
            if (target === "source") {
                edgesCopy[index].source = value;
            }
            if (target === "target") {
                edgesCopy[index].target = value;
            }
            setNewEdges(edgesCopy);
        }
    }

    const saveCompositeFk = () => {
        const newEdgesCp = [...newEdges];
        const edgesCopy = [...state.edges$];

        if (deleted.length) {
            for (const d of deleted) {
                const idx = edgesCopy.findIndex(x => x.id === d);
                const idxNew = newEdgesCp.findIndex(x => x.id === d);
                newEdgesCp.splice(idxNew, 1);
                edgesCopy.splice(idx, 1);
            }
            setDeleted([]);
            setNewEdges(newEdgesCp);
            state.edges$ = edgesCopy;
        }

        if (newEdgesCp.length === 0) {
            onClose();
            return;
        }
        const color = randomColor(60);
        // const currEdgeIdx = state.edges$.findIndex(x => x.id === edge!.id);

        const isExistingComposite = edge!.data.compositeGroup !== null;
        const compositeGroupId = isExistingComposite ? edge!.data.compositeGroup : v4();
        const groupColor = isExistingComposite ? (edge!.data.color || color) : color;


        newEdgesCp.forEach(newEdge => {
            const existingEdgeIndex = findMatchingEdgeIndex(edgesCopy, newEdge);
            if (existingEdgeIndex > -1) {
                // if the edge already exists, update its properties
                let edd = { ...edgesCopy[existingEdgeIndex] };
                edgesCopy.splice(existingEdgeIndex, 1);
                setCompositeGroupAndColor(newEdge, compositeGroupId, groupColor);
                edd = { ...edd, ...newEdge }
                edgesCopy.push(edd);

            } else {
                setCompositeGroupAndColor(newEdge, compositeGroupId, groupColor);
                edgesCopy.push(newEdge);
            }
        });

        state.edges$ = edgesCopy;
        onClose();
    };

    const deleteFk = (edge: Edge) => {
        setDeleted([...deleted, edge.id]);
    }

    return (
        <div>
            {
                (newEdges.length === 0 || newEdges.every(edge => deleted.includes(edge.id))) ?
                    (<div style={{ display: "flex", justifyContent: "center" }}>No composite key!</div>) :
                    <ul style={{ listStyleType: "none" }}>
                        <li style={{ display: "flex", width: "100%" }}>
                            <h5 style={{ flex: "1" }}>From: {sourceTable.data.name}</h5>
                            <h5 style={{ flex: "1" }}>To: {targetTable.data.name}</h5>
                        </li>
                        {
                            newEdges.map((ed, idx) => {
                                const isDeleted = deleted.includes(ed.id);
                                if (isDeleted) {
                                    return <React.Fragment key={ed.id}></React.Fragment>
                                }
                                return (
                                    <li key={ed.id} className="col-select-wrapper">
                                        <select
                                            onChange={(e) => handleChange(e.target.value, "source", idx)}
                                            defaultValue={ed.source}
                                        >
                                            <option
                                                value=""
                                            >
                                                select column
                                            </option>
                                            {
                                                sourceColumns.map(c => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                        onClick={() => console.log("clicked ", c)}
                                                    >{c.data.name} - {c.data.type} - {c.data.notNull ? "NOT NULL" : ""}</option>
                                                ))
                                            }
                                        </select>
                                        &rarr;
                                        <select
                                            onChange={(e) => handleChange(e.target.value, "target", idx)}
                                            defaultValue={ed.target}
                                        >
                                            <option
                                                value="-"
                                            >
                                                select column
                                            </option>
                                            {
                                                targetColumns.map(c => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >{c.data.name} - {c.data.type} - {c.data.notNull ? "NOT NULL" : ""}</option>
                                                ))
                                            }
                                        </select>
                                        {
                                            (ed.source || ed.target) && <button onClick={() => deleteFk(ed)} className="icon-btn" title="delete key"><Icon type="delete" /></button>
                                        }
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
            <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => newEdge()} className="add-btn"><Icon type="plus" /> <span style={{ marginLeft: "0.5rem" }}>Add key</span></button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => onClose()} className="normal-btn">Cancel</button>
                <button onClick={() => saveCompositeFk()} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Save</button>
            </div>
        </div>
    )
}

