import { useState } from "react";
import { edgeOptions$, state } from "../../state/globalState"
import { CompositeFk } from "./CompositeFk"
import { Icon } from "../Icon";
import { generateCssClass } from "../../utils/styling";

export const EdgeOptions = () => {
    const [type, setType] = useState<"simple-fk" | "composite-fk">(edgeOptions$.value?.data.compositeGroup !== null ? "composite-fk" : "simple-fk");

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
            <CompositeFk
                type={type}
                sourceTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.source.split("/")[0])}
                targetTable={edgeOptions$.value && state.nodes$.find(x => x.id === edgeOptions$.value!.target.split("/")[0])}
                edge={edgeOptions$.value}
                onClose={() => edgeOptions$.value = null}
            />

        </>
    )
}