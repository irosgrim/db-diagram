import { Signal, signal } from "@preact/signals-react";
import { Edge, Node } from "reactflow";
import { debounce, getLocalStorageState } from "../components/utils";

export const currentModal$: Signal<{type: "add-constraint" | "add-index" | "add-referential-actions"; props?: any } | null> = signal(null);

export const primaryKey$: Signal<Record<string, {cols: string[]}>> = signal({});
export const uniqueKeys$: Signal<Record<string, {cols: string[]}[]>> = signal({});
export const indexes$: Signal<Record<string, {cols: string[]; unique: boolean}[]>> = signal({});


export const edgeOptions$: Signal<Edge | null> = signal(null);

export const selectedTable$: Signal<string | null> = signal(null);

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


const storageWriter = (deps: {nodes: Node[], edges: Edge[], primaryKey: Record<string, {cols: string[]}>, uniqueKeys: Record<string, {cols: string[]}[]>, indexes: Record<string, {cols: string[]; unique: boolean}[]>}) => {
    const { nodes, edges, primaryKey, uniqueKeys, indexes } = deps;
    const appName = "db-diagram";
    const props = {
        nodes,
        edges,
        primaryKey,
        uniqueKeys,
        indexes,
    }
    if (nodes.length || edges.length || primaryKey || uniqueKeys.length || indexes.length) {
        localStorage.setItem(appName, JSON.stringify(props));
        console.log('Saved');
    }
}

export const writeToLocalStorage = debounce(() =>{
    const nodes = state.nodes$;
    const edges = state.edges$;
    const primaryKey = primaryKey$.value;
    const uniqueKeys = uniqueKeys$.value;
    const indexes = indexes$.value;
    storageWriter({nodes, edges, primaryKey, uniqueKeys, indexes});
   
}, 2000);


const storageState = getLocalStorageState();

if (storageState) {
    console.log("Loaded state")
    const { nodes, edges, primaryKey, uniqueKeys, indexes } = storageState;
    state.nodes$ = nodes;
    state.edges$ = edges;
    primaryKey$.value = primaryKey;
    uniqueKeys$.value = uniqueKeys;
    indexes$.value = indexes;
}
