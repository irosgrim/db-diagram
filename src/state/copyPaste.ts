import { Node } from "reactflow";
import { TableData } from "../types/types";
import { Signal, signal } from "@preact/signals-react";
import { v4 } from "uuid";
import { selectedTable$, state } from "./globalState";

export const selectedNodes$: Signal<Node<TableData>[]> = signal([]);
export const copiedNodes$: Signal<string | null> = signal(null);

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

export const copyNodes = (selectedNodes: Node[]) => {
    const serializedNodes = JSON.stringify(selectedNodes);
    console.log(serializedNodes)
    copiedNodes$.value = serializedNodes;
};

export const pasteNodes = () => {
    const copiedNodes = copiedNodes$.value;
    if (copiedNodes) {
        const newNodes = JSON.parse(copiedNodes).map((node: Node<TableData>) => nodeClone(node));
        state.nodes$ = [...state.nodes$, ...newNodes];
    }
};

export const cloneNodesOnDrag = (nodes: Node<TableData>[]) => {
    for (const n of nodes) {
        const nodeCopy: Node<TableData> = JSON.parse(JSON.stringify(n));
        const clonedNode = nodeClone(nodeCopy);
        state.nodes$ = [...state.nodes$, clonedNode];
        selectedTable$.value = clonedNode;
    }
}
