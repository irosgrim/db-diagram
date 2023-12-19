import { useRef, useState } from 'react';
import { useOnClickOutside } from '../hooks/onClickOutside';

type MultiSelectProps = {
    options: { id: string; name: string }[];
    selected?: { id: string; name: string }[];
    onSelectionChange?: (options: { id: string; name: string }[]) => void;
}
export const MultiSelect = ({ options, selected = [], onSelectionChange }: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<{ id: string; name: string }[]>(selected || []);

    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelectOption = (option: { id: string; name: string }) => {
        const newSelectedOptions = selectedOptions.find(o => o.id === option.id)
            ? selectedOptions.filter(opt => opt.id !== option.id)
            : [...selectedOptions, option];

        setSelectedOptions(newSelectedOptions);

        if (onSelectionChange) {
            onSelectionChange(newSelectedOptions);
        }
    };

    useOnClickOutside(dropdownRef, () => setIsOpen(false))

    return (
        <div className="multi-select-dropdown" ref={dropdownRef}>
            <div className="input" onClick={toggleDropdown}>
                {selectedOptions.map(x => x.name).join(', ')}
            </div>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map(option => (
                        <li
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                            className={selectedOptions.find(o => o.id === option.id) ? 'selected' : ''}
                        >
                            {option.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
