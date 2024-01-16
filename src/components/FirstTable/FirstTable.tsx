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


export const FirstTable = ({ onClose }: { onClose: () => void }) => {
    const [firstTable, setFirstTable] = useState<Node<TableData> | null>(tableTemplate);
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

    const firstDragStart = (e: any, columnIndex: number) => {
        e.dataTransfer.setData("text/plain", columnIndex);
    };

    const firstDrop = (e: any, columnIndex: number) => {
        e.preventDefault();

        const draggedPosition = parseInt(e.dataTransfer.getData("text/plain"), 10);
        e.dataTransfer.clearData();



        // remove the original
        const [draggedItem] = firstTable!.data.columns.splice(draggedPosition, 1);
        // reinsert at the new index
        firstTable!.data.columns.splice(columnIndex, 0, draggedItem);
        setFirstTable(firstTable);
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
                            defaultValue={firstTable!.data.name}
                            onChange={(e) => {
                                const firstTableCopy = { ...firstTable! };
                                firstTableCopy.data.name = e.target.value;
                                setFirstTable(firstTableCopy);
                            }}
                        />

                        <input
                            type="color"
                            style={{ height: "30px", width: "30px", border: "none" }}
                            onBlur={() => true}
                            onChange={(e) => {
                                const firstTableCopy = { ...firstTable! };
                                firstTableCopy.data.backgroundColor = e.target.value;
                                setFirstTable(JSON.parse(JSON.stringify(firstTableCopy)));
                            }}
                            value={firstTable?.data.backgroundColor}
                            title="change table color"
                        />
                    </div>
                    <h4 className="heading">Columns:</h4>
                    <div className="new-columns-list-wrapper">
                        <ul className="new-columns">
                            {
                                firstTable!.data.columns.map((col, index) => (
                                    <li
                                        key={col.id}
                                        draggable
                                        onDragStart={(e) => firstDragStart(e, index)}
                                        onDrop={(e) => firstDrop(e, index)}
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
                                                    defaultValue={col.name}
                                                    onChange={(e) => {
                                                        const firstTableCopy = { ...firstTable! };
                                                        firstTableCopy.data.columns[index].name = e.target.value;
                                                        setFirstTable(firstTableCopy);
                                                    }}
                                                />
                                            </div>
                                            <Autocomplete
                                                id={"autocomplete_" + col.id}
                                                suggestions={POSTGRES_TYPES}
                                                value={col.type}
                                                onChange={(val) => {
                                                    const firstTableCopy = { ...firstTable! };
                                                    firstTableCopy.data.columns[index].type = val;
                                                    setFirstTable(firstTableCopy);
                                                }}
                                            />

                                            <span style={{ display: "flex", alignItems: "center" }}>
                                                <button type="button"
                                                    className={generateCssClass("icon-btn", { active: !getProperty(col).isNotNull })}
                                                    onClick={() => {
                                                        let nCopies = { ...firstTable! };
                                                        nCopies.data.columns[index].notNull = !nCopies.data.columns[index].notNull;
                                                        setFirstTable(nCopies)
                                                    }}
                                                    title="nullable value"
                                                >
                                                    <Icon type="null" />
                                                </button>

                                                <button type="button"
                                                    className={generateCssClass("icon-btn", { active: col.unique })}
                                                    title="unique"
                                                    onClick={() => {
                                                        let nCopies = { ...firstTable! };
                                                        nCopies.data.columns[index].unique = !nCopies.data.columns[index].unique;
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
                                                const firstTableCopy = { ...firstTable! };
                                                firstTableCopy.data.columns.splice(index, 1);
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
                                const tableId = firstTable!.id;
                                const colId = `${tableId}/col_${v4()}`;
                                const n = firstTable!.data.columns.length;

                                const colTemplate: ColumnData = {
                                    id: colId,
                                    name: "new_column_" + n,
                                    type: "VARCHAR(30)",
                                    unique: false,
                                    notNull: false,
                                };
                                firstTable?.data.columns.push(colTemplate)
                                setFirstTable(JSON.parse(JSON.stringify(firstTable)))
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
                                state.nodes$ = [...state.nodes$, firstTable]
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