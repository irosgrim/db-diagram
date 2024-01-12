import { state } from "../../state/globalState";
import { TableData } from "../../types/types";
import { generateCssClass, randomColor } from "../../utils/styling"
import { Icon } from "../Icon";
import { TableSection } from "./TableSection";
import { Node } from "reactflow";

type AppSidebarProps = {
    hidden: boolean;
    onShowHide: () => void;
}

const newTable = () => {
    const allTables = state.nodes$;
    let highestNum = allTables.map(x => {
        const [, n] = x.id.split("_");
        return +n;
    }).sort((a, b) => b - a)[0] || 0;

    let newId = `table_${highestNum + 1}`;
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

    const nT: Node<TableData>[] = [
        {
            id: newId,
            data: {
                name: newName,
                backgroundColor: randomColor(),
                columns: [
                    {
                        id: newId + "/col_1",
                        name: "id",
                        type: "SERIAL",
                        unique: false,
                        notNull: true,
                    }
                ]
            },
            position: { x: 10 + highestNum + 10, y: 200 + highestNum + 10 },
            className: "light",
            type: "table",
        },
    ];

    state.nodes$ = [...state.nodes$, ...nT];
}

export const AppSidebar = ({ hidden, onShowHide }: AppSidebarProps) => {
    return (
        <aside className={generateCssClass("aside", { hidden: hidden })}>
            <button type="button" className="hide-btn normal-btn" onClick={() => onShowHide()}>{
                hidden ? <Icon type="arrow-right" /> : <Icon type="arrow-left" />
            } </button>
            <div className="sidebar-content">
                <button type="button" className="new-btn" onClick={newTable}><Icon type="plus" width="12" /> <span style={{ marginLeft: "1rem" }}>Add new table</span></button>
                <nav>
                    <ul className="tables-nav">
                        {
                            state.nodes$.map(t => (
                                <TableSection
                                    table={t} key={t.id}
                                />
                            ))
                        }
                    </ul>
                </nav>
            </div>
        </aside>
    )
}