import { useState } from "react";
import { localStorageCopy$ } from "../../state/globalState"
import { DiagramData } from "../../state/storage";

type ExportDialogProps = {
    onClose: () => void;
}

export const ExportDialog = ({ onClose }: ExportDialogProps) => {

    const [selected, setSelected] = useState<string[]>([]);

    const handleSelect = (id: string) => {
        const curr = selected.findIndex(x => x === id);
        if (curr > -1) {
            const sCp = [...selected];
            sCp.splice(curr, 1);
            setSelected(sCp);
        } else {
            setSelected(prev => [...prev, id]);
        }
    }

    const onExport = () => {
        if (selected.length > 0) {
            const { files } = localStorageCopy$.value;
            const payload: Record<string, { name: string, dateCreated: string, lastEdited: string, data: DiagramData }> = {};
            let f = 0;
            for (const selectedDiagramId of selected) {
                if (files[selectedDiagramId]) {
                    payload[selectedDiagramId] = files[selectedDiagramId];
                    f += 1;
                }
            }

            if (f > 0) {
                const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `db-diagram-export-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(a.href);
            }

            onClose();
        }
    }
    return (
        <div>
            <header>
                <h5>Export diagram</h5>
            </header>
            <section style={{ display: "flex", flexDirection: "column" }}>
                {
                    localStorageCopy$.value.files && Object.entries(localStorageCopy$.value.files).map(x => {
                        const [key, value] = x;
                        return (
                            <label key={key} style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    name={key}
                                    onChange={() => handleSelect(key)}
                                />
                                {value.name}
                            </label>
                        )
                    })
                }
            </section>
            <footer style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => onClose()} className="normal-btn">Cancel</button>
                <button onClick={() => true} className="normal-btn" style={{ marginLeft: "0.5rem" }} onClickCapture={() => onExport()}>Export selected</button>
            </footer>
        </div>
    )
}