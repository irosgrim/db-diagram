import { Node } from "reactflow";
import { TableData } from "../../types/types";

export const tableTemplate: Node<TableData> = {
  id: "table_1",
  data: { name: "table_1", backgroundColor: "#f78ae0", columns: [
    {
      id: "table_1/col_1", name: "id", type: "SERIAL", unique: false, notNull: true
    }
  ] },
  position: { x: 10, y: 200 },
  className: "light",
  type: "table",
};