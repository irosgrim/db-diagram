import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import KeyIcon from "../icons/key.svg"

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

            <div className="col">
                <div style={{ position: "relative" }}>
                    {data.primaryKey && < img src={KeyIcon} alt="" style={{ position: "absolute", top: "6px", height: "12px", width: "6px", }} />}
                    <div className="col-name" style={{ marginLeft: "0.7rem" }}>{data.name}</div>
                </div>
                {/* <input className="col-name" defaultValue={data.name} /> */}
                <div className="col-type">{data.type}{data.nullable && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id="d" />
        </div>
    );
}

export default Column;