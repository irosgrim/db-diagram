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
        (e.source === edgeToMatch.source && e.target === edgeToMatch.target) ||
        (e.source === edgeToMatch.target && e.target === edgeToMatch.source)
    );
}

export const CompositeFk = ({ type, sourceTable, targetTable, edge, onClose }: CompositeFkProps) => {
    const [newEdges, setNewEdges] = useState<Edge[]>([]);
    const [deleted, setDeleted] = useState<string[]>([]);
    const [onDelete, setOnDelete] = useState<ON_DELETE | null>(edge?.data.onDelete);
    const [onUpdate, setOnUpdate] = useState<ON_UPDATE | null>(edge?.data.onUpdate);


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
                color: "",
                onDelete: null,
                onUpdate: null,
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

