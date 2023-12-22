import { useState } from "react";
import { state } from "../state/globalState"

type ColumnsSelectorProps = {
    table: any;
    showUniqueCheck?: boolean;
    onClose: () => void;
    onSave: (cols: string[], isUnique?: boolean) => void;
}

export const ColumnsSelector = ({ table, showUniqueCheck = false, onClose, onSave }: ColumnsSelectorProps) => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [isUnique, setIsUnique] = useState(false);
    const setConstraint = (colId: string) => {
        const index = selectedColumns.indexOf(colId);
        if (index < 0) {
            setSelectedColumns([...selectedColumns, colId]);
        } else {
            const colsCopy = [...selectedColumns];
            colsCopy.splice(index, 1);
            setSelectedColumns(colsCopy);
        }
    }

    const highlight = (colName: string) => {
        return selectedColumns.findIndex(x => x === colName) > -1;
    }

    const save = () => {
        if (showUniqueCheck) {
            onSave(selectedColumns, isUnique);
        } else {
            onSave(selectedColumns);
        }
    }

    return (
        <>
            <table>
                <tbody>
                    {
                        state.nodes$.filter(x => x.parentNode === table.id && x.type === "column").map(x => (
                            <tr key={x.id} style={{ background: highlight(x.id) ? "#d3ebf8" : "transparent" }}>
                                <td><input type="checkbox" onChange={() => setConstraint(x.id)} /></td>
                                <td>{x.data.name}</td>
                                <td>{x.data.type}</td>
                            </tr>

                        ))
                    }
                </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                    {
                        showUniqueCheck && (
                            <>
                                <input type="checkbox" id="is-unique-index" onClick={() => setIsUnique(!isUnique)} />
                                <label htmlFor="is-unique-index" style={{ marginLeft: "0.5rem" }}>Unique index</label>
                            </>
                        )
                    }
                </span>
                <span style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={onClose} className="normal-btn">Cancel</button>
                    <button onClick={() => save()} className="normal-btn" style={{ marginLeft: "0.5rem" }}>Ok</button>
                </span>
            </div >
        </>
    )
}