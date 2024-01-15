import { copyNodes, pasteNodes } from "../../state/copyPaste";
import { deleteNodes } from "../Canvas/Canvas";
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
                        <small>Table: {node.data.name}</small>
                    </p>
                    <button type="button" onClick={() => copyNodes([node])}>Copy table</button>
                    <button type="button" onClick={() => pasteNodes()}>Paste</button>
                    <button type="button" onClick={() => deleteNodes([node])}>Delete</button>
                </>
            }
        </div>
    );
}
