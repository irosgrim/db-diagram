import { useEffect, useRef, useState } from "react";
import { copiedNodes$, copyNodes, pasteNodes, selectedNodes$ } from "../../state/copyPaste";
import { deleteNodes } from "../Canvas/Canvas";
import "./style/context-menu.scss";
import { state } from "../../state/globalState";
import { saveImage } from "../Menu/exportImg";
import { exportSql } from "../../utils/sql";
import { Node, useReactFlow } from "reactflow";
import { ColorPalette } from "../Nodes/Note/ColorPalette";
import { newNote, newTable } from "../../state/createNodes";


const TableMenu = ({ node }: { node: Node }) => {
    return <>
        <p style={{ margin: '0.5em' }}>
            <small>Table: {node.data.name}</small>

        </p>
        <button type="button" onClick={() => copyNodes([node])}>Copy table</button>
        <button type="button" onClick={() => pasteNodes()}>Paste</button>
        <button type="button" onClick={() => deleteNodes([node])}>Delete</button>
    </>;
};

const CanvasMenu = ({ onClose, coords }: { onClose: () => void, coords: [number, number] }) => {
    return <>
        <button type="button" onClick={() => newTable(coords)}>New table</button>

        <button type="button" title="export sql" onClick={() => {
            exportSql();
            onClose();
        }}>Export as SQL</button>
        <button type="button" title="save as image" onClick={() => {
            saveImage();
            onClose();
        }}>Save as image</button>
        <hr />
        <button type="button" onClick={() => newNote(coords)}>Add note</button>
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
    </>;
};

const NoteMenu = ({ node }: { node: Node }) => {
    const changeColor = (color: string) => {
        const nodesCopy = [...state.nodes$];
        const noteIndex = nodesCopy.findIndex(x => x.id === node.id);
        nodesCopy[noteIndex].data.backgroundColor = color;
        state.nodes$ = nodesCopy;
    }
    return <>
        <div style={{ display: "flex", position: "relative", padding: "0.5rem" }}>
            <span style={{ marginRight: "0.5rem" }}>Change color</span>
            <ColorPalette color={node.data.backgroundColor} onChange={changeColor} />
        </div>
    </>;
};

const renderMenu = (coords: [number, number], node: Node, onClose: () => void) => {
    if (node) {
        if (node.type === "table") {
            return <TableMenu node={node} />
        }
        if (node.type === "note") {
            return <NoteMenu node={node} />
        }
    } else {
        return <CanvasMenu onClose={onClose} coords={coords} />
    }
};

export const ContextMenu = ({
    node,
    x, y,
    onClose,
    ...props
}: any) => {
    const [coords, setCoords] = useState<[number, number]>([x, y]);
    const contextMenuRef: React.RefObject<HTMLElement> = useRef(null);
    const { project } = useReactFlow();

    const getXY = (): [number, number] => {
        const { x, y } = project({ x: coords[0], y: coords[1] });
        return [x, y];
    };



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
                renderMenu(getXY(), node, onClose)
            }
        </div>
    );
}
