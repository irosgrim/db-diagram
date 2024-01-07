import { Node } from "reactflow";

export const tableTemplate: Node[] = [
    {
      id: "table_1",
      data: { name: "table_1", backgroundColor: "#f78ae0", height: null },
      position: { x: 10, y: 200 },
      className: "light",
      style: { backgroundColor: "#ffffff", minWidth: "250px", padding: 0, width: 250, height: 40 },
      resizing: true,
      width: 200,
      height: 40,
      type: "group",
    },
    {
      id: "table_1/col_1",
      type: "column",
      position: { x: 0, y: 20 },
      data: { name: "id", type: "SERIAL", unique: false, notNull: true, index: false },
      parentNode: "table_1", extent: "parent",
      draggable: false,
      expandParent: true,
      width: 300,
      height: 20,
    },
  ];