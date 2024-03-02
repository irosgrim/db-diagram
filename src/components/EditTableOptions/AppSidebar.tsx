import { newTable } from "../../state/createNodes";
import { generateCssClass } from "../../utils/styling"
import { Icon } from "../Icon";
import { TableSection } from "./TableSection";
import { memo } from "react";

type AppSidebarProps = {
    hidden: boolean;
    onShowHide: () => void;
}

export const AppSidebar = memo(({ hidden, onShowHide }: AppSidebarProps) => {
    return (
        <aside className={generateCssClass("aside", { hidden: hidden })}>
            <button type="button" className="hide-btn normal-btn" onClick={() => onShowHide()}>{
                hidden ? <Icon type="arrow-right" /> : <Icon type="arrow-left" />
            } </button>
            <div className="sidebar-content">
                <button type="button" className="new-btn" onClick={() => newTable()}><Icon type="plus" width="12" /> <span style={{ marginLeft: "1rem" }}>Add new table</span></button>
                <nav>
                    <TableSection />
                </nav>
            </div>
        </aside>
    )
});