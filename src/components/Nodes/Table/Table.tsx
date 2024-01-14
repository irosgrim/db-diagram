import { NodeProps, useUpdateNodeInternals } from "reactflow";
import { getGoodContrastColor } from "../../../utils/styling";
import Column from "../Column/Column";
import { state } from "../../../state/globalState";
import { useEffect } from "react";

export const Table = ({ id, data }: NodeProps) => {
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        const node = state.nodes$.find(x => x.id === id);
        if (node) {
            updateNodeInternals(id);
        }
    }, [id, data.columns, updateNodeInternals]);

    const table = state.nodes$.find(x => x.id === id);

    return (
        <div className="table" style={{ minWidth: "250px" }}>
            <div style={{
                backgroundColor: data.backgroundColor,
                color: getGoodContrastColor(data.backgroundColor),
                borderRadius: "1.5px 1.5px 0 0",
                display: "flex", justifyContent: "space-between",
                borderBottom: "1px solid #ababab"
            }}>
                <span>&nbsp; :::</span>
                <span>{data.name}</span>
                <span></span>
            </div>
            {
                table && table.data.columns.map((c: any, idx: number) => <Column tableId={id} data={c} index={idx} key={idx} />)
            }
        </div>
    );
};
