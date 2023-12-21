import 'reactflow/dist/style.css';
import "./style/main.scss";
import "./style/edge.scss"
import "./style/tables.scss"
import { Flow } from './components/Flow';
import { useEffect } from 'react';
import { indexes$, primaryKey$, state, uniqueKeys$, writeToLocalStorage } from './state/globalState';
const App = () => {

  useEffect(() => {
    writeToLocalStorage();
  }, [state.nodes$, state.edges$, primaryKey$, uniqueKeys$, indexes$])

  return (
    <>
      <Flow />
    </>
  );
}

export default App;