import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Icon } from '../../Icon';
import { primaryKey$ } from '../../../state/globalState';

type ColumnProps = {
    id: string;
    data: {
        name: string;
        type: string;
        unique: boolean;
        notNull: boolean;
        index: boolean;
    },
}

const Column = ({ id, data }: ColumnProps) => {
    const tableId = id.split("/")[0];

    const onClick = useCallback(() => {
        // console.log(id);
    }, []);

    return (
        <div className="column-container nodrag" onClick={onClick}>
            <Handle type="source" position={Position.Right} id="right" />

            <div className="col">
                <div style={{ position: "relative" }}>
                    {primaryKey$.value[tableId]?.cols.includes(id) && <span style={{ position: "absolute", top: "1px" }}> <Icon type="flag" height="10" width="10" /> </span>}
                    {data.unique === true && <span style={{ position: "absolute", top: "1px" }}> <Icon type="star" height="10" width="10" /> </span>}
                    <div style={{ marginLeft: "0.7rem", fontSize: "0.75rem" }}>{data.name}</div>
                </div>
                <div className="col-type">{data.type}{!data.notNull && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id="left" />
        </div>
    );
}

export default Column;