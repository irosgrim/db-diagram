import { NodeProps } from "reactflow"
import { useOnClickOutside } from "../../../hooks/onClickOutside"
import { useRef, useState } from "react";
import { generateCssClass } from "../../../utils/styling";
import { state } from "../../../state/globalState";

const unselect = () => {
    if (window.getSelection) {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
    }
}

export const Note = ({ id, data }: NodeProps) => {
    const [isTextEditMode, setIsTextEditMode] = useState(false);

    const noteNodeRef = useRef(null);
    const txtRef = useRef(null);

    useOnClickOutside(noteNodeRef, () => {
        setIsTextEditMode(false);
        unselect();
    });

    useOnClickOutside(txtRef, () => { setIsTextEditMode(false); unselect() });


    return <div
        style={{ position: "relative", flexGrow: 1, backgroundColor: data.backgroundColor }}
        ref={noteNodeRef}
    >
        {
            !isTextEditMode && <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    zIndex: 2,
                }}
                onDoubleClick={() => setIsTextEditMode(true)}
            ></div>
        }
        <textarea
            ref={txtRef}
            readOnly={!isTextEditMode}
            className={generateCssClass("note", { active: isTextEditMode })}

            value={data.text}
            onChange={(e) => {
                const nodesCopy = [...state.nodes$];
                const noteIndex = nodesCopy.findIndex(x => x.id === id);
                nodesCopy[noteIndex].data.text = e.target.value;
                state.nodes$ = nodesCopy;
            }}
        />
    </div>
}