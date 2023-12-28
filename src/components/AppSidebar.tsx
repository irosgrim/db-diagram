import { state } from "../state/globalState";
import { generateCssClass, randomColor } from "../utils/styling"
import { Icon } from "./Icon";
import { TableSection } from "./TableSection";

type AppSidebarProps = {
    hidden: boolean;
    onShowHide: () => void;
}


const newTable = () => {
    const allTables = state.nodes$.filter(x => x.type === "group");
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

    const nT = [
        {
            id: newId,
            data: { name: newName, backgroundColor: randomColor() },
            position: { x: 10 + highestNum + 10, y: 200 + highestNum + 10 },
            className: "light",
            style: { backgroundColor: "#ffffff", width: "200px", padding: 0 },
            resizing: true,
            type: "group",
        },
        {
            id: `table_${highestNum + 1}/col_1`,
            type: "column",
            position: { x: 0, y: 20 },
            data: { name: "id", type: "SERIAL", unique: false, notNull: true, index: false },
            parentNode: newId, extent: "parent",
            draggable: false,
            expandParent: true,
        },
    ];

    state.nodes$ = [...state.nodes$, ...nT];
}

export const AppSidebar = ({ hidden, onShowHide }: AppSidebarProps) => {
    return (
        <aside className={generateCssClass("aside", { hidden: hidden })}>
            <button className="hide-btn normal-btn" onClick={() => onShowHide()}>{
                hidden ? <Icon type="arrow-right" /> : <Icon type="arrow-left" />
            } </button>
            <div className="sidebar-content">
                <button className="new-btn" onClick={newTable}><Icon type="plus" width="12" /> <span style={{ marginLeft: "1rem" }}>Add new table</span></button>
                <nav>
                    <ul className="tables-nav">
                        {
                            state.nodes$.filter(n => n.type === "group").map(t => (
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