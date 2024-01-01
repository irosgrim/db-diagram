import { Signal, signal } from "@preact/signals-react";
import { Edge, Node } from "reactflow";
import { AllDiagrams } from "./storage";

export const currentModal$: Signal<{type: "add-constraint" | "add-index" | "add-referential-actions" | "delete-confirm"; props?: any } | null> = signal(null);

export const primaryKey$: Signal<Record<string, {cols: string[]}>> = signal({});
export const uniqueKeys$: Signal<Record<string, {cols: string[]}[]>> = signal({});
export const indexes$: Signal<Record<string, {cols: string[]; unique: boolean}[]>> = signal({});

export const edgeOptions$: Signal<Edge | null> = signal(null);

export const selectedTable$: Signal<string | null> = signal(null);

export const localStorageCopy$: Signal<AllDiagrams> = signal({
    files: {},
    active: null,
});

class State {
    nodes: Signal<Node[]> = signal([]);
    edges: Signal<Edge[]> = signal([]);

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
