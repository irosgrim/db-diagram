import { useState } from "react";
import { state } from "../../state/globalState"
import { FirstTable } from "./FirstTable";

export const FirstTableWrapper = () => {
    const [showFirstTable, setShowFirstTable] = useState(true);

    return (
        <>
            {
                state.nodes$.length === 0 && showFirstTable && (
                    <FirstTable onClose={() => setShowFirstTable(false)} />
                )
            }
        </>
    )
}