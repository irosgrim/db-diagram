import "reactflow/dist/style.css";
import "./style/main.scss";
import "./components/Nodes/style/nodes.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import Flow, { addEdge, applyNodeChanges, Connection, ConnectionMode, Controls, Node, Edge, MarkerType, useEdgesState, NodeChange } from "reactflow";
import { currentModal$, edgeOptions$, indexes$, localStorageCopy$, primaryKey$, selectedTable$, state, uniqueKeys$ } from './state/globalState';
import Column from './components/Nodes/Column/Column';
import { Table } from './components/Nodes/Table/Table';
import FloatingEdge from './components/Nodes/Edge/FloatingEdge';
import { useOnClickOutside } from './hooks/onClickOutside';
import { Modal } from './components/Modal/Modal';
import { AddConstraint } from './components/EditTableOptions/AddConstraint';
import { AddIndexes } from './components/EditTableOptions/AddIndexes';
import { AddReferentialActions } from './components/EditTableOptions/AddReferentialActions';
import { EdgeOptions } from './components/EditTableOptions/EdgeOption';
import { ContextMenu } from './components/ContextMenu/Contextmenu';
import { FirstTable } from './components/FirstTable/FirstTable';
import { AppHeader } from './components/AppHeader/AppHeader';
import { AppSidebar } from './components/EditTableOptions/AppSidebar';
import { RelationEdgeData } from "./types/types";
import { getLocalStorageState, writeToLocalStorage } from "./state/storage";
import { DeleteConfirm } from "./components/Dialogs/DeleteConfirm";
import { ExportDialog } from "./components/Dialogs/ExportDialog";
import { v4 } from "uuid";

const fitViewOptions = { padding: 4 };

const nodeTypes = { column: Column, group: Table, table: Table, };

const edgeTypes: Record<string, (args: any) => JSX.Element | null> = {
  floating: FloatingEdge,
};

const initialEdges: Edge<any>[] = [];

export const deleteColumn = (column: any) => {

}

