import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Icon } from './Icon';

type ColumnProps = {
    data: {
        name: string;
        type: string;
        primaryKey: boolean;
        nullable: boolean;
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
                    {data.primaryKey && <span style={{ position: "absolute", top: "1px" }}> <Icon type="key" height="10" width="5" /> </span>}
                    <div style={{ marginLeft: "0.7rem", fontSize: "0.75rem" }}>{data.name}</div>
                </div>
                {/* <input className="col-name" defaultValue={data.name} /> */}
                <div className="col-type" style={{ marginLeft: "1rem" }}>{data.type}{data.nullable && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id="d" />
        </div>
    );
}

export default Column;