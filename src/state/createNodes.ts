import { v4 } from "uuid";
import { TableData } from "../types/types";
import { randomColor } from "../utils/styling";
import { state } from "./globalState";
import { Node } from "reactflow";

export const newTable = (coords?: [number, number]) => {
    const allTables = state.nodes$;
    let highestNum = allTables.map(x => {
        const [, n] = x.id.split("_");
        return +n;
    }).sort((a, b) => b - a)[0] || 0;

    let newId = `table_${v4()}`;
    let newName = `table_${highestNum + 1}`;

    let nameExists = true;

    while (nameExists) {
        const name = allTables.find(x => x.data.name === newName);
        if (name) {
            highestNum += 1;
            newName = `table_${highestNum}`;
        } else {
            nameExists = false;
        }
    }
    const position = coords ? { x: coords[0] + highestNum + 10, y: coords[1] + highestNum + 10 } : { x: 10 + highestNum + 10, y: 200 + highestNum + 10 };
    const nT: Node<TableData>[] = [
        {
            id: newId,
            data: {
                name: newName,
                backgroundColor: randomColor(),
                columns: [
                    {
                        id: newId + `col_${v4()}`,
                        name: "id",
                        type: "SERIAL",
                        unique: false,
                        notNull: true,
                    }
                ]
            },
            position,
            className: "light",
            type: "table",
        },
    ];

    state.nodes$ = [...state.nodes$, ...nT];
}

export const newNote = (coords: [number, number]) => {
    const position = coords ? { x: coords[0] + 10, y: coords[1] + 10 } : { x: 10 + 10, y: 200 + 10 };

    const note: Node<any> =
    {
        id: "note_" + v4(),
        data: {
            backgroundColor: "#feff9c",
            text: ""
        },
        position,
        type: "note",
    };

    state.nodes$ = [...state.nodes$, note];
}