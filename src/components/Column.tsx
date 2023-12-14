import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Icon } from './Icon';

type ColumnProps = {
    data: {
        name: string;
        type: string;
        constraint: "primary_key" | "unique" | "none";
        notNull: boolean;
        index: boolean;
    },
}

function Column({ data }: ColumnProps) {
    const onClick = useCallback(() => {
        console.log(data);
    }, []);

    return (
        <div className="column-container nodrag" onClick={onClick}>
            <Handle type="source" position={Position.Right} id="b" />

            <div className="col" style={{ fontSize: "0.75rem" }}>
                <div style={{ position: "relative" }}>
                    {data.constraint === "primary_key" && <span style={{ position: "absolute", top: "1px" }}> <Icon type="key" height="10" width="5" /> </span>}
                    {data.constraint === "unique" && <span style={{ position: "absolute", top: "1px" }}> <Icon type="star" height="10" width="10" /> </span>}
                    <div style={{ marginLeft: "0.7rem", fontSize: "0.75rem" }}>{data.name}</div>
                </div>
                {/* <input className="col-name" defaultValue={data.name} /> */}
                <div className="col-type" style={{ marginLeft: "1rem" }}>{data.type}{!data.notNull && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id="d" />
        </div>
    );
}

export default Column;