import { Signal, signal } from "@preact/signals-react";
import { Edge } from "reactflow";

export const edgeOptions: any = signal({
    showEdgeOptions: null,
    fkType: {}
});

// export const nodes: Signal<any[]> = signal([]);
export const edges: Signal<any[]> = signal([]);
export const foreignKeys: Signal<any | null> = signal(null);


class State {
    nodes: Signal<any[]> = signal([]);
    edges: Signal<(Edge | any)[]> = signal([]);

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