import { Position, internalsSymbol, Node } from 'reactflow';

export const getProperty = (node: any) => {
    return {
        isNotNull: node.notNull,
        isIndex: node.index,
        unique: node.unique,
    }
}

const getHandleCoordsByPosition = (node: Node, handlePosition: Position, handleId: string): [number, number] => {
  
  const hh = handleId.split(":")[1];
  const handle = node[internalsSymbol]!.handleBounds!.source!.find((h: any) => {
    const handleTypeAndIds = h.id.split(":");
    const hId = handleTypeAndIds[1];
    return hId === hh && h.position === handlePosition;
  });

  if (!handle) {
    return [0, 0];
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // Adjust the offset based on the handle position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
  }

  const x = node.positionAbsolute!.x + handle.x + offsetX;
  const y = node.positionAbsolute!.y + handle.y + offsetY;

  return [x, y];
}


const calculateDistance = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export const getEdgeParams = (source: Node, target: Node, sourceHandle: string, targetHandle: string) => {
  const sourceLeftHandle = getHandleCoordsByPosition(source, Position.Left, sourceHandle);
  const sourceRightHandle = getHandleCoordsByPosition(source, Position.Right, sourceHandle);

  const targetLeftHandle = getHandleCoordsByPosition(target, Position.Left, targetHandle);
  const targetRightHandle = getHandleCoordsByPosition(target, Position.Right, targetHandle);

  const halfSourceWidth = source.width! / (source.width!/2);
  const halfTargetWidth = target.width! / (target.width!/2);

  const distances = [
    { distance: calculateDistance(sourceLeftHandle, targetLeftHandle), sourcePos: Position.Left, targetPos: Position.Left },
    { distance: calculateDistance(sourceRightHandle, targetLeftHandle) + halfSourceWidth, sourcePos: Position.Right, targetPos: Position.Left },
    { distance: calculateDistance(sourceLeftHandle, targetRightHandle) + halfTargetWidth, sourcePos: Position.Left, targetPos: Position.Right },
    { distance: calculateDistance(sourceRightHandle, targetRightHandle) + halfSourceWidth + halfTargetWidth, sourcePos: Position.Right, targetPos: Position.Right },
  ];

  // find the pair with the minimum adjusted distance
  distances.sort((a, b) => a.distance - b.distance);
  const closestPair = distances[0];

  // get the coordinates for the closest handles
  const [sx, sy] = getHandleCoordsByPosition(source, closestPair.sourcePos, sourceHandle);
  const [tx, ty] = getHandleCoordsByPosition(target, closestPair.targetPos, targetHandle);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos: closestPair.sourcePos,
    targetPos: closestPair.targetPos,
  };
}



export const debounce = (func: (...args: any) => void, wait: number) =>{
    let timeout: number;

    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}