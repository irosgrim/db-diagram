import { useRef, useState } from "react"
import { generateSqlSchema } from "../../utils/sql";
import { indexes$, primaryKey$, state, uniqueKeys$ } from "../../state/globalState";
import "./style/app-header.scss";
import { Menu } from "../Menu/Menu";
import { useOnClickOutside } from "../../hooks/onClickOutside";
import { Icon } from "../Icon";

export const AppHeader = () => {
    const [schema, setSchema] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useOnClickOutside(menuRef, () => setShowMenu(false));

    const showDbSchema = () => {
        if (schema) {
            setSchema(null);
        } else {
            setSchema(generateSqlSchema({
                nodes: state.nodes$,
                edges: state.edges$,
                primaryKey: primaryKey$.value,
                indexes: indexes$.value,
                uniqueKeys: uniqueKeys$.value,
            }))
        }
    }

    return (
        <header className="header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", position: "relative" }}>
                <h3>DB diagram</h3>
                <div style={{ position: "relative" }}>
                    <input type="text" defaultValue="Untitled" style={{ marginLeft: "1rem", backgroundColor: "transparent", border: "none", color: "#ffffff" }} />
                    <button
                        type="button"
                        style={{ backgroundColor: "transparent", border: "none" }}
                        onClick={() => setShowMenu(prev => !prev)}
                    >
                        <Icon type="arrow-down" color="#ffffff" />
                    </button>
                    {
                        showMenu && <div ref={menuRef}>
                            <Menu onClose={() => setShowMenu(false)} />
                        </div>}
                </div>
            </div>
            <button type="button"
                className="show-schema-btn"
                onClick={() => showDbSchema()}>Show DB schema</button>
            {
                schema && <pre className="schema-preview">
                    {schema}
                </pre>
            }
        </header>
    )
}