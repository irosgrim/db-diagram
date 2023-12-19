import { currentModal$, indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";
import { useState } from "react";
import "../style/tableOptions.scss";
import { generateCssClass } from "../utils/styling";
import { Icon } from "./Icon";

type TableOptionsProps = {
    currentTable: any;
}


const getEdgeName = (edge: any) => {
    const sourceC = edge.source;
    const targetC = edge.target;

    const sourceTable = state.nodes$.find(x => x.id === sourceC.split("/")[0]);
    const sourceColumn = state.nodes$.find(x => x.id === sourceC);

    const targetTable = state.nodes$.find(x => x.id === targetC.split("/")[0]);
    const targetColumn = state.nodes$.find(x => x.id === targetC);

    const data = {
        sourceTable: sourceTable.data.name,
        sourceColumn: sourceColumn.data.name,
        targetTable: targetTable.data.name,
        targetColumn: targetColumn.data.name
    }

    return <>
        {data.sourceColumn} to {data.targetTable}({data.targetColumn})

    </>
}


export const TableOptions = ({ currentTable }: TableOptionsProps) => {
    const [showSection, setShowSection] = useState<"indexes" | "constraints" | "foreign-keys" | null>(null);

    const toggleSection = (section: "indexes" | "constraints" | "foreign-keys") => {
        if (showSection === section) {
            setShowSection(null);
        } else {
            setShowSection(section);
        }
    }

    return (
        <div className="row padding-top padding-bottom" style={{ position: "relative" }}>
            <nav className="table-options-nav">
                <ul>
                    <li className={generateCssClass({ active: showSection === "indexes" })}>
                        <button onClick={() => toggleSection("indexes")}>Indexes</button>
                    </li>
                    <li className={generateCssClass({ active: showSection === "constraints" })}>
                        <button onClick={() => toggleSection("constraints")}>Constraints</button>
                    </li>
                    <li className={generateCssClass({ active: showSection === "foreign-keys" })}>
                        <button onClick={() => toggleSection("foreign-keys")}>Foreign keys</button>
                    </li>
                </ul>
            </nav>

            {
                showSection === "indexes" && (
                    <div style={{ marginTop: "0.5rem" }}>

                        {
                            indexes$.value[currentTable.id] && indexes$.value[currentTable.id].map((x, idx) => {
                                const colNames = x.cols.map(c => {
                                    const ss = state.nodes$.find(nn => nn.id === c);
                                    return ss.data.name;
                                }).join(", ");
                                return (
                                    <div
                                        key={colNames}
                                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "0.5rem" }}
                                    >
                                        <span>
                                            {colNames}
                                        </span>
                                        <button onClick={() => {
                                            const indexesCopy = [...indexes$.value[currentTable.id]]
                                            indexesCopy.splice(idx, 1);
                                            //@ts-ignore
                                            indexes$.value = { ...indexes$.value[currentTable.id], [currentTable.id]: indexesCopy }
                                        }}
                                        >
                                            <Icon type="delete" />
                                        </button>
                                    </div>
                                )
                            })
                        }
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => currentModal$.value = { type: "add-index", props: { ...currentTable } }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgb(159, 200, 185)",
                                    border: "none",
                                    padding: "0.5rem",
                                    color: "rgb(9, 38, 53)",
                                    borderRadius: "5px",
                                    marginRight: "1rem",
                                    fontWeight: "bold",
                                }}
                                title="add index"
                            >
                                add index
                            </button>

                        </div>

                    </div>
                )
            }
            {
                showSection === "constraints" && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <h5>Primary key</h5>
                        {
                            primaryKey$.value[currentTable.id] && primaryKey$.value[currentTable.id].cols && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "0.5rem" }}>
                                    <span>
                                        {primaryKey$.value[currentTable.id].cols
                                            .map(x => {
                                                const ss = state.nodes$.find(nn => nn.id === x);
                                                return ss.data.name;
                                            })
                                            .join(", ")}
                                    </span>
                                    <button onClick={() => {
                                        const cp = { ...primaryKey$.value };
                                        delete cp[currentTable.id];
                                        primaryKey$.value = cp;
                                    }}><Icon type="delete" /></button>
                                </div>

                            )
                        }
                        <h5>Unique keys</h5>
                        {
                            uniqueKeys$.value[currentTable.id] && uniqueKeys$.value[currentTable.id].map((x, idx) => {
                                const colNames = x.cols.map(cc => {
                                    const ss = state.nodes$.find(nn => nn.id === cc);
                                    return ss.data.name
                                }).join(", ");
                                return (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "0.5rem" }}>
                                        <span>
                                            {
                                                colNames
                                            }
                                        </span>
                                        <button onClick={() => {
                                            const cp = [...uniqueKeys$.value[currentTable.id]];
                                            cp.splice(idx, 1);
                                            uniqueKeys$.value = { ...uniqueKeys$.value, [currentTable.id]: [...cp] }
                                        }}><Icon type="delete" /></button>
                                    </div>
                                )
                            })
                        }
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => currentModal$.value = { type: "add-constraint", props: { ...currentTable } }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgb(159, 200, 185)",
                                    border: "none",
                                    padding: "0.5rem",
                                    color: "rgb(9, 38, 53)",
                                    borderRadius: "5px",
                                    marginRight: "1rem",
                                    fontWeight: "bold",
                                }}
                                title="add constraint"
                            >Add constraint</button>
                        </div>
                    </div>
                )
            }
            {
                showSection === "foreign-keys" && (
                    <div>
                        {
                            state.edges$.filter(x => {
                                const [sourceTable,] = x.source.split("/");
                                return sourceTable === currentTable.id;
                            }).map(x => (
                                <div key={x.id}>
                                    {getEdgeName(x)}
                                </div>
                            ))
                        }

                    </div>
                )
            }

        </div>
    )
}