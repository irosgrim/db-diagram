import { useState } from "react";
import { indexes$, primaryKey$, state, uniqueKeys$ } from "../../state/globalState";
import { sampleEdges, sampleNodes } from "../sample";
import { tableTemplate } from "./firstTableTemplate";
import { Node } from "reactflow";
import { Icon } from "../Icon";
import { POSTGRES_TYPES } from "../../utils/sql";
import Autocomplete from "../Autocomplete";
import { generateCssClass } from "../../utils/styling";
import { Select } from "../Select";
import { v4 } from "uuid";

export const FirstTable = ({ onClose }: { onClose: () => void }) => {
    const [firstTable, setFirstTable] = useState<Node[] | null>(tableTemplate);


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

    return (
        <div className="modal">
            <div className="modal-body">
                <span className="heading-wrapper">
                    <h4 className="heading">Create table</h4>
                    <button type="button"
                        className="normal-btn"
                        onClick={() => {
                            primaryKey$.value = {};
                            uniqueKeys$.value = {};
                            indexes$.value = {}
                            state.nodes$ = [...sampleNodes];
                            state.edges$ = [...sampleEdges];
                            setFirstTable(null);
                        }}>Load sample</button>
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
                                firstTableCopy[0].data.backgroundColor = e.target.value;
                                setFirstTable(firstTableCopy);
                            }}
                            value={firstTable![0].data.backgroundColor}
                            title="change table color"
                        />
                    </div>
                    <h4 className="heading">Columns:</h4>
                    <div className="new-columns-list-wrapper">
                        <ul className="new-columns">
                            {
                                firstTable!.filter(x => x.type === "column").map(col => (
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
                                                    firstTableCopy[currentNodeIndex].data.type = val;
                                                    setFirstTable(firstTableCopy);
                                                }}
                                            />
                                            <button
                                                className={generateCssClass("icon-btn", { active: !col.data.notNull })}
                                                onClick={() => {
                                                    const firstTableCopy = [...firstTable!];
                                                    const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                    firstTableCopy[currentNodeIndex].data.notNull = !firstTableCopy[currentNodeIndex].data.notNull;
                                                    setFirstTable(firstTableCopy);
                                                }}
                                                title="nullable value"
                                            >
                                                <Icon type={"null"} />
                                            </button>

                                            <div
                                                className={generateCssClass("icon-btn")}
                                                title={col.data.constraint}
                                            >
                                                <Select
                                                    type="single" options={[
                                                        { id: "primary_key", icon: "flag", name: "primary key" },
                                                        { id: "unique", icon: "star", name: "unique" },
                                                        { id: "none", icon: "circle", name: "none" },
                                                    ]}
                                                    selected={col.data.constraint}
                                                    onSelectionChange={(val) => {
                                                        const firstTableCopy = [...firstTable!];
                                                        const currentNodeIndex = firstTableCopy.findIndex(x => x.id === col.id);
                                                        firstTableCopy[currentNodeIndex].data.constraint = val;
                                                        setFirstTable(firstTableCopy);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <button
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
                                const colTemplate = {
                                    id: colId,
                                    type: "column",
                                    position: { x: 0, y: 20 + (n * 20) },
                                    data: { name: "new_column_" + n, type: "VARCHAR(30)", unique: false, notNull: false, index: false },
                                    parentNode: tableId, extent: "parent",
                                    draggable: false,
                                    expandParent: true,
                                };
                                //@ts-ignore
                                setFirstTable([...firstTable, colTemplate])
                            }}>+ Add column</button>
                    </div>
                </section>
                <footer className="modal-footer">
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <button
                            className="normal-btn"
                            type="button"
                            onClick={() => {
                                setFirstTable(null);
                                onClose();
                            }}
                        >Cancel</button>
                        <button
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