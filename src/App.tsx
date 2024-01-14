import "reactflow/dist/style.css";
import "./style/main.scss";
import "./components/Nodes/style/nodes.scss";
import { useEffect, useRef, useState } from "react";
import { edgeOptions$, indexes$, localStorageCopy$, primaryKey$, state, uniqueKeys$ } from './state/globalState';
import { useOnClickOutside } from './hooks/onClickOutside';
import { AppHeader } from './components/AppHeader/AppHeader';
import { AppSidebar } from './components/EditTableOptions/AppSidebar';
import { getLocalStorageState, writeToLocalStorage } from "./state/storage";
import { Canvas } from "./components/Canvas/Canvas";
import { ModalWrapper } from "./components/Modal/ModalWrapper";
import { FirstTableWrapper } from "./components/FirstTable/FirstTableWrapper";

export const App = () => {

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const fkOpts = useRef(null);

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

  return (
    <>
      <FirstTableWrapper />
      <ModalWrapper />
      <AppHeader />
      <div className="flow">
        <AppSidebar hidden={sidebarHidden} onShowHide={() => setSidebarHidden(!sidebarHidden)} />
        <Canvas />
      </div>
    </>
  );
}