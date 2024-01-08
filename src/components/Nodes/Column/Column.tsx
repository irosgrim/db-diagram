import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Icon } from '../../Icon';
import { primaryKey$ } from '../../../state/globalState';
import { COLUMN_NODE_HEIGHT, NODE_WIDTH } from '../consts';

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
        <div className="column-container nodrag" onClick={onClick} style={{ width: NODE_WIDTH + "px", height: COLUMN_NODE_HEIGHT + "px" }}>
            <Handle type="source" position={Position.Right} id="right" />

            <div className="col" title={data.name}>
                <div className="col-text">
                    {primaryKey$.value[tableId]?.cols.includes(id) && <span style={{ position: "absolute", top: "1px" }}> <Icon type="flag" height="10" width="10" /> </span>}
                    {data.unique === true && <span style={{ position: "absolute", top: "1px" }}> <Icon type="star" height="10" width="10" /> </span>}
                    <div className="col-name">{data.name}</div>
                </div>
                <div className="col-type" title={data.type + " " + (data.notNull ? " not null" : " nullable")}>{data.type}{!data.notNull && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id="left" />
        </div>
    );
}

export default Column;