import { Node } from "reactflow";
import { COLUMN_NODE_HEIGHT, NODE_WIDTH } from "../Nodes/consts";

export const tableTemplate: Node[] = [
    {
      id: "table_1",
      data: { name: "table_1", backgroundColor: "#f78ae0", height: null },
      position: { x: 10, y: 200 },
      className: "light",
      style: { backgroundColor: "#ffffff", padding: 0},
      resizing: true,
      width: NODE_WIDTH,
      height: COLUMN_NODE_HEIGHT * 2,
      type: "group",
    },
    {
      id: "table_1/col_1",
      type: "column",
      position: { x: 0, y: COLUMN_NODE_HEIGHT },
      data: { name: "id", type: "SERIAL", unique: false, notNull: true, index: false },
      parentNode: "table_1", extent: "parent",
      draggable: false,
      expandParent: true,
      width: NODE_WIDTH,
      height: COLUMN_NODE_HEIGHT,
    },
  ];