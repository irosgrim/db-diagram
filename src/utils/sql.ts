export const generateSqlSchema = (nodes: any[]) =>{
    const tables: any = {};
    const indexes: any = {};
    // const relations: any = {};

    nodes.forEach(node => {
        if (node.type === "group") {
            tables[node.id] = {
                tableName: node.data.name,
                columns: [],
                indexes: []
            };
        } else if (node.type === "column") {
            const tableId = node.parentNode;
            const columnData = {
                name: node.data.name,
                type: node.data.type,
                primaryKey: node.data.primaryKey,
                notNull: node.data.notNull
            };
            tables[tableId].columns.push(columnData);
        } else if (node.type === "index") {
            const tableId = node.parentNode;
            if (!indexes[tableId]) {
                indexes[tableId] = [];
            }
            indexes[tableId].push(node.data);
        }
    });

    Object.keys(indexes).forEach(tableId => {
        if (tables[tableId]) {
            tables[tableId].indexes = indexes[tableId];
        }
    });
    console.log({tables, indexes})
    // Generate SQL for each table
    const sqlStatements = Object.values(tables).map((table: any) => {
        const columnDefs = table.columns.map((column: any) => {
            const constraints = [
                column.primaryKey ? "PRIMARY KEY" : "",
                column.notNull ? "NOT NULL" : ""
            ].filter(Boolean).join(" ");
            return `\t${column.name} ${column.type} ${constraints}`;
        });

        const tableStatement = `CREATE TABLE IF NOT EXISTS ${table.tableName} (\n${columnDefs.join(",\n")}\n);`;

        const indexStatements = table.indexes.map((index: any) => {
            const unique = index.unique ? "UNIQUE" : "";
            return `CREATE ${unique} INDEX IF NOT EXISTS ON ${table.tableName} (${index.columns.map((x: any) => x.name).join(", ")});`;
        });

        return [tableStatement].concat(indexStatements).join("\n\n");
    });

    return sqlStatements.join("\n\n");
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
