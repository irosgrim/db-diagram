import { ChangeEvent, useEffect, useState } from "react";
import { indexes$, primaryKey$, state, uniqueKeys$ } from "../../state/globalState";
import { tableTemplate } from "./firstTableTemplate";
import { Node, Edge } from "reactflow";
import { Icon } from "../Icon";
import { POSTGRES_TYPES } from "../../utils/sql";
import Autocomplete from "../Autocomplete";
import { generateCssClass } from "../../utils/styling";
import { v4 } from "uuid";
import { ColumnData, TableData } from "../../types/types";
import { getProperty } from "../utils";
import { AllDiagrams, storage } from "../../state/storage";

const isColumnNode = (node: Node<ColumnData | TableData>): node is Node<ColumnData> => {
    return node.data && node.type === "column";
}

export const FirstTable = ({ onClose }: { onClose: () => void }) => {
    const [firstTable, setFirstTable] = useState<Node<ColumnData | TableData>[] | null>(tableTemplate);
    const [listOfSamples, setListOfSamples] = useState<{ name: string, description: string, file: string }[]>([]);

    const getListOfSamples = async () => {
        const req = await fetch("samples.json");
        if (req.ok) {
            const data = await req.json();
            setListOfSamples(data);
        }
    }

    useEffect(() => {
        getListOfSamples();
    }, [])

    const firstDragStart = (e: any, node: any) => {
        const nodeIndex = firstTable!.findIndex(x => x.id === node.id);
        e.dataTransfer.setData("text/plain", nodeIndex);
    };

    const firstDrop = (e: any, node: any) => {
        e.preventDefault();

        const nodeIndex = firstTable!.findIndex(x => x.id === node.id);
        const draggedPosition = parseInt(e.dataTransfer.getData("text/plain"), 10);
        e.dataTransfer.clearData();

        const parentTableId = node.parentNode;

        let reorderedNodes = [...firstTable!];

        // remove the original
        const [draggedItem] = reorderedNodes.splice(draggedPosition, 1);
        // reinsert at the new index
        reorderedNodes.splice(nodeIndex, 0, draggedItem);

        reorderedNodes = reorderedNodes.map((n, index) => {
            if (n.type !== "group" && n.parentNode === parentTableId) {
                n.position.y = (index * 20);
            }
            return n;
        });

        setFirstTable(reorderedNodes);
    };


    const firstDragOver = (e: any) => {
        e.preventDefault();
    };

    const loadSample = async (e: ChangeEvent<HTMLSelectElement>) => {
        const f = JSON.parse(e.target.value) as { name: string, description: string, file: string };
        if (f && f.file) {
            const query = await fetch(f.file);
            if (query.ok) {
                const { nodes, edges, primaryKey, uniqueKeys, indexes } = await query.json() as { nodes: Node[]; edges: Edge[]; primaryKey: Record<string, { cols: string[] }>, uniqueKeys: Record<string, { cols: string[] }[]>, indexes: Record<string, { cols: string[]; unique: boolean }[]> };
                primaryKey$.value = primaryKey;
                uniqueKeys$.value = uniqueKeys;
                indexes$.value = indexes;
                state.nodes$ = nodes;
                state.edges$ = edges;

                let localStorageCopy = await storage.getFiles<AllDiagrams>();
                //@ts-ignore
                localStorageCopy = { ...localStorageCopy, files: { ...localStorageCopy!.files, [localStorageCopy!.active!]: { ...localStorageCopy!.files[localStorageCopy!.active!], name: "sample-" + f.name } } }
                await storage.setFiles(localStorageCopy);
                setFirstTable(null);
            }
        }
    }

    return (
        <div className="modal">
            <div className="modal-body">
                <span className="heading-wrapper">
                    <h4 className="heading">Create table</h4>
                    {
                        listOfSamples.length > 0 && (
                            <select name="samples" onChange={loadSample}>
                                <option value="">Load sample</option>
                                {
                                    listOfSamples.map((sample) => (
                                        <option key={sample.name} value={JSON.stringify(sample)}>{sample.name}</option>
                                    ))
                                }
                            </select>
                        )
                    }
                </span>
                <section>
                    <div className="new-table-props">
                        <input
                            placeholder="table name"
                            className="table-name-input"
                            type="text"
                            maxLength={20}
                            defaultValue={firstTable![0].data.name}
                            onChange={(e) => {
                                const firstTableCopy = [...firstTable!];
                                firstTableCopy[0].data.name = e.target.value;
                                setFirstTable(firstTableCopy);
                            }}
                        />

                        <input
                            type="color"
                            style={{ height: "30px", width: "30px", border: "none" }}
                            onBlur={() => true}
                            onChange={(e) => {
                                const firstTableCopy = [...firstTable!];
                                (firstTableCopy[0].data as TableData).backgroundColor = e.target.value;
                                setFirstTable(firstTableCopy);
                            }}
                            value={(firstTable![0].data as TableData).backgroundColor}
                            title="change table color"
                        />
                    </div>
                    <h4 className="heading">Columns:</h4>
                    <div className="new-columns-list-wrapper">
                        <ul className="new-columns">
                            {
                                firstTable!.filter(isColumnNode).map(col => (
                                    <li
                                        key={col.id}
                                        draggable
                                        onDragStart={(e) => firstDragStart(e, col)}
                                        onDrop={(e) => firstDrop(e, col)}
                                        onDragOver={firstDragOver}
                                    >
                                        <div className="table-col-props-wrapper">
                                            <div className="table-name-input-wrapper">
                                                <span>
                                                    <Icon type="dots-grid" height="20" width="14" color="#ababab" />
                                                </span>
                                                <input
                                                    placeholder="column name"
                                                    className="table-name-input"
                                                    type="text"
                                                    maxLength={30}
                                                    defaultValue={col.data.name}
                                                    onChange={(e) => {
                                                        const firstTableCopy = [...firstTable!];
                                                        const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                        firstTableCopy[currentNodeIndex].data.name = e.target.value;
                                                        setFirstTable(firstTableCopy);
                                                    }}
                                                />
                                            </div>
                                            <Autocomplete
                                                suggestions={POSTGRES_TYPES}
                                                value={col.data.type}
                                                onChange={(val) => {
                                                    const firstTableCopy = [...firstTable!];
                                                    const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                    const colNode = (firstTableCopy[currentNodeIndex] as Node<ColumnData>);
                                                    colNode.data.type = val;
                                                    setFirstTable(firstTableCopy);
                                                }}
                                            />

                                            <span style={{ display: "flex", alignItems: "center" }}>
                                                <button type="button"
                                                    className={generateCssClass("icon-btn", { active: !getProperty(col).isNotNull })}
                                                    onClick={() => {
                                                        let nCopies = [...firstTable!];
                                                        const curr = nCopies.findIndex(x => x.id === col.id);
                                                        const colNode = nCopies[curr] as Node<ColumnData>;
                                                        colNode.data.notNull = !colNode.data.notNull;
                                                        setFirstTable(nCopies)
                                                    }}
                                                    title="nullable value"
                                                >
                                                    <Icon type="null" />
                                                </button>

                                                <button type="button"
                                                    className={generateCssClass("icon-btn", { active: col.data.unique })}
                                                    title="unique"
                                                    onClick={() => {
                                                        let nCopies = [...firstTable!];
                                                        const curr = nCopies.findIndex(x => x.id === col.id);
                                                        const colNode = nCopies[curr] as Node<ColumnData>;
                                                        colNode.data.unique = !colNode.data.unique;
                                                        setFirstTable(nCopies)
                                                    }}
                                                >
                                                    <Icon type="star" />
                                                </button>
                                            </span>
                                        </div>
                                        <button type="button"
                                            className="icon-btn"
                                            title="delete column"
                                            onClick={() => {
                                                const firstTableCopy = [...firstTable!];
                                                const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                firstTableCopy.splice(currentNodeIndex, 1);
                                                setFirstTable(firstTableCopy);
                                            }}
                                        >
                                            <Icon type="delete" />
                                        </button>
                                    </li>
                                ))
                            }

                        </ul>
                    </div>
                    <div className="new-column-wrapper">
                        <button type="button"
                            className="normal-btn"
                            onClick={() => {
                                const tableId = firstTable![0].id;
                                const colId = `${tableId}/${v4()}`;
                                const n = firstTable!.reduce((acc, curr) => {
                                    if (curr.type === "column") {
                                        acc += 1;
                                    }
                                    return acc;
                                }, 0);
                                const colTemplate: Node<ColumnData> = {
                                    id: colId,
                                    type: "column",
                                    position: { x: 0, y: 20 + (n * 20) },
                                    data: { name: "new_column_" + n, type: "VARCHAR(30)", unique: false, notNull: false, },
                                    parentNode: tableId, extent: "parent",
                                    draggable: false,
                                    expandParent: true,
                                };
                                setFirstTable([...firstTable!, colTemplate])
                            }}>+ Add column</button>
                    </div>
                </section>
                <footer className="modal-footer">
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <button type="button"
                            className="normal-btn"
                            onClick={() => {
                                setFirstTable(null);
                                onClose();
                            }}
                        >
                            Cancel
                        </button>
                        <button type="button"
                            className="normal-btn"
                            style={{ marginLeft: "0.5rem" }}
                            onClick={() => {
                                state.nodes$ = [...firstTable!]
                                primaryKey$.value = {};
                                uniqueKeys$.value = {};
                                indexes$.value = {}
                                state.edges$ = [];
                                setFirstTable(null);
                                onClose();
                            }}>
                            OK
                        </button>

                    </div>
                </footer>
            </div>
        </div>
    )
}