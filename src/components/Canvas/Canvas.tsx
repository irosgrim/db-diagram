import Flow, { addEdge, applyNodeChanges, Connection, ConnectionMode, Controls, Node, Edge, MarkerType, useEdgesState, NodeChange } from "reactflow";
import { Table } from "../Nodes/Table/Table";
import FloatingEdge from "../Nodes/Edge/FloatingEdge";
import { selectedTable$, state } from "../../state/globalState";
import { useCallback, useEffect, useRef, useState } from "react";
import { RelationEdgeData, TableData } from "../../types/types";
import { v4 } from "uuid";
import { ContextMenu } from "../ContextMenu/Contextmenu";
import { cloneNodesOnDrag, copyNodes, cutNodes, pasteNodes, selectedEdges$, selectedNodes$ } from "../../state/copyPaste";


const fitViewOptions = { padding: 4 };

const nodeTypes = { table: Table, };

const edgeTypes: Record<string, (args: any) => JSX.Element | null> = {
    floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];

export const deleteNodes = (nodesToDelete: Node[]) => {
    let nodesCopy = [...state.nodes$];
    let edgesCopy = [...state.edges$];

    for (const nodeToDelete of nodesToDelete) {

        // delete table and edges associated with table
        nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id);
        edgesCopy = edgesCopy.filter(edge => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id);
    }

    // Update the state
    state.nodes$ = [...nodesCopy];
    state.edges$ = [...edgesCopy];
};


const onNodeClick = (_: any, node: Node) => {
    if (node) {
        selectedTable$.value = node;
    }
};


export const onNodeDragStart = (e: any, node: Node<TableData>, nodes: Node<TableData>[]) => {
    if (e.altKey) {
        cloneNodesOnDrag(nodes)

    } else {
        selectedTable$.value = node;
    }
};



export const Canvas = () => {
    const [, , onEdgesChange] = useEdgesState<Edge<RelationEdgeData>[]>(initialEdges);

    const [menu, setMenu] = useState<{ node: Node | null, x: number, y: number } | null>(null);

    const ref = useRef(null);
    const onNodesChange = (changes: NodeChange[]) => {
        state.nodes$ = applyNodeChanges(changes, state.nodes$);
        return state.nodes$;
    }

    const onNodeContextMenu = useCallback(
        (event: any, node?: Node) => {
            event.preventDefault();
            setMenu({
                node: node || null,
                x: event.clientX,
                y: event.clientY
            });
        },
        [setMenu],
    );

    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    const onConnect = useCallback(
        (params: Connection) => {
            const { sourceHandle, targetHandle } = params;
            const newEdge = {
                ...params,
                id: v4(),
                type: "floating",
                markerEnd: { type: MarkerType.Arrow },
                data: {
                    sourceHandle,
                    targetHandle,
                    compositeGroup: null,
                    color: "",
                    onDelete: null,
                    onUpdate: null
                },
            };

            state.edges$ = addEdge(newEdge, state.edges$);
        },
        [state.edges$, state.nodes$]
    );

    const onEdgesDelete = (edges: Edge<RelationEdgeData>[]) => {
        const edgesCopy = [...state.edges$];
        for (const edge of edges) {
            const edgeIndex = state.edges$.findIndex(ed => ed.id === edge.id);
            if (edgeIndex > -1) {
                edgesCopy.splice(edgeIndex, 1);
            }
        }
        state.edges$ = edgesCopy;
    };

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'c':
                        copyNodes(selectedNodes$.value, selectedEdges$.value);
                        break;
                    case "x":
                        cutNodes(selectedNodes$.value, selectedEdges$.value);
                        break;
                    case 'v':
                        pasteNodes();
                        break;
                    default:
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedNodes$.value]);

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                event.preventDefault();

                const updatedNodes = state.nodes$.map(node => ({ ...node, selected: true }));
                state.nodes$ = updatedNodes;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    return (<Flow
        ref={ref}
        onSelectionChange={(p) => {
            selectedNodes$.value = p.nodes;
            selectedEdges$.value = p.edges;
        }}
        nodes={state.nodes$}
        edges={state.edges$}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => onEdgesChange(changes)}
        onConnect={onConnect}
        onNodesDelete={deleteNodes}
        onEdgesDelete={onEdgesDelete}
        onNodeDragStart={(e, n, nodes) => onNodeDragStart(e, n, nodes)}
        onNodeClick={onNodeClick}
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
    </Flow>)
}