export const deleteNodes = (nodesToDelete: Node[]) => {
  let nodesCopy = [...state.nodes$];
  let edgesCopy = [...state.edges$];

  for (const nodeToDelete of nodesToDelete) {
    // get the parent table of the node
    const parentTableId = nodeToDelete.parentNode;
    const parentTable = nodesCopy.find(node => node.id === parentTableId);

    if (nodeToDelete.type === "group") {
      // delete table and nodes, edges associated with table
      nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id && node.parentNode !== nodeToDelete.id);
      edgesCopy = edgesCopy.filter(edge => edge.source.split("/")[0] !== nodeToDelete.id && edge.target.split("/")[0] !== nodeToDelete.id);
    } else {
      // delete  column
      nodesCopy = nodesCopy.filter(node => node.id !== nodeToDelete.id);

      // delete indexes
      const v = indexes$.value[parentTableId!] ? indexes$.value[parentTableId!].filter(idx => idx.cols.indexOf(nodeToDelete.id) === -1) : [];
      if (v.length) {
        indexes$.value = { ...indexes$.value, [parentTableId!]: v };
      }

      // delete pk
      if (primaryKey$.value[parentTableId!]) {
        const pkCopy = { ...primaryKey$.value[parentTableId!] };
        const idx = pkCopy.cols.findIndex(x => x === nodeToDelete.id);
        pkCopy.cols.splice(idx, 1);
        primaryKey$.value = { ...primaryKey$.value, [parentTableId!]: pkCopy }
      }

      // delete unique constraint
      if (uniqueKeys$.value[parentTableId!]) {
        const unCopy = [...uniqueKeys$.value[parentTableId!]];
        const existingUn = unCopy.filter(u => !u.cols.includes(nodeToDelete.id));
        uniqueKeys$.value = { ...uniqueKeys$.value, [parentTableId!]: existingUn };
      }

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
  state.nodes$ = [...nodesCopy];
  state.edges$ = [...edgesCopy];
};

export const App = () => {

  const [, , onEdgesChange] = useEdgesState<Edge<RelationEdgeData>[]>(initialEdges);
  const [, setSelectedColumn] = useState<string | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [menu, setMenu] = useState<{ node: Node | null, x: number, y: number } | null>(null);
  const [showFirstTable, setShowFirstTable] = useState(true);
  const fkOpts = useRef(null);

  const ref = useRef(null);

  useOnClickOutside(fkOpts, () => edgeOptions$.value = null)

  useEffect(() => {

    getLocalStorageState().then(data => {
      if (data && data.value.active) {
        const { nodes, edges, primaryKey, uniqueKeys, indexes } = data.value.files[data.value.active].data;
        state.nodes$ = nodes;
        state.edges$ = edges;
        primaryKey$.value = primaryKey;
        uniqueKeys$.value = uniqueKeys;
        indexes$.value = indexes;
        console.log("Loaded state");
      }
    });
  }, []);

  useEffect(() => {
    writeToLocalStorage(localStorageCopy$.value.active);
  }, [state.nodes$, state.edges$, primaryKey$, uniqueKeys$, indexes$])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      return state.nodes$ = applyNodeChanges(changes, state.nodes$);
    },
    [state.nodes$]
  );

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
      // Assuming you have access to nodes state or can retrieve source and target nodes by their IDs
      const sourceNode = state.nodes$.find(node => node.id === params.source);
      const targetNode = state.nodes$.find(node => node.id === params.target);

      if (!sourceNode || !targetNode) {
        // Handle error or invalid nodes
        return;
      }

      const newEdge = {
        ...params,
        id: v4(),
        type: "floating",
        markerEnd: { type: MarkerType.Arrow },
        data: { label: "relation", sourceHandle: params.sourceHandle, targetHandle: params.targetHandle, compositeGroup: null, color: "", onDelete: null, onUpdate: null },

      };

      state.edges$ = addEdge(newEdge, state.edges$);
    },
    [state.edges$, state.nodes$]
  );


  const onEdgesDelete = (edges: Edge<RelationEdgeData>[]) => {
    for (const edge of edges) {
      const edgeIndex = state.edges$.findIndex(ed => ed.id === edge.id);
      const edgesCopy = [...state.edges$];
      edgesCopy.splice(edgeIndex, 1);
      state.edges$ = edgesCopy;
    }
  };

  const onNodeDragStart = (e: any) => {
    if (e.currentTarget.dataset.id) {
      const [table, column] = e.currentTarget.dataset.id.split("/");
      if (column) {
        setSelectedColumn(e.currentTarget.dataset.id);
      }
      selectedTable$.value = table;
    }
  };

  const onNodeClick = (e: any, node: Node) => {
    // console.log(e.target.id);
    // if (e.target.id) {
    //   const [table, column] = e.target.id.split("/");
    //   if (column) {
    //     setSelectedColumn(e.target.id);
    //     const colInputEl = document.getElementById("input_" + e.target.id)
    //     if (colInputEl) {
    //       colInputEl.focus();
    //     }
    //   }
    // }
    selectedTable$.value = node;
  };

  return (
    <>
      {
        state.nodes$.length === 0 && showFirstTable && (
          <FirstTable onClose={() => setShowFirstTable(false)} />
        )
      }
      {
        currentModal$.value && <Modal onClose={() => currentModal$.value = null}>
          <>
            {currentModal$.value.type === "add-constraint" && <AddConstraint onClose={() => currentModal$.value = null} />}
            {currentModal$.value.type === "add-index" && (
              <>
                <h3>Add index</h3>
                <AddIndexes onClose={() => currentModal$.value = null} />
              </>
            )}
            {currentModal$.value.type === "add-referential-actions" && (
              <AddReferentialActions onClose={() => currentModal$.value = null} />
            )}
            {
              currentModal$.value.type === "delete-confirm" && (
                <DeleteConfirm />
              )
            }
            {
              currentModal$.value.type === "export-diagram" && (
                <ExportDialog onClose={() => currentModal$.value = null} />
              )
            }
          </>
        </Modal>
      }
      {
        edgeOptions$.value &&
        <Modal onClose={() => edgeOptions$.value = null}>
          <EdgeOptions />

        </Modal>
      }

      <AppHeader />
      <div className="flow">
        <AppSidebar hidden={sidebarHidden} onShowHide={() => setSidebarHidden(!sidebarHidden)} />
        <Flow
          ref={ref}
          nodes={state.nodes$}
          edges={state.edges$}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={deleteNodes}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStart={onNodeDragStart}
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
        </Flow>
      </div>
    </>
  );
}