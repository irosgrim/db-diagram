import { Node } from "reactflow";
import { RelationEdge, TableData, TableNode } from "../types/types";
import { Signal, signal } from "@preact/signals-react";
import { v4 } from "uuid";
import { selectedTable$, state } from "./globalState";

export const selectedNodes$: Signal<TableNode[]> = signal([]);
export const selectedEdges$: Signal<RelationEdge[]> = signal([]);

export const copiedNodes$: Signal<string | null> = signal(null);
export const copiedEdges$: Signal<string | null> = signal(null);


export const nodeClone = (node: Node<TableData>) => {
    const tableId = "table_" + v4();
    const newIds = node.data.columns.map(x => {
        x.id = tableId + "/col_" + v4();
        return x;
    });
    node.data.columns = newIds;
    node.data.name = "copy_of_" + node.data.name;
    return {
        ...node,
        id: tableId,
        position: { x: node.position.x + 20, y: node.position.y + 20 },
    }
}

export const copyNodes = (selectedNodes: TableNode[], selectedEdges?: RelationEdge[]) => {
    const serializedNodes = JSON.stringify(selectedNodes);
    copiedNodes$.value = serializedNodes;

    if (selectedEdges) {
        const serializedEdges = JSON.stringify(selectedEdges);
        copiedEdges$.value = serializedEdges;
    }
};

export const cutNodes = (selectedNodes: TableNode[], selectedEdges?: RelationEdge[]) => {
    const serializedNodes = JSON.stringify(selectedNodes);
    copiedNodes$.value = serializedNodes;

    const stateNodesCp: TableNode[] = JSON.parse(JSON.stringify(state.nodes$));
    for (const node of selectedNodes) {
        const nodeIndex = stateNodesCp.findIndex(x => x.id === node.id)
        stateNodesCp.splice(nodeIndex, 1);
    }
    state.nodes$ = stateNodesCp;
    if (selectedEdges) {
        const serializedEdges = JSON.stringify(selectedEdges);
        copiedEdges$.value = serializedEdges;
    }
};

export const pasteNodes = () => {
    const copiedNodes = copiedNodes$.value;
    const copiedEdges = copiedEdges$.value;

    if (copiedNodes) {
        const cpNodes: TableNode[] = JSON.parse(copiedNodes);
        const stateNodes: TableNode[] = JSON.parse(JSON.stringify(state.nodes$));

        for (const n of cpNodes) {
            const nIndex = stateNodes.findIndex(nn => nn.id === n.id);
            if (nIndex > -1) {
                stateNodes[nIndex].selected = false;
            }
        }
        const newNodes = cpNodes.map((node: Node<TableData>) => nodeClone(node));
        state.nodes$ = [...stateNodes, ...newNodes];
        if (copiedEdges) {
            // todo: check that edges are not hanging
            // remap the id, and sourceHandle, targetHandle in data and outside
        }
    }
};

export const cloneNodesOnDrag = (nodes: Node<TableData>[]) => {
    const nodesCopy: Node<TableData>[] = JSON.parse(JSON.stringify(state.nodes$));

    const nodeIds = nodes.map(n => n.id);
    for (let i=0; i < nodes.length; i++) {
        const n = nodes[i];
        const clonedNode = nodeClone(n);
        nodesCopy.push(clonedNode);
    }
    for (const nodeId of nodeIds) {
        const nodeIndex = nodesCopy.findIndex(x => x.id === nodeId);
        if (nodeIndex > -1) {
            nodesCopy[nodeIndex].selected = false;
        }
    }
    state.nodes$ = nodesCopy;
    selectedTable$.value = nodesCopy[nodesCopy.length - 1];
}
