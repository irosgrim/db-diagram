import { useEffect, useState } from "react";
import { currentModal$, localStorageCopy$ } from "../../state/globalState";
import "./style/menu.scss";
import { getLocalStorageState, setActiveDiagram, storageWriter } from "../../state/storage";
import { v4 } from "uuid";
import { generateCssClass } from "../../utils/styling";

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

    useEffect(() => {
        const f = async () => {
            const r = await getFiles();
            setFiles(r);
        };
        f();
    }, [])

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
                <li><button type="button" onClick={async () => {
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
                }}>New diagram</button></li>
                {/* <li><button type="button" disabled title="not implemented">Export...</button></li>
                <li><button type="button" disabled title="not implemented">Duplicate</button></li> */}
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