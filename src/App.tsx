import 'reactflow/dist/style.css';
import "./style/main.scss";
import "./style/edge.scss"
import { Flow } from './components/Flow';
const App = () => {

  return (
    <>
      <header className="header">
        <h3>DB diagram</h3>
        <span></span>
      </header>
      <Flow />
    </>
  );
}

export default App;