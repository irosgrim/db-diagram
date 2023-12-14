import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";



type SelectProps = {
    type: "single" | "multi";
    options: { id: string; name: string }[];
    selected?: { id: string; name: string }[];
    onSelectionChange?: (options: { id: string; name: string }[]) => void;
}

export const Select = ({ type = "single", options, selected, onSelectionChange }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<{ id: string; name: string }[]>(selected || []);

    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelectOption = (option: { id: string; name: string }) => {

        if (type === "single") {
            const newSelectedOptions = [option];

            setSelectedOptions(newSelectedOptions);

            if (onSelectionChange) {
                onSelectionChange(newSelectedOptions);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            //@ts-ignore
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className="multi-select-dropdown" ref={dropdownRef}>
            <div className="input" onClick={toggleDropdown}>
                {type === "single" && selectedOptions.length ? <Icon type={selectedOptions[0].id as "key" | "star"} /> : <></>}
                {type === "multi" && selectedOptions.map(x => x.name).join(', ')}
            </div>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map(option => (
                        <li
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                            className={selectedOptions.find(o => o.id === option.id) ? 'selected' : ''}
                        >
                            <Icon type={option.id as "key" | "star"} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )

}