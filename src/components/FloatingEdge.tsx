import { useCallback, useEffect, useState } from 'react';
import { useStore, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

import { getEdgeParams } from './utils';
import { Icon } from './Icon';
import { edgeOptions$, state } from '../state/globalState';
import { computed } from '@preact/signals-react';

type EdgeProps = {
    id: string;
    source: any;
    target: any;
    markerEnd?: any;
    style?: any;
    data: any;
}

const FloatingEdge = ({ id, data, source, target, markerEnd, style }: EdgeProps) => {
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


    const onEdgeClick = (evt: any, id: any) => {
        evt.stopPropagation();
        edgeOptions$.value = { ...edgeOptions$.value, id, data, source, target };
    };



    return (
        <>
            <g onClick={() => setShowOpts(true)} onMouseLeave={() => setShowOpts(false)} >
                <path style={style} className="react-flow__edge-path-selector" d={edgePath} fillRule="evenodd" />
                <path style={data.compositeGroup !== null ? { stroke: data.color } : style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} fillRule="evenodd" />
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
                            showOpts && data.compositeGroup === null && (
                                <button className="edge-btn" onClick={(event) => onEdgeClick(event, id)}>
                                    <Icon type="key" />
                                </button>
                            )
                        }
                        {
                            data.compositeGroup !== null && <button className="edge-btn" onClick={(event) => onEdgeClick(event, id)}>
                                <Icon type="multi-key" />
                            </button>
                        }
                    </div>
                </EdgeLabelRenderer>
            </g>
        </>
    );
}

export default FloatingEdge;