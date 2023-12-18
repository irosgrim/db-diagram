import { v4 } from "uuid";
import { currentModal$, indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";
import { useState } from "react";
import "../style/tableOptions.scss";
import { generateCssClass } from "../utils/styling";
import { Icon } from "./Icon";

type TableOptionsProps = {
    currentTable: any;
}

const MyComponent = () => {
    return (
        <div>
            Hello world Componenet
        </div>
    )
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
                            indexes$.value[currentTable.data.name] && indexes$.value[currentTable.data.name].map((x, idx) => (
                                <div key={x.name}>{x.name} - {x.cols} <button onClick={() => {
                                    const indexesCopy = [...indexes$.value[currentTable.data.name]]
                                    indexesCopy.splice(idx, 1);
                                    //@ts-ignore
                                    indexes$.value = { ...indexes$.value[currentTable.data.name], [currentTable.data.name]: indexesCopy }
                                }}><Icon type="delete" /></button></div>
                            ))
                        }
                        <button onClick={() => currentModal$.value = { type: "add-index", props: { ...currentTable } }}>add index</button>

                    </div>
                )
            }
            {
                showSection === "constraints" && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <h5>Primary key</h5>
                        {
                            primaryKey$.value[currentTable.data.name] && (
                                <>
                                    <span>{primaryKey$.value[currentTable.data.name].name} - {primaryKey$.value[currentTable.data.name].cols}</span>
                                </>
                            )
                        }
                        <h5>Unique keys</h5>
                        {
                            uniqueKeys$.value[currentTable.data.name] && uniqueKeys$.value[currentTable.data.name].map(x => (
                                <div key={x.name}>
                                    <span>{x.name} - {x.cols}</span>
                                </div>
                            ))
                        }
                        <button onClick={() => currentModal$.value = { type: "add-constraint", props: { ...currentTable } }}>add constraint</button>
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
                        <span style={{ display: "flex", justifyContent: "right" }}>
                            <button style={{ marginRight: "1rem", borderRadius: "5px", backgroundColor: "#9fc8b9", border: "none", height: "32px", width: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}> <Icon type="plus" height="12" /></button>
                        </span>
                    </div>
                )
            }

        </div>
    )
}