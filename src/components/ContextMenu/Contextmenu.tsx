import { deleteNodes } from "../../App";
import "./style/context-menu.scss";

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
            {
                node !== null && <>
                    <p style={{ margin: '0.5em' }}>
                        <small>{node.type === "group" ? "Table" : "Column"}: {node.data.name}</small>
                    </p>
                    <button onClick={() => deleteNodes([node])}>Delete</button>
                </>
            }
        </div>
    );
}
