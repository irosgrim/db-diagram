import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Icon } from '../../Icon';
import { primaryKey$ } from '../../../state/globalState';

type ColumnProps = {
    tableId: string;
    index: number;
    data: {
        id: string;
        name: string;
        type: string;
        unique: boolean;
        notNull: boolean;
        index: boolean;
    },
}


const Column = ({ tableId, index, data }: ColumnProps) => {
    const onClick = (e: any) => {
        const colInputEl = document.getElementById("input_" + data.id);
        if (colInputEl) {
            colInputEl.focus();
        }
    };

    return (
        <div
            className="column-container" onClick={onClick}
        >
            <Handle type="source" position={Position.Right} id={"R:" + data.id} key={"R:" + index} />
            <div className="col" title={data.name}>
                <div className="col-text">
                    {primaryKey$.value[tableId]?.cols.includes(data.id) && <span style={{ position: "absolute", left: 0, top: "1px" }}> <Icon type="flag" height="10" width="10" /> </span>}
                    {data.unique === true && <span style={{ position: "absolute", left: 0, top: "1px" }}> <Icon type="star" height="10" width="10" /> </span>}
                    <div className="col-name">{data.name}</div>
                </div>
                <div className="col-type" title={data.type + " " + (data.notNull ? " not null" : " nullable")}>{data.type}{!data.notNull && "?"}</div>
            </div>

            <Handle type="source" position={Position.Left} id={"L:" + data.id} key={"L:" + index} />
        </div>
    );
}

export default Column;