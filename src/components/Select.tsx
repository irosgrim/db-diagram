import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { useOnClickOutside } from "../hooks/onClickOutside";
import "../style/select.scss";

type SelectProps = {
    type: "single" | "multi";
    options: { id: "primary_key" | "unique" | "none"; icon: "flag" | "star" | "circle", name: string }[];
    selected?: "primary_key" | "unique" | "none";
    onSelectionChange?: (id: string) => void;
}

const ICON_MAPPING: Record<"primary_key" | "unique" | "none", "flag" | "star" | "circle"> = {
    primary_key: "flag",
    unique: "star",
    none: "circle",
}

export const Select = ({ type = "single", options, selected = "none", onSelectionChange }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<"primary_key" | "unique" | "none">(selected || "none");

    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelectOption = (option: { id: "primary_key" | "unique" | "none"; icon: "flag" | "star" | "circle", name: string }) => {

        if (type === "single") {
            const newSelectedOption = option.id;

            setSelectedOption(newSelectedOption);

            if (onSelectionChange) {
                onSelectionChange(newSelectedOption);
            }
        }
        setIsOpen(false);
    };

    useOnClickOutside(dropdownRef, () => setIsOpen(false));


    return (
        <div className="select-dropdown" ref={dropdownRef}>
            <div className="input" onClick={toggleDropdown}>
                {type === "single" && selectedOption.length ? <Icon type={ICON_MAPPING[selected]} /> : <></>}
            </div>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map(option => (
                        <li
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                        >
                            <Icon type={option.icon} /> <span>{option.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )

}