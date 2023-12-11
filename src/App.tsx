import 'reactflow/dist/style.css';
import "./style/main.scss";
import "./style/edge.scss"
import { Flow } from './components/Flow';
const App = () => {

  return (
    <>
      <header className="header">
        <input type="text" value="ma_db" className="db-name" />
      </header>
      <Flow />
    </>
  );
}

export default App;