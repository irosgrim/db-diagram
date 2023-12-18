import { useState } from "react";
import { currentModal$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";

export const AddConstraint = ({ onClose }: { onClose: () => void }) => {
    const [active, setActive] = useState<"pk" | "un">("pk");
    const currentModal = currentModal$.value;
    const [name, setName] = useState(currentModal ? currentModal.props.data.name + "_" + active : "");
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

    if (!currentModal) {
        return <></>
    }

    const toggle = (a: "pk" | "un") => {
        setActive(a);
        setName(currentModal.props.data.name + "_" + a)
    }

    const setConstraint = (colName: string) => {
        const index = selectedColumns.indexOf(colName);
        if (index < 0) {
            setSelectedColumns([...selectedColumns, colName]);
        } else {
            const colsCopy = [...selectedColumns];
            colsCopy.splice(index, 1);
            setSelectedColumns(colsCopy);
        }
    }

    const highlight = (colName: string) => {
        return selectedColumns.findIndex(x => x === colName) > -1;
    }

    const onSave = () => {
        const tableName = currentModal.props.data.name;

        if (active === "pk") {
            primaryKey$.value = { ...primaryKey$.value, [tableName]: { name, cols: selectedColumns.join(",") } };
            console.log(primaryKey$.value[tableName])
        }

        if (active === "un") {
            const sortedNewCols = selectedColumns.sort().join(",");
            const newEntry = {
                name: name,
                cols: sortedNewCols,
            };
            const currentUniques = uniqueKeys$.value[tableName] || [];
            const existingKeyIndex = currentUniques.findIndex(x => x.name === newEntry.name);
            const colsAlreadyExist = currentUniques.some(x => x.cols === sortedNewCols);

            if (existingKeyIndex !== -1) {
                if (!colsAlreadyExist) {
                    currentUniques[existingKeyIndex] = newEntry;
                }
            } else {
                if (!colsAlreadyExist) {
                    currentUniques.push(newEntry);
                }
            }

            uniqueKeys$.value = { ...uniqueKeys$.value, [tableName]: currentUniques };
        }
        onClose();
    };

    return (
        <div>
            <div style={{ marginBottom: "0.5rem" }}>
                <div>
                    Table: {currentModal.props && currentModal.props.data.name}
                </div>
                <div>
                    Constraint name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
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
            <table>
                <tbody>
                    {
                        state.nodes$.filter(x => x.parentNode === currentModal.props.id && x.type === "column").map(x => (
                            <tr key={x.id} style={{ background: highlight(x.data.name) ? "#d3ebf8" : "transparent" }}>
                                <td><input type="checkbox" onChange={() => setConstraint(x.data.name)} /></td>
                                <td>{x.data.name}</td>
                                <td>{x.data.type}</td>
                            </tr>

                        ))
                    }
                </tbody>
            </table>

            <div>
                <button onClick={onClose}>Cancel</button>
                <button onClick={onSave}>Ok</button>
            </div>
        </div>
    )
}