import { Edge, Node } from "reactflow";
import { indexes$, localStorageCopy$, primaryKey$, state, uniqueKeys$ } from "../state/globalState";
import { ColumnData, TableData } from "../types/types";

class Column{
    public name: string;
    public type: string;
    public notNull: string;
    public unique: string;
    constructor(node: ColumnData) {
        this.name = node.name;
        this.type = node.type;
        this.notNull = node.notNull ? "NOT NULL" : "";
        this.unique = node.unique ? "UNIQUE" : "";
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
    public colId: string[];
    constructor(pk: string[], private nodes: Node[]) {
        this.colId = pk
    }
    toSql() {
        const parts = [];
        for (const id of this.colId) {
            const colEl = this.nodes.find(x => x.id === id);
            if (colEl) {
                parts.push(colEl.data.name);
            }
        }
        return parts.join(", ")
    }
}

class Unique {
    public uniques: string[][];
    public tableId: string = "";

    constructor(uniques: string[][], private nodes: Node[]) {
        this.uniques = uniques;
    }

    toSql() {
        const parts: {name: string, cols: string[]}[] = [];
        for (const u of this.uniques) {
            const cols: string[] = [];
            for (let i=0; i < u.length; i++) {
                const colEl = this.nodes.find(x => x.id === u[i]);
                if (colEl) {
                    this.tableId = colEl.parentNode!;
                    cols.push(colEl.data.name);
                    if(i === u.length - 1) {
                        parts.push({name: cols.join("_"), cols: cols});
                    }
                }
            }
        }
        const str: string[] = [];
        for (const p of parts) {
            str.push(`${p.cols.join(", ")})`);
        }

        return str;
    }
}

class Index {
    public tableId: string = "";
    constructor (private indexes: string[][], private nodes: Node[]) {
        this.indexes = indexes;
    }

    toSql() {
        const parts: {name: string; cols: string[]}[] = [];
        for (const idx of this.indexes) {
            const cols = [];
            for (let i=0; i < idx.length; i++) {
                const colEl = this.nodes.find(x => x.id === idx[i]);
                if (colEl) {
                    this.tableId = colEl.parentNode!;
                    cols.push(colEl.data.name);
                    if(i === idx.length - 1) {
                        parts.push({name: cols.join("_"), cols: cols});
                    }
                }
            }
        }
        const str: string[] = [];
        const tableName = this.nodes.find(n => n.id === this.tableId);
        for (const p of parts) {
            str.push(
                `CREATE INDEX ${p.name}_idx
ON ${tableName!.data.name} (${p.cols.join(", ")});`
            )
        }

        return str;

    }
}

class ForeignKey {
    public edges: Edge[] = [];
    constructor(edges: Edge[], private nodes: Node[]) {
        this.edges = edges;
    }
    toSql() {
        // get composite fks
        const composite: Record<string, Edge[]> = this.edges.reduce((acc: any, curr: Edge) => {
            if (curr.data.compositeGroup !== null) {
                acc[curr.data.compositeGroup] = [...(acc[curr.data.compositeGroup] ? acc[curr.data.compositeGroup] : []), curr];
            }
            return acc;
        }, {} as Record<string, Edge[]>);

        const composites: string[] = [];
        for (const fk of Object.values(composite)) {
            const source = [];
            const target = [];
            let tableName = "";
            let onDelete = "";
            let onUpdate = "";
            for (const group of fk) {
                const sourceTable = this.nodes.find(n => n.id === group.source);
                const sourceCol = sourceTable?.data.columns.find((c: ColumnData) => c.id === group.sourceHandle);

                const targetTable = this.nodes.find(n => n.id === group.target);
                const targetCol = targetTable?.data.columns.find((n: ColumnData) => n.id === group.targetHandle);
            
                tableName = targetTable!.data.name;
                onDelete = group.data.onDelete;
                onUpdate = group.data.onUpdate;
                source.push(sourceCol!.name);
                target.push(targetCol!.name);
            }
            const ref = [];
            if (onDelete) {
                ref.push(`        ${onDelete}`);
            }
            if (onUpdate) {
                ref.push(`        ${onUpdate}`);
            }
            composites.push(`FOREIGN KEY (${source.join(", ")}) REFERENCES ${tableName}(${target.join(", ")}) ${ref.length > 0 ? "\n" + ref.join("\n") : ""}`)
        }

        // get simple fks
        const keys = this.edges.filter(x => x.data.compositeGroup === null).map(x => {
            const sourceTable = this.nodes.find(n => n.id === x.source);
            const sourceCol = sourceTable?.data.columns.find((c: ColumnData) => c.id === x.sourceHandle);

            const targetTable = this.nodes.find(n => n.id === x.target);
            const targetCol = targetTable?.data.columns.find((n: ColumnData) => n.id === x.targetHandle);

            const onDelete = x.data.onDelete;
            const onUpdate = x.data.onUpdate;
            const ref = [];
            if (onDelete) {
                ref.push(`        ${onDelete}`);
            }
            if(onUpdate) {
                 ref.push(`        ${onUpdate}`);
            };
            
            const txt = `FOREIGN KEY (${sourceCol!.name}) REFERENCES ${targetTable!.data.name}(${targetCol.name}) ${ref.length > 0 ? "\n" + ref.join("\n") : ""}`
            return txt;
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

        if (this.pk && this.pk.colId.length) {
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

type SqlDeps = {
    nodes: Node<TableData>[], 
    edges: Edge[], 
    primaryKey: Record<string, {cols: string[]}>, 
    indexes: Record<string, {cols: string[]; unique: boolean}[]>, 
    uniqueKeys: Record<string, {cols: string[]}[]>
};

export const generateSqlSchema = (deps: SqlDeps) => {
    const { nodes, edges, primaryKey, indexes, uniqueKeys} = deps;
    let tables: Record<string, any> = {};
    console.log(edges);

    for (const n of nodes) {
        tables[n.id] = new Table(n);
        tables[n.id].cols = n.data.columns.map(x => new Column(x))

    }

    for (const [key,] of Object.entries(tables)) {
        tables[key].pk = new Pk(primaryKey[key] ? primaryKey[key].cols : [], nodes);
        tables[key].index = new Index(indexes[key] ? indexes[key].map(x => x.cols) : [], nodes)
        tables[key].unique = new Unique(uniqueKeys[key] ? uniqueKeys[key].map(x => x.cols) : [], nodes);
        tables[key].fk = new ForeignKey(edges.filter(x => x.source.split("/")[0] === key), nodes);
    } 


    const str = [];

    for (const t of Object.values(tables)) {
        str.push(t.toSql());
    }


    return str.join("\n");
}

export const POSTGRES_TYPES = [
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

export type PostgresType = typeof POSTGRES_TYPES[number];

export const REFERENTIAL_ACTIONS = {
    onDelete: [
    "ON DELETE CASCADE",
    "ON DELETE SET NULL",
    "ON DELETE SET DEFAULT",
    "ON DELETE RESTRICT",
    ] as const,
    onUpdate: [
        "ON UPDATE CASCADE",
        "ON UPDATE SET NULL",
        "ON UPDATE SET DEFAULT",
        "ON UPDATE RESTRICT",
    ] as const,
};

export type ON_DELETE = typeof REFERENTIAL_ACTIONS.onDelete | null;
export type ON_UPDATE = typeof REFERENTIAL_ACTIONS.onUpdate | null;


export const exportSql = () => {
    if (state.nodes$.length > 0) {
        const schema = generateSqlSchema({
            nodes: state.nodes$,
            edges: state.edges$,
            primaryKey: primaryKey$.value,
            indexes: indexes$.value,
            uniqueKeys: uniqueKeys$.value,
        })
        if (schema) {
            const blob = new Blob([schema], { type: "text" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${localStorageCopy$.value.files[localStorageCopy$.value.active!].name}-${new Date().toISOString()}.sql`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
    }
}