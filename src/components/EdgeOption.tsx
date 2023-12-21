import { useState } from "react";
import { edgeOptions$, state } from "../state/globalState"
import { CompositeFk } from "./CompositeFk"

export const EdgeOptions = () => {
    const [type, setType] = useState<"simple-fk" | "composite-fk">("simple-fk");

    const edge = edgeOptions$.value;

    const onSimple = () => {
        setType("simple-fk");
        const edgesCopy = [...state.edges$];

        const currEdgeIdx = edgesCopy.findIndex(x => x.id === edge!.id);
        edgesCopy[currEdgeIdx].data.type = "simple-fk";
        state.edges$ = [...edgesCopy];
        console.log(type);
    }

    const onComposite = () => {
        return true;
    }

    return (
        <>
            <ul style={{ display: "flex", listStyleType: "none" }}>
                <li><button onClick={() => onSimple()}>simple fk</button></li>
                <li><button onClick={() => onComposite()}>composite fk</button></li>
            </ul>

            <CompositeFk
                sourceTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.source.split("/")[0])}
                targetTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.target.split("/")[0])}
                edge={edgeOptions$.value}
                onClose={() => edgeOptions$.value = null}
            />
        </>
    )
}