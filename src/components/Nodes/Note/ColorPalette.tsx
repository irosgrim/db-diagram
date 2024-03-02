import { CSSProperties, useRef, useState } from "react";
import "../style/color-palette.scss";
import { useOnClickOutside } from "../../../hooks/onClickOutside";
const colors = ["#feff9c", "#c5afe4", "#fce9db", "#ffcc83", "#fed6ef", "#aaedf1", "#94d77c", "#bcdfc8", "#f3fff0"];

type ColorPaletteProps = {
    color: string;
    onChange: (color: string) => void;
    style?: CSSProperties;
}

export const ColorPalette = ({ color, onChange, style }: ColorPaletteProps) => {
    const [showColorPalette, setShowColorPalette] = useState(false);
    const colorPaletteRef = useRef(null);

    useOnClickOutside(colorPaletteRef, () => setShowColorPalette(false));
    return (
        <div className="color-palette-wrapper">
            <button
                type="button"
                style={{ backgroundColor: color }}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPalette(true)
                }}
                className="color-button"
            >
            </button>

            {
                showColorPalette && (
                    <div style={{ position: "relative" }}>
                        <ul
                            className="color-palette"
                            style={style}
                            ref={colorPaletteRef}
                        >
                            {
                                colors.map(x => (
                                    <li key={x}>
                                        <button
                                            type="button"
                                            style={{ backgroundColor: x }}
                                            className="color-button"
                                            onClick={() => onChange(x)}
                                        >
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                )
            }
        </div>
    )
}