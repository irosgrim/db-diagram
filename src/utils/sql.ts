import { indexes$, primaryKey$, state } from "../state/globalState";


class Column{
    public name: string;
    public type: string;
    public notNull: string;
    public unique: string;
    constructor(node: any) {
        this.name = node.data.name;
        this.type = node.data.type;
        this.notNull = node.data.notNull ? "NOT NULL" : "";
        this.unique = node.data.unique ? "UNIQUE" : "";
    }

    toSql(){
       const parts = [this.name, this.type];
        if (this.notNull) {
            parts.push(this.notNull);
        }
        if (this.unique) {
            parts.push(this.unique);
        }

        return parts.join(" ");
    }
}

class Pk {
    public cols: string[];
    constructor(pk: string[]) {
        this.cols = pk
    }
    toSql() {
        const parts = [];
        for (const col of this.cols) {
            const colEl = state.nodes$.find(x => x.id === col);
            if (colEl) {
                parts.push(colEl.data.name);
            }
        }
        return parts.join(", ")
    }
}

class Index {
    public indexes: any[][];
    public tableId: string = "";
    constructor (indexes: any[][]) {
        this.indexes = indexes;
    }

    toSql() {
        const parts: any[] = [];
        for (const idx of this.indexes) {
            const cols = [];
            for (let i=0; i < idx.length; i++) {
                const colEl = state.nodes$.find(x => x.id === idx[i]);
                if (colEl) {
                    this.tableId = colEl.parentNode;
                    cols.push(colEl.data.name);
                    if(i === idx.length - 1) {
                        parts.push({name: cols.join("_"), cols: cols});
                    }
                }
            }
        }
        const str = [];
        const tableName = state.nodes$.find(n => n.id === this.tableId)
        for (const p of parts) {
            str.push(
                `CREATE INDEX ${p.name}_idx
ON ${tableName.data.name} (${p.cols.join(", ")});`
            )
        }

        return str.join("\n");

    }
}

class Table{
    public name: string;
    public cols: Column[];
    public pk: Pk | null = null;
    public uniques: string[];
    public indexes: Index | null = null;
    public fks: Set<string>[];
    constructor (tableNode: any) {
        this.name = tableNode.data.name;
        this.cols = [];
        this.uniques = [];
        this.fks = [];
    }
    toSql(){
        return `
CREATE TABLE IF NOT EXISTS ${this.name} (
    ${this.cols.map(c => c.toSql()).join(",\n    ")}${this.pk && this.pk.cols.length ? ",\n    PRIMARY KEY (" + this.pk.toSql() + ")" : ""}
);

${this.indexes && this.indexes.toSql()}
`;
    }
}
export const generateSqlSchema = () => {

    const tables: Record<string, any> = {};
    const columns = {};
    const indexes = {}

    const t = state.nodes$.filter( n => n.type === "group");
    for (const n of t) {
        if(n.type === "group") {
            tables[n.id] = new Table(n);
        }
    }

    for (const col of state.nodes$) {
        if (col.type === "column") {
            tables[col.parentNode].cols.push(new Column(col))
        }
    }

    for (const [key, value] of Object.entries(tables)) {
        tables[key].pk = new Pk(primaryKey$.value[key] ? primaryKey$.value[key].cols : []);
        tables[key].indexes = new Index(indexes$.value[key] ? indexes$.value[key].map(x => x.cols) : [])
    } 


    const str = [];

    for (const t of Object.values(tables)) {
        str.push(t.toSql());
    }


    return str.join("\n");
}



export const postgresTypes = [
    "BIGINT",
    "SERIAL",
    "BIT",
    "VARBIT",
    "BOOLEAN",
    "BYTEA",
    "CHAR",
    "VARCHAR",
    "CIDR",
    "DATE",
    "DOUBLE PRECISION",
    "INET",
    "INTEGER",
    "JSON",
    "JSONB",
    "MONEY",
    "NUMERIC",
    "REAL",
    "SMALLINT",
    "TEXT",
    "TIME",
    "TIMESTAMP",
    "UUID",
    "XML"
];
