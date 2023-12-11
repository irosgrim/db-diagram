import React, { useEffect, useRef, useState } from 'react';
import "../style/autocomplete.scss";

type AutocompleteProps = {
    suggestions: string[];
    value: string;
    onChange: (value: string) => void;
}

const Autocomplete = ({ suggestions, value, onChange }: AutocompleteProps) => {
    const [input, setInput] = useState(!value ? suggestions.length ? suggestions[0] : "" : value);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [timer, setTimer] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
                setFilteredSuggestions([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const onEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.target.value;
        setInput(userInput);
        onChange(userInput);

        const filtered = suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(userInput.toLowerCase())
        );

        setFilteredSuggestions(userInput && filtered.length === 0 ? suggestions : filtered);

        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => {
            setFilteredSuggestions([]);
        }, 3000));
    };

    useEffect(() => {
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [timer]);

    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        setInput(target.innerText);
        onChange(target.innerText);

        // Optionally, clear the suggestions list
        setFilteredSuggestions([]);
    };

    return (
        <div className="autocomplete-container">
            <input
                type="text"
                onChange={onEdit}
                value={input}
            />
            {filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown">

                    <ul ref={dropdownRef}>
                        {filteredSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={onClick}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                    {/* <button className="close-button" onClick={closeDropdown}>X</button> */}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;
