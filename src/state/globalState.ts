import { Signal, signal } from "@preact/signals-react";
import { Edge, Node } from "reactflow";

export const currentModal$: Signal<{type: "add-constraint" | "add-index"; props?: any } | null> = signal(null);

export const primaryKey$: Signal<Record<string, {cols: string[]}>> = signal({});
export const uniqueKeys$: Signal<Record<string, {cols: string[]}[]>> = signal({});
export const indexes$: Signal<Record<string, {cols: string[]; unique: boolean}[]>> = signal({});


export const edgeOptions$: Signal<Edge | null> = signal(null);


class State {
    nodes: Signal<Node[]> = signal([]);
    private edges: Signal<Edge[]> = signal([]);

    get nodes$() {
        return this.nodes.value;
    }
    set nodes$(value: any[]) {
        this.nodes.value = value;
    }

    get edges$(): Edge[] {
        return this.edges.value;
    }
    set edges$(value: any[]) {
        this.edges.value = value;
    }
}

export const state = new State();

