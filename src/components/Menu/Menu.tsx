import { ChangeEvent, useEffect, useRef, useState } from "react";
import { currentModal$, localStorageCopy$, state } from "../../state/globalState";
import "./style/menu.scss";
import { getLocalStorageState, setActiveDiagram, storageWriter, storage } from "../../state/storage";
import { v4 } from "uuid";
import { generateCssClass } from "../../utils/styling";
import { exportSql } from "../../utils/sql";
import { saveImage } from "./exportImg";

type MenuProps = {
    onClose: () => void;
}

const getFiles = async () => {
    const f = await getLocalStorageState();
    if (f.value) {
        const files = Object.entries(f.value.files).map(v => ({ id: v[0], name: f.value.files[v[0]].name }))
        return {
            files,
            active: f.value.active || null
        }
    }
    return null;
}

export const Menu = ({ onClose }: MenuProps) => {
    const [files, setFiles] = useState<{ files: { id: string, name: string }[], active: string | null } | null>();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const f = async () => {
            const r = await getFiles();
            setFiles(r);
        };
        f();
    }, []);

    const exportDiagram = () => {
        currentModal$.value = { type: "export-diagram" };
        onClose();
    }

    const fileInputClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const p = JSON.parse(text);
                for (const f in p) {
                    p[f].name = "imported-" + p[f].name;
                }
                // TODO: some validation

                let curr = { ...localStorageCopy$.value.files };
                curr = { ...curr, ...p };
                localStorageCopy$.value = { ...localStorageCopy$.value, files: curr };
                storage.setFiles(localStorageCopy$.value);
                window.location.reload();
            };
            reader.readAsText(file);
        }
    };

    return (
        <nav className="menu-wrapper">
            <ul className="file-names">
                {
                    files && files.files.map(x => (
                        <li
                            key={x.id}
                        >
                            <button
                                type="button"
                                onClick={() => { setActiveDiagram(x.id); onClose() }}
                                className={generateCssClass({ active: localStorageCopy$.value.active === x.id })}
                            >
                                {x.name}
                            </button>
                        </li>
                    ))
                }
            </ul>
            <ul>
                <li>
                    <button
                        type="button"
                        onClick={async () => {
                            const newId = v4();
                            const n = {
                                nodes: [],
                                edges: [],
                                primaryKey: {},
                                uniqueKeys: {},
                                indexes: {},
                            }
                            await storageWriter(newId, n);
                            window.location.reload();
                        }}
                        title="create new diagram"
                    >
                        New diagram
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        title="export diagram as sql file"
                        onClick={() => {
                            exportSql();
                            onClose();
                        }}
                        disabled={state.nodes$.length === 0}
                    >
                        Export as SQL
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        title="export diagram"
                        onClick={() => exportDiagram()}
                    >
                        Export diagram as JSON
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        title="save as image"
                        onClick={() => saveImage()}
                    >
                        Save as image
                    </button>
                </li>
                <li>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".json"
                    />
                    <button
                        type="button"
                        title="import diagram"
                        onClick={() => fileInputClick()}
                    >
                        Import diagram from JSON
                    </button>
                </li>
                {/* <li><button type="button" disabled title="not implemented">Duplicate</button></li>  */}
                <li><button type="button" onClick={() => {
                    const currFileName = document.getElementById("current-file-name-input")
                    if (currFileName) {
                        currFileName.focus();
                    }
                    onClose();
                }}>Rename</button></li>
                <li><button type="button" onClick={() => {
                    currentModal$.value = { type: "delete-confirm" }
                    onClose();
                }}>Delete</button></li>
            </ul>
        </nav>
    )
}