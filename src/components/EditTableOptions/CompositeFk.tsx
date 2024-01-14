import { useEffect, useState } from "react"
import { state } from "../../state/globalState";
import { v4 } from "uuid";
import { Edge, MarkerType, Node } from "reactflow";
import { randomColor } from "../../utils/styling";
import React from "react";
import { Icon } from "../Icon";
import { ON_DELETE, ON_UPDATE } from "../../utils/sql";
import { ReferentialActions } from "./ReferentialActions";

type CompositeFkProps = {
    sourceTable: Node;
    targetTable: Node;
    edge: Edge | null;
    type: "simple-fk" | "composite-fk";
    onClose: () => void;
}


const setCompositeGroupAndColor = (edge: Edge, groupId: string, color: string, onDelete: ON_DELETE, onUpdate: ON_UPDATE) => {
    edge.data.compositeGroup = groupId;
    edge.data.color = color;
    edge.data.onDelete = onDelete;
    edge.data.onUpdate = onUpdate;
    delete edge.sourceHandle;
    delete edge.targetHandle;
}

const findMatchingEdgeIndex = (edges: Edge[], edgeToMatch: Edge) => {
    return edges.findIndex(e =>
        edgeToMatch.id === e.id ||
        (e.data.sourceHandle === edgeToMatch.data.sourceHandle && e.data.targetHandle === edgeToMatch.data.targetHandle) ||
        (e.data.sourceHandle === edgeToMatch.data.targetHandle && e.data.targetHandle === edgeToMatch.data.sourceHandle)
    );
}

export const CompositeFk = ({ type, sourceTable, targetTable, edge, onClose }: CompositeFkProps) => {
    const [newEdges, setNewEdges] = useState<Edge[]>([]);
    const [deleted, setDeleted] = useState<string[]>([]);
    const [onDelete, setOnDelete] = useState<ON_DELETE | null>(edge?.data.onDelete);
    const [onUpdate, setOnUpdate] = useState<ON_UPDATE | null>(edge?.data.onUpdate);


    const [, setSelectedColumn] = useState<any | null>(null);

    useEffect(() => {
        if (edge?.data.compositeGroup !== null) {

            const wholeGroup = state.edges$.filter(x => x.data!.compositeGroup === edge?.data.compositeGroup);
            setNewEdges(wholeGroup);
        } else {
            setNewEdges([...newEdges, edge])
        }
    }, []);

    const newEdge = () => {
        setSelectedColumn(null);
        const emptyEdge: Edge = {
            source: sourceTable.id,
            target: targetTable.id,
            type: "floating",
            markerEnd: {
                type: MarkerType.Arrow
            },
            data: {
                sourceHandle: edge?.data.sourceHandle.slice(0, 2),
                targetHandle: edge?.data.targetHandle.slice(0, 2),
                compositeGroup: null,
                color: "",
                onDelete: null,
                onUpdate: null,
            },
            id: v4()
        }
        setNewEdges([...newEdges, emptyEdge]);
    }


    const handleChange = (edge: Edge, value: string, target: "source" | "target", index: number) => {
        if (value) {
            const lrSource = edge.data.sourceHandle.split(":");
            const lrTarget = edge.data.targetHandle.split(":");
            const col = sourceTable.data.columns.find((c: any) => c.id === value);
            setSelectedColumn(col)
            const edgesCopy = [...newEdges];
            if (target === "source") {
                edgesCopy[index].data.sourceHandle = lrSource[0] + ":" + value;
            }
            if (target === "target") {
                edgesCopy[index].data.targetHandle = lrTarget[0] + ":" + value;
            }
            setNewEdges(edgesCopy);
        }
    }

    const saveCompositeFk = () => {
        const newEdgesCp = type === "simple-fk" ? [newEdges.find(x => x.id === edge!.id)!] : [...newEdges];
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
        let compositeGroupId = isExistingComposite ? edge!.data.compositeGroup : v4();
        let groupColor = isExistingComposite ? (edge!.data.color || color) : color;
        if (type === "simple-fk") {
            compositeGroupId = null;
            groupColor = "";
        }

        newEdgesCp.forEach(newEdge => {
            const existingEdgeIndex = findMatchingEdgeIndex(edgesCopy, newEdge);
            if (existingEdgeIndex > -1) {
                // if the edge already exists, update its properties
                let edd = { ...edgesCopy[existingEdgeIndex] };
                edgesCopy.splice(existingEdgeIndex, 1);
                setCompositeGroupAndColor(newEdge, compositeGroupId, groupColor, onDelete, onUpdate);
                edd = { ...edd, ...newEdge }
                edgesCopy.push(edd);

            } else {
                setCompositeGroupAndColor(newEdge, compositeGroupId, groupColor, onDelete, onUpdate);
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
                    (<div style={{ display: "flex", justifyContent: "center" }}>Delete it?</div>) :
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        <li className="col-select-wrapper">
                            <h5 style={{ flex: "1" }}>From: {sourceTable.data.name}</h5>
                            <div></div>
                            <h5 style={{ flex: "1" }}>To: {targetTable.data.name}</h5>
                            <div style={{ width: "2rem" }}></div>
                        </li>
                        {
                            (type === "simple-fk" ? [newEdges.find(x => x.id === edge!.id)!] : newEdges).map((ed, idx) => {
                                const isDeleted = deleted.includes(ed.id);
                                const sourceColId = ed.data.sourceHandle?.split(":")[1];
                                const targetColId = ed.data.targetHandle?.split(":")[1];

                                if (isDeleted) {
                                    return <React.Fragment key={ed.id}></React.Fragment>
                                }
                                return (
                                    <li key={ed.id} className="col-select-wrapper">
                                        <select
                                            onChange={(e) => handleChange(ed, e.target.value, "source", idx)}
                                            defaultValue={sourceColId}
                                        >
                                            <option
                                                value=""
                                            >
                                                select column
                                            </option>
                                            {
                                                sourceTable.data.columns.map((c: any) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >{c.name} - {c.type} - {c.notNull ? "NOT NULL" : ""}</option>
                                                ))
                                            }
                                        </select>
                                        &rarr;
                                        <select
                                            onChange={(e) => handleChange(ed, e.target.value, "target", idx)}
                                            defaultValue={targetColId}
                                        >
                                            <option
                                                value="-"
                                            >
                                                select column
                                            </option>
                                            {
                                                targetTable.data.columns.map((c: any) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >{c.name} - {c.type} - {c.notNull ? "NOT NULL" : ""}</option>
                                                ))
                                            }
                                        </select>
                                        <button type="button" onClick={() => deleteFk(ed)} className="icon-btn" title="delete key"><Icon type="delete" style={{ visibility: (ed.source || ed.target) ? "visible" : "hidden" }} /></button>
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
            {(newEdges.length > 0 && !newEdges.every(edge => deleted.includes(edge.id))) && <div className="fk-ref-actions-wrapper">
                <ReferentialActions
                    onChangeDelete={setOnDelete}
                    onChangeUpdate={setOnUpdate}
                    defaultOnDelete={edge?.data.onDelete}
                    defaultOnUpdate={edge?.data.onUpdate}
                />
                {type === "composite-fk" && <button type="button"
                    onClick={() => newEdge()}
                    className="add-btn">
                    <Icon type="plus" />
                    <span style={{ marginLeft: "0.5rem" }}>
                        Add fkey
                    </span>
                </button>}
            </div>}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => onClose()} className="normal-btn">Cancel</button>
                <button type="button" onClick={() => saveCompositeFk()} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Save</button>
            </div>
        </div>
    )
}

