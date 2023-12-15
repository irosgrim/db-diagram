import { Position, internalsSymbol } from 'reactflow';

const getParams = (nodeA: any, nodeB: any) => {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  let position;

  if (centerA.x > centerB.x) {
    position = Position.Left;
  }
  if (centerA.x < centerB.x) {
    position = Position.Right;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

const getHandleCoordsByPosition = (node: any, handlePosition: any) => {
  const handle = node[internalsSymbol].handleBounds.source.find(
    (h: any) => h.position === handlePosition
  );

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

const getNodeCenter = (node: any) => {
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2,
  };
}

export const getEdgeParams = (source: any, target: any) => {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}