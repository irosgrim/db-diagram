import { Position, internalsSymbol } from 'reactflow';

export const getProperty = (node: any) => {
    return {
        isNotNull: node.data.notNull,
        isIndex: node.data.index,
        unique: node.data.unique,
    }
}

const getHandleCoordsByPosition = (node: any, handlePosition: Position): [number, number] => {
  const handle = node[internalsSymbol].handleBounds.source.find(
    (h: any) => h.position === handlePosition
  );

  if (!handle) {
    return [0, 0];
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // make the markerEnd of an edge visible.
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

const calculateDistance = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export const getEdgeParams = (source: any, target: any) => {
  const sourceLeftHandle = getHandleCoordsByPosition(source, Position.Left);
  const sourceRightHandle = getHandleCoordsByPosition(source, Position.Right);

  const targetLeftHandle = getHandleCoordsByPosition(target, Position.Left);
  const targetRightHandle = getHandleCoordsByPosition(target, Position.Right);

  const halfSourceWidth = source.width / (source.width/2);
  const halfTargetWidth = target.width / (target.width/2);

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
  const [sx, sy] = getHandleCoordsByPosition(source, closestPair.sourcePos);
  const [tx, ty] = getHandleCoordsByPosition(target, closestPair.targetPos);

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