import { v4 } from "uuid";
import { state } from "../state/globalState";
import { MultiSelect } from "./MultiSelect";
import { useState } from "react";
import "../style/tableOptions.scss";
import { generateCssClass } from "../utils/styling";
import { Icon } from "./Icon";

type TableOptionsProps = {
    currentTable: any;
}


const changeIndexes = (currentIndexNode: any, newIndexes: { id: string; name: string }[]) => {
    const nodesCopy = [...state.nodes$];
    let deletion = false;
    let nodeIndexToUpdate = 0;


    if (!newIndexes.length) {
        for (let i = 0; i < nodesCopy.length; i++) {
            const currentNode = nodesCopy[i];

            if (currentNode.id === currentIndexNode.parentNode) {
                nodesCopy[i].data.height -= 20;
                nodesCopy[i].style.height -= 20;
            }
            if (currentNode.id === currentIndexNode.id) {
                deletion = true;
                nodeIndexToUpdate = i;
            }
            if (currentNode.type === "index" && currentNode.parentNode === currentIndexNode.parentNode && deletion === true) {
                nodesCopy[i].position.y -= 20;
            }
        }
        nodesCopy.splice(nodeIndexToUpdate, 1);

    } else {
        const index = nodesCopy.findIndex(x => x.id === currentIndexNode.id);
        nodesCopy[index].data.columns = newIndexes;
    }
    state.nodes$ = [...nodesCopy];
}

const addIndex = (currentTable: any) => {
    const nodesCopy = [...state.nodes$];
    let totalColumns = 0;
    let totalIndexes = 0;
    let lastIndex = 0;
    let lastColumnIndex = 0;

    for (let i = 0; i < state.nodes$.length; i++) {
        const currNode = state.nodes$[i];
        if (currNode.id === currentTable.id) {
            nodesCopy[i].data.height += 20;
            nodesCopy[i].style.height += 20;
        }
        if (currNode.type === "column" && currNode.parentNode === currentTable.id) {
            totalColumns += 1;
            lastColumnIndex = i;
        }
        if (currNode.type === "index" && currNode.parentNode === currentTable.id) {
            totalIndexes += 1;
            lastIndex = i;
        }
    }

    const newIndexNode = {
        id: `${currentTable.id}/index_${v4()}`,
        type: "index",
        position: { x: 0, y: (20 * (totalColumns + totalIndexes)) + 20 },
        data: { columns: [], unique: true },
        parentNode: currentTable.id,
        extent: "parent",
        draggable: false,
        expandParent: true,
    };

    if (lastIndex === 0) {
        nodesCopy.splice(lastColumnIndex + 1, 0, newIndexNode);
    } else {
        nodesCopy.splice(lastIndex + 1, 0, newIndexNode);
    }
    // setNodes(nodesCopy);
    state.nodes$ = [...nodesCopy];

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
        <div className="row padding-top padding-bottom border-bottom">
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
                    <div>
                        {
                            state.nodes$.filter(x => x.parentNode === currentTable.id && x.type === "index").map((x) => (
                                <MultiSelect
                                    options={state.nodes$.filter((cols) => cols.parentNode === currentTable.id && cols.type === "column").map(cc => ({ id: cc.id, name: cc.data.name }))}
                                    selected={x.data.columns}
                                    onSelectionChange={(value) => changeIndexes(x, value)}
                                    key={x.id}
                                />
                            ))
                        }
                        <button onClick={() => addIndex(currentTable)}>add index</button>
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