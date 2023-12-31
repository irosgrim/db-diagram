import { useState } from "react"
import { currentModal$, state } from "../../state/globalState"
import { ReferentialActions } from "./ReferentialActions"
import { ON_DELETE, ON_UPDATE } from "../../utils/sql";
import { Edge, Node } from "reactflow";

type AddReferentialActionsProps = {
    onClose: () => void;
}

export const AddReferentialActions = ({ onClose }: AddReferentialActionsProps) => {
    const [onDeleteAction, setOnDeleteAction] = useState<ON_DELETE | null>(currentModal$.value!.props.edges[0].data.onDelete);
    const [onUpdateAction, setOnUpdateAction] = useState<ON_UPDATE | null>(currentModal$.value!.props.edges[0].data.onUpdate);

    const saveChanges = () => {
        const edgesId = (currentModal$.value!.props.edges as Edge[]).map(x => x.id);
        const copyOfEdges: Node[] = JSON.parse(JSON.stringify(state.edges$));

        for (const edge of edgesId) {
            const currNodeIndex = copyOfEdges.findIndex(x => x.id === edge);
            copyOfEdges[currNodeIndex].data.onDelete = onDeleteAction;
            copyOfEdges[currNodeIndex].data.onUpdate = onUpdateAction;
        }
        state.edges$ = [...copyOfEdges];
        onClose();
    }
    const currSelection = currentModal$.value!.props.edges[0].data;
    return (
        <div>
            {
                currentModal$.value!.props.text
            }
            < div >
                <ReferentialActions
                    onChangeDelete={(val) => setOnDeleteAction(val)}
                    onChangeUpdate={(val) => setOnUpdateAction(val)}
                    defaultOnDelete={currSelection.onDelete}
                    defaultOnUpdate={currSelection.onUpdate}
                />
            </div >
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => onClose()} className="normal-btn">Cancel</button>
                <button type="button" onClick={() => saveChanges()} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Save</button>
            </div>
        </div>
    )
}