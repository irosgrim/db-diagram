import { Edge } from "reactflow";
import { indexes$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";


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

class Unique {
    public uniques: any[][];
    public tableId: string = "";

    constructor(uniques: any[][]) {
        this.uniques = uniques;
    }

    toSql() {
        const parts: any[] = [];
        for (const u of this.uniques) {
            const cols = [];
            for (let i=0; i < u.length; i++) {
                const colEl = state.nodes$.find(x => x.id === u[i]);
                if (colEl) {
                    this.tableId = colEl.parentNode;
                    cols.push(colEl.data.name);
                    if(i === u.length - 1) {
                        parts.push({name: cols.join("_"), cols: cols});
                    }
                }
            }
        }
        const str = [];
        for (const p of parts) {
            str.push(`${p.cols.join(", ")})`);
        }

        return str;
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
        const tableName = state.nodes$.find(n => n.id === this.tableId);
        for (const p of parts) {
            str.push(
                `CREATE INDEX ${p.name}_idx
ON ${tableName.data.name} (${p.cols.join(", ")});`
            )
        }

        return str;

    }
}

class ForeignKey {
    public edges: Edge[] = [];
    constructor(edges: Edge[]) {
        this.edges = edges;
    }
//FOREIGN KEY (OrderID, CustomerID) REFERENCES Orders(OrderID, CustomerID)
    toSql() {
        // get composite fks
        const composite = this.edges.reduce((acc: any, curr: Edge) => {
            if (curr.data.compositeGroup !== null) {
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
                console.log(group)
                const sourceCol = state.nodes$.find(n => n.id === group.source);
                const targetTable = state.nodes$.find(n => n.id === group.target.split("/")[0]);
                const targetCol = state.nodes$.find(n => n.id === group.target);
                tableName = targetTable.data.name;
                source.push(sourceCol.data.name);
                target.push(targetCol.data.name);
            }
            composites.push(`FOREIGN KEY (${source.join(", ")}) REFERENCES ${tableName}(${target.join(", ")})`)
        }

        // get simple fks
        const keys = this.edges.filter(x => x.data.compositeGroup === null).map(x => {
            const sourceCol = state.nodes$.find(n => n.id === x.source);
            const targetTable = state.nodes$.find(n => n.id === x.target.split("/")[0]);
            const targetCol = state.nodes$.find(n => n.id === x.target);
            return (`FOREIGN KEY (${sourceCol.data.name}) REFERENCES ${targetTable.data.name}(${targetCol.data.name})`)
        })
        
        return [...keys, ...composites];
    }
}

class Table{
    public name: string;
    public cols: Column[] = [];
    public pk: Pk | null = null;
    public unique: Unique | null = null;
    public index: Index | null = null;
    public fk: ForeignKey | null = null;
    constructor (tableNode: any) {
        this.name = tableNode.data.name;
    }
    toSql(){
        
        const sql: string[] = [];
        this.cols.forEach(c => sql.push(c.toSql()));
        if (this.unique && this.unique.uniques.length) {
            this.unique.toSql().forEach(x => sql.push("UNIQUE (" +x + ")"))
        }

        if (this.pk && this.pk.cols.length) {
            sql.push("PRIMARY KEY (" + this.pk.toSql() + ")");
        }

        if (this.fk && this.fk.edges.length) {
            this.fk.toSql().forEach(x => sql.push(x))
        }

        return `CREATE TABLE IF NOT EXISTS ${this.name} (
    ${sql.join(",\n    ")}
);

${this.index && this.index.toSql().join("\n\n")}
`;
    }
}
export const generateSqlSchema = () => {

    const tables: Record<string, any> = {};

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

    for (const [key,] of Object.entries(tables)) {
        tables[key].pk = new Pk(primaryKey$.value[key] ? primaryKey$.value[key].cols : []);
        tables[key].index = new Index(indexes$.value[key] ? indexes$.value[key].map(x => x.cols) : [])
        tables[key].unique = new Unique(uniqueKeys$.value[key] ? uniqueKeys$.value[key].map(x => x.cols) : []);
        tables[key].fk = new ForeignKey(state.edges$.filter(x => x.source.split("/")[0] === key));
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
