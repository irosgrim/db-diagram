import { useEffect, useRef, useState } from "react";
import { copiedNodes$, copyNodes, pasteNodes, selectedNodes$ } from "../../state/copyPaste";
import { deleteNodes } from "../Canvas/Canvas";
import "./style/context-menu.scss";
import { state } from "../../state/globalState";
import { saveImage } from "../Menu/exportImg";
import { exportSql } from "../../utils/sql";

export const ContextMenu = ({
    node,
    x, y,
    onClose,
    ...props
}: any) => {
    const [coords, setCoords] = useState([x, y]);
    const contextMenuRef: React.RefObject<HTMLElement> = useRef(null);
    const isTableNodeContext = node !== null;

    useEffect(() => {
        if (contextMenuRef.current) {
            const { width, height } = contextMenuRef.current.getBoundingClientRect();
            const adjustedX = (x + width > window.innerWidth) ? (window.innerWidth - (2 * width + 20)) : x;
            const adjustedY = (y + height > window.innerHeight) ? (window.innerHeight - height) : y;
            setCoords([adjustedX, adjustedY]);
        }
    }, []);

    return (
        <div
            ref={contextMenuRef}
            style={{
                left: `${coords[0] + 5}px`,
                top: `${coords[1] - 40}px`,
            }}
            className="context-menu"
            {...props}
        >
            {
                isTableNodeContext ? <>
                    <p style={{ margin: '0.5em' }}>
                        <small>Table: {node.data.name}</small>
                    </p>
                    <button type="button" onClick={() => copyNodes([node])}>Copy table</button>
                    <button type="button" onClick={() => pasteNodes()}>Paste</button>
                    <button type="button" onClick={() => deleteNodes([node])}>Delete</button>
                </>
                    :
                    <>
                        <button type="button">New table</button>
                        <button type="button" title="export sql" onClick={() => {
                            exportSql();
                            onClose();
                        }}>Export as SQL</button>
                        <button type="button" title="save as image" onClick={() => {
                            saveImage();
                            onClose();
                        }}>Save as image</button>
                        <hr />
                        <button type="button" onClick={() => {
                            const nodesCp = [...state.nodes$];
                            for (const n of nodesCp) {
                                n.selected = true;
                            }
                            state.nodes$ = nodesCp;
                            selectedNodes$.value = nodesCp;
                            onClose();
                        }}>Select all</button>
                        <button type="button" disabled={copiedNodes$.value === null} onClick={() => pasteNodes()}>Paste</button>
                    </>
            }
        </div>
    );
}
