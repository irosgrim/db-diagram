import {Edge} from "reactflow";
import { PostgresType } from "../utils/sql";

export type ColumnData = {
    id: string;
    name: string;
    type: PostgresType;
    unique: Boolean;
    notNull: Boolean;
};

export type TableData = {
    name: string;
    backgroundColor: string;
    columns: ColumnData[];
}

export type RelationEdgeData = {
    sourceHandle: string;
    targetHandle: string;
    compositeGroup: string | null;
    color: string;
    onDelete: string | null; 
    onUpdate: string | null;
}

export type RelationEdge = Edge<RelationEdgeData>;