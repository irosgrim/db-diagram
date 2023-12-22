import { currentModal$, indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";
import { useState } from "react";
import "../style/tableOptions.scss";
import { generateCssClass } from "../utils/styling";
import { Icon } from "./Icon";
import { Edge } from "reactflow";

type TableOptionsProps = {
    currentTable: any;
}


const getEdgeName = (currentTableId: string) => {
    const edges = state.edges$.filter(x => {
        const [sourceTable,] = x.source.split("/");
        return x.data.compositeGroup === null && sourceTable === currentTableId;
    })

    const fk = edges.map(edge => {
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

        return `${data.sourceColumn} to ${data.targetTable}(${data.targetColumn})`;
    });

    return (
        <div>
            {
                edges.length > 0 && <h5>Simple foreign keys</h5>
            }
            {
                fk.map((x, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>
                            <Icon type="exclamation" width="12" height="11" color="red" />
                            <span>
                                {x}
                            </span>
                        </span>
                        <button className="icon-btn" style={{ marginRight: "0.5rem" }}>
                            <Icon type="horizontal-dots" width="12" height="3" />
                        </button>
                    </div>
                ))
            }
        </div>
    )
};

const getCompositeFks = (currentTableId: string) => {
    const composite = state.edges$.reduce((acc: any, curr: Edge) => {
        if (curr.data.compositeGroup !== null && curr.source.split("/")[0] === currentTableId) {
            acc[curr.data.compositeGroup] = [...(acc[curr.data.compositeGroup] ? acc[curr.data.compositeGroup] : []), curr];
        }
        return acc;
    }, {} as Record<string, Edge[]>);

    const composites = [];
    for (const fk of Object.values(composite)) {
        const source = [];
        const target = [];
        let tableName = "";
        // @ts-ignore
        for (const group of fk) {
            const sourceCol = state.nodes$.find(n => n.id === group.source);
            const targetTable = state.nodes$.find(n => n.id === group.target.split("/")[0]);
            const targetCol = state.nodes$.find(n => n.id === group.target);
            tableName = targetTable.data.name;
            source.push(sourceCol.data.name);
            target.push(targetCol.data.name);
        }
        composites.push(`(${source.join(", ")}) to ${tableName}(${target.join(", ")})`)
    }

    return <div>
        {
            composites.length > 0 && <h5>Composite foreign keys:</h5>
        }
        {
            composites.map((x, i) => (
                <div key={i}>
                    {x}
                </div>
            ))
        }
    </div>
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
                                        <span style={{ display: "flex", alignItems: "center" }} title={x.unique ? "Unique" : "Not unique"}>
                                            {x.unique && <Icon type="star" style={{ marginRight: "0.5rem" }} />}
                                            {colNames}
                                        </span>
                                        <button
                                            className="icon-btn"
                                            onClick={() => {
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
                                    <button
                                        className="icon-btn"
                                        onClick={() => {
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
                                        <button
                                            className="icon-btn"
                                            onClick={() => {
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
                            getCompositeFks(currentTable.id)
                        }
                        {
                            getEdgeName(currentTable.id)
                        }
                    </div>
                )
            }

        </div>
    )
}