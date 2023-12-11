import { useCallback, useState } from 'react';
import { useStore, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

import { getEdgeParams } from './utils';

const onEdgeClick = (evt: any, id: any) => {
    evt.stopPropagation();
    alert(`remove ${id}`);
};


const FloatingEdge = ({ id, source, target, markerEnd, style }: any) => {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));
    const [showOpts, setShowOpts] = useState(false);
    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });


    return (
        <>
            <g onClick={() => setShowOpts(true)} onMouseLeave={() => setShowOpts(false)} >
                <path style={style} className="react-flow__edge-path-selector" d={edgePath} fillRule="evenodd" />
                <path style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} fillRule="evenodd" />
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        {
                            showOpts && <button className="edgebutton" onClick={(event) => onEdgeClick(event, id)}>
                                ×
                            </button>
                        }
                    </div>
                </EdgeLabelRenderer>
            </g>
        </>
    );
}

export default FloatingEdge;