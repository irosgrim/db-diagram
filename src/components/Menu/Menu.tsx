import { menuModal$ } from "../../state/globalState";
import "./style/menu.scss";

type MenuProps = {
    onClose: () => void;
}
export const Menu = ({ onClose }: MenuProps) => {
    return (
        <nav className="menu-wrapper">
            <ul>
                <li><button type="button">Export...</button></li>
                <li><button type="button">Duplicate</button></li>
                <li><button type="button">Rename</button></li>
                <li><button type="button" onClick={() => {
                    menuModal$.value = "delete";
                    onClose();
                }}>Delete</button></li>
            </ul>
        </nav>
    )
}