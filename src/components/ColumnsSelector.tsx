import { useState } from "react";
import { state } from "../state/globalState"

type ColumnsSelectorProps = {
    table: any;
    onClose: () => void;
    onSave: (cols: string[]) => void;
}

export const ColumnsSelector = ({ table, onClose, onSave }: ColumnsSelectorProps) => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

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
            <div>
                <button onClick={onClose}>Cancel</button>
                <button onClick={() => onSave(selectedColumns)}>Ok</button>
            </div>
        </>
    )
}