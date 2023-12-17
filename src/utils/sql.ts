import { state } from "../state/globalState";

export const generateSqlSchema = () => {
    const tables: any = {};
    const indexes: any = {};

    // create initial structure
    state.nodes$.forEach((node: any) => {
        if (node.type === "group") {
            tables[node.id] = {
                tableName: node.data.name,
                columns: [],
                indexes: [],
                foreignKeys: []
            };
        } else if (node.type === "column") {
            const tableId = node.parentNode;
            const columnData = {
                name: node.data.name,
                type: node.data.type,
                constraint: node.data.constraint,
                notNull: node.data.notNull
            };
            tables[tableId].columns.push(columnData);
        } else if (node.type === "index") {
            const tableId = node.parentNode;
            indexes[tableId] = indexes[tableId] || [];
            indexes[tableId].push(node.data);
        }
    });

    // add indexes to each table
    Object.keys(indexes).forEach(tableId => {
        if (tables[tableId]) {
            tables[tableId].indexes = indexes[tableId];
        }
    });

    // create foreign keys from edges
    state.edges$.forEach((edge: any) => {
        const sourceC = edge.source;
        const targetC = edge.target;

        const sourceTable = state.nodes$.find((x: any) => x.id === sourceC.split("/")[0]);
        const sourceColumn = state.nodes$.find((x: any) => x.id === sourceC);
        const targetTable = state.nodes$.find((x: any) => x.id === targetC.split("/")[0]);
        const targetColumn = state.nodes$.find((x: any) => x.id === targetC);

        if (sourceTable && sourceColumn && targetTable && targetColumn) {
            const fkData = {
                sourceTable: sourceTable.data.name,
                sourceColumn: sourceColumn.data.name,
                targetTable: targetTable.data.name,
                targetColumn: targetColumn.data.name
            };

            tables[sourceTable.id].foreignKeys.push(fkData);
        }
    });

    // generate sql for each table
    const sqlStatements = Object.values(tables).map((table: any) => {
        const columnDefs = table.columns.map((column: any) => {
            let constraint = "";
            if (column.constraint === "primary_key") {
                constraint = "PRIMARY KEY";
            } else if (column.constraint === "unique") {
                constraint = "UNIQUE";
            }

            const notNull = column.notNull ? "NOT NULL" : "";
            return `\t${column.name} ${column.type} ${[constraint, notNull].filter(Boolean).join(" ")}`;
        });

        const tableStatement = `CREATE TABLE IF NOT EXISTS ${table.tableName} (\n${columnDefs.join(",\n")}\n);`;

        const indexStatements = table.indexes.map((index: any) => {
            const unique = index.unique ? "UNIQUE" : "";
            return `CREATE ${unique} INDEX IF NOT EXISTS ON ${table.tableName} (${index.columns.map((x: any) => x.name).join(", ")});`;
        });

        const foreignKeyStatements = table.foreignKeys.map((fk: any) => {
            return `ALTER TABLE ${table.tableName} ADD FOREIGN KEY (${fk.sourceColumn}) REFERENCES ${fk.targetTable}(${fk.targetColumn});`;
        });

        return [tableStatement].concat(indexStatements).concat(foreignKeyStatements).join("\n\n");
    });

    return sqlStatements.join("\n\n");
};



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
