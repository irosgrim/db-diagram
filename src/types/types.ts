import {Edge} from "reactflow";
import { PostgresType } from "../utils/sql";

export type ColumnData = {
    name: string;
    type: PostgresType;
    unique: Boolean;
    notNull: Boolean;
};

export type TableData = {
    name: string;
    backgroundColor: string;
    height: number | null;
}

export type RelationEdgeData = {
    label: "relation" | null;
    compositeGroup: string | null;
    color: string;
    onDelete: string | null; 
    onUpdate: string | null;
}

export type RelationEdge = Edge<RelationEdgeData>;