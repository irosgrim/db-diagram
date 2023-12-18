import { Signal, signal } from "@preact/signals-react";
import { Edge } from "reactflow";

export const edgeOptions: any = signal({
    showEdgeOptions: null,
    fkType: {}
});

export const currentModal$: Signal<{type: "add-constraint" | "add-index"; props?: any } | null> = signal(null);

// export const nodes: Signal<any[]> = signal([]);
export const primaryKey$: Signal<Record<string, {name: string; cols: string;}>> = signal({});
export const uniqueKeys$: Signal<Record<string, {name: string; cols: string;}[]>> = signal({});
export const indexes$: Signal<Record<string, {name: string; cols: string; unique: boolean}[]>> = signal({});


class State {
    private nodes: Signal<any[]> = signal([]);
    private edges: Signal<(Edge | any)[]> = signal([]);

    get nodes$() {
        return this.nodes.value;
    }
    set nodes$(value: any[]) {
        this.nodes.value = value;
    }

    get edges$() {
        return this.edges.value;
    }
    set edges$(value: any[]) {
        this.edges.value = value;
    }
}

export const state = new State();