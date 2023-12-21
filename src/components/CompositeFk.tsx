import { useEffect, useState } from "react"
import { state } from "../state/globalState";
import { v4 } from "uuid";
import { Edge, MarkerType, Node } from "reactflow";
import { randomColor } from "../utils/styling";

type CompositeFkProps = {
    sourceTable: Node;
    targetTable: Node;
    edge: Edge | null;
    onClose: () => void;
}

export const CompositeFk = ({ sourceTable, targetTable, edge, onClose }: CompositeFkProps) => {
    const [newEdges, setNewEdges] = useState<Edge[]>([]);
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
        // group the composite by a unique id
        if (newEdges.length > 0) {
            const currEdgeIdx = state.edges$.findIndex(x => x.id === edge!.id);

            const compositeGroupId = v4();
            const groupColor = randomColor(60);
            // destroy refs
            const edgesCopy = [...JSON.parse(JSON.stringify(state.edges$))];
            // first edge make to composite if not already
            edgesCopy[currEdgeIdx].data.compositeGroup = edge?.data.compositeGroup !== null ? edge?.data.compositeGroup : compositeGroupId;
            edgesCopy[currEdgeIdx].data.color = edge?.data.compositeGroup !== null ? (edge?.data.color !== "" && edge?.data.color || groupColor) : groupColor;
            delete edgesCopy[currEdgeIdx].sourceHandle;
            delete edgesCopy[currEdgeIdx].targetHandle;

            for (let newEdge of newEdges) {

                const existingEdgeIndex = edgesCopy.findIndex(e => (newEdge.id === e.id) || (e.source === newEdge.source && e.target === newEdge.target) ||
                    (e.source === newEdge.target && e.target === newEdge.source));

                if (existingEdgeIndex > -1) {
                    newEdge = { ...JSON.parse(JSON.stringify(edgesCopy[existingEdgeIndex])) }
                    edgesCopy.splice(existingEdgeIndex, 1);
                }
                newEdge.data.compositeGroup = edge?.data.compositeGroup !== null ? edge?.data.compositeGroup : compositeGroupId;
                newEdge.data.color = edge?.data.compositeGroup !== null ? (edge?.data.color !== "" && edge?.data.color || groupColor) : groupColor;
                edgesCopy.push(newEdge);
            }
            state.edges$ = edgesCopy;
        }
        onClose();
    }

    return (
        <div>
            <ul style={{ listStyleType: "none" }}>
                <li style={{ display: "flex", width: "100%" }}>
                    <h5 style={{ flex: "1" }}>From: {sourceTable.data.name}</h5>
                    <h5 style={{ flex: "1" }}>To: {targetTable.data.name}</h5>
                </li>
                {
                    newEdges.map((ed, idx) => (
                        <li key={ed.id}>
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
                        </li>
                    ))
                }
            </ul>
            <button onClick={() => newEdge()}>add key</button>
            <div>
                <button onClick={() => onClose()}>cancel</button>
                <button onClick={() => saveCompositeFk()}>save</button>
            </div>
        </div>
    )
}

