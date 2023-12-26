import { useState } from "react"
import { generateSqlSchema } from "../utils/sql";
import { indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";

export const AppHeader = () => {
    const [schema, setSchema] = useState<string | null>(null);


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
            <h3>DB diagram</h3>
            <button
                style={{ backgroundColor: "transparent", borderRadius: "5px", border: "1px solid #9fc8b9", color: "#9fc8b9" }}
                onClick={() => showDbSchema()}>Show DB schema</button>
            {
                schema && <pre className="schema-preview">
                    {schema}
                </pre>
            }
        </header>
    )
}