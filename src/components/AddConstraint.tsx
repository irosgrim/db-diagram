import { useState } from "react";
import { currentModal$, primaryKey$, uniqueKeys$ } from "../state/globalState";
import { ColumnsSelector } from "./ColumnsSelector";

export const AddConstraint = ({ onClose }: { onClose: () => void }) => {
    const [active, setActive] = useState<"pk" | "un">("pk");
    const currentModal = currentModal$.value;

    if (!currentModal) {
        return <></>
    }

    const toggle = (a: "pk" | "un") => {
        setActive(a);
    }

    const onSave = (selectedColumns: string[]) => {
        const tableId = currentModal.props.id;

        if (selectedColumns.length === 0) {
            onClose();
            return;
        }

        if (active === "pk") {
            primaryKey$.value = { ...primaryKey$.value, [tableId]: { cols: selectedColumns } };
        }

        if (active === "un") {
            const newEntry = {
                cols: selectedColumns,
            };
            const currentUniques = uniqueKeys$.value[tableId] || [];
            const existingKeyIndex = currentUniques.findIndex(x => x.cols.sort().join(",") === selectedColumns.sort().join(","));

            if (existingKeyIndex !== -1) {
                currentUniques[existingKeyIndex] = newEntry;
            } else {
                currentUniques.push(newEntry);
            }

            uniqueKeys$.value = { ...uniqueKeys$.value, [tableId]: currentUniques };
        }
        onClose();
    };

    return (
        <div>
            <div style={{ marginBottom: "0.5rem" }}>
                <div>
                    Table: {currentModal.props && currentModal.props.data.name}
                </div>
            </div>
            <div style={{ marginBottom: "-1px" }}>
                <button
                    style={{ borderRadius: "5px 0 0 0 ", padding: "0.3rem", backgroundColor: active === "pk" ? "#d3ebf8" : "transparent", border: "1px solid #adadad", fontWeight: "bold" }}
                    onClick={() => toggle("pk")}
                >Primary Key</button>
                <button
                    style={{ borderRadius: "0 5px 0 0 ", padding: "0.3rem", backgroundColor: active === "un" ? "#d3ebf8" : "transparent", border: "1px solid #adadad", fontWeight: "bold", marginLeft: "-1px" }}
                    onClick={() => toggle("un")}
                >
                    Unique Key
                </button>
            </div>
            <ColumnsSelector table={currentModal.props} onSave={onSave} onClose={onClose} />
        </div>
    )
}