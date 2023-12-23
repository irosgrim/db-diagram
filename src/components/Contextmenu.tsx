import "../style/contex-menu.scss";
import { deleteNodes } from "./Flow";

export const ContextMenu = ({
    node,
    x, y,
    ...props
}: any) => {
    return (
        <div
            style={{
                left: `${x + 10}px`,
                top: `${y - 50}px`,
            }}
            className="context-menu"
            {...props}
        >
            <p style={{ margin: '0.5em' }}>
                <small>{node.type === "group" ? "Table" : "Column"}: {node.data.name}</small>
            </p>
            <button onClick={() => true}>meow</button>
            <button onClick={() => true}>woof</button>
            <button onClick={() => deleteNodes([node])}>Delete</button>
        </div>
    );
}
