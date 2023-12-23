import { useState } from "react";
import { edgeOptions$, state } from "../state/globalState"
import { CompositeFk } from "./CompositeFk"
import { Icon } from "./Icon";
import { generateCssClass } from "../utils/styling";
import { ReferentialActions } from "./ReferentialActions";
import { Edge } from "reactflow";
import { ON_DELETE, ON_UPDATE } from "../utils/sql";


export const EdgeOptions = () => {
    const [type, setType] = useState<"simple-fk" | "composite-fk">(edgeOptions$.value?.data.compositeGroup !== null ? "composite-fk" : "simple-fk");
    const [onDeleteAction, setOnDeleteAction] = useState<ON_DELETE | null>(null);
    const [onUpdateaction, setOnUpdateAction] = useState<ON_UPDATE | null>(null);
    const edgesCopy: Edge[] = JSON.parse(JSON.stringify(state.edges$));
    const getEdge = () => {
        const currentEdge = edgeOptions$.value;
        const currEdgeIdx = edgesCopy.findIndex(x => x.id === currentEdge!.id);
        return edgesCopy[currEdgeIdx];
    }
    const edge = getEdge();
    const onSimple = () => {
        setType("simple-fk");
    }


    const saveSimple = () => {
        if (edgeOptions$.value?.data.compositeGroup !== null) {
            edge.data.compositeGroup = null;
            edge.data.color = "";
        }
        edge.data.onDelete = onDeleteAction;
        edge.data.onUpdate = onUpdateaction;

        state.edges$ = edgesCopy;
        edgeOptions$.value = null;
    }

    const onComposite = () => {
        setType("composite-fk")
    }

    return (
        <>
            <nav style={{ display: "flex", listStyleType: "none", justifyContent: "space-evenly" }}>
                <div className="circle-btn-wrapper">
                    <button
                        onClick={() => setType("simple-fk")} title="simple foreign key"
                        className={generateCssClass("circle-btn", { active: type === "simple-fk" })}
                    >
                        <Icon type="key" height="24" width="20" />
                    </button>
                    <div className="circle-btn-label">
                        {type !== "simple-fk" ? "Make simple" : "Simple"}
                    </div>
                </div>
                <div className="circle-btn-wrapper">
                    <button
                        onClick={() => onComposite()}
                        className={generateCssClass("circle-btn", { active: type === "composite-fk" })}
                    >
                        <Icon type="multi-key" width="24" height="28" />
                    </button>
                    <div className="circle-btn-label">
                        Composite
                    </div>
                </div>
            </nav>
            {
                type === "simple-fk" && <ReferentialActions
                    onChangeDelete={setOnDeleteAction}
                    onChangeUpdate={setOnUpdateAction}
                    defaultOnDelete={edge.data.onDelete}
                    defaultOnUpdate={edge.data.onUpdate}
                />
            }
            {
                type === "composite-fk" && (
                    <CompositeFk
                        sourceTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.source.split("/")[0])}
                        targetTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.target.split("/")[0])}
                        edge={edgeOptions$.value}
                        onClose={() => edgeOptions$.value = null}
                    />
                )
            }
            {
                type === "simple-fk" && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button onClick={() => edgeOptions$.value = null} className="normal-btn">Cancel</button>
                    <button onClick={() => saveSimple()} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Save</button>
                </div>
            }
        </>
    )
}