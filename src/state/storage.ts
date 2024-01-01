import { Edge, Node } from "reactflow";
import { indexes$, localStorageCopy$, primaryKey$, state, uniqueKeys$ } from "./globalState";
import { debounce } from "../components/utils";
import { v4 } from "uuid";
import { Signal } from "@preact/signals-react";
import { generateFilename } from "../utils/string";

export interface Storage {
    getFiles<T>(defaultValue?: T): Promise<T | null>;
    setFiles(value: any): Promise<void>;
    removeFiles(): Promise<void>;
}

export default class LocalStorage implements Storage {
    constructor(private key="") {}

    async getFiles<T>(): Promise<T | null>;
    async getFiles<T>(defaultValue: T): Promise<T>;
    async getFiles<T>(defaultValue?: T): Promise<T | null> {
        const value = window.localStorage.getItem(this.key);
        if (value === null) {
            return defaultValue ?? null;
        }

        try {
            return JSON.parse(value) as T;
        } catch (e) {
            console.error("Unexpected value in " + this.key, value);
            return defaultValue ?? null;
        }
    }

    async setFiles(value: any): Promise<void> {
        value = JSON.stringify(value);
        window.localStorage.setItem(this.key, value);
    }

    async removeFiles(): Promise<void> {
        window.localStorage.removeItem(this.key);
    }
}

export const storage = new LocalStorage("db-diagram");

interface DiagramData {
    nodes: Node[];
    edges: Edge[];
    primaryKey: Record<string, { cols: string[] }>;
    uniqueKeys: Record<string, { cols: string[] }[]>;
    indexes: Record<string, { cols: string[]; unique: boolean }[]>;
}

export interface AllDiagrams {
    files: Record<string, {name: string, lastEdited: string, data: DiagramData}>
    active: string | null;
}

export const setActiveDiagram = async (fileId: string) => {
    localStorageCopy$.value = {...localStorageCopy$.value, active: fileId};
    const savedData = await storage.getFiles<AllDiagrams>();

    if (savedData) {
        savedData.active = fileId;
        storage.setFiles(savedData);
        localStorageCopy$.value = savedData;

        state.nodes$ = [];
        state.edges$ = [];
        primaryKey$.value = {};
        uniqueKeys$.value =  {};
        indexes$.value = {};

        state.nodes$ = savedData.files[fileId].data.nodes;
        state.edges$ = savedData.files[fileId].data.edges;
        primaryKey$.value = savedData.files[fileId].data.primaryKey;
        uniqueKeys$.value =  savedData.files[fileId].data.uniqueKeys;
        indexes$.value = savedData.files[fileId].data.indexes;
    }
}

export const renameDiagram = async (newName: string) => {
    const savedData = await storage.getFiles<AllDiagrams>();
    if (savedData) {
        if(savedData.active) {
            savedData.files[savedData.active].name = newName;
            localStorageCopy$.value = savedData;
            storage.setFiles(savedData);
        }
    }
};

export const deleteDiagram = async (fileId: string) => {
  const savedData = await storage.getFiles<AllDiagrams>();
  if (savedData && Object.values(localStorageCopy$.value.files).length > 0) {
    delete savedData.files[fileId];
    if (Object.values(savedData.files).length === 0) {
      await storage.removeFiles();
      window.location.reload();
      return;
    }
    // find the last edited diagram 
    const lastEdited = Object.values(localStorageCopy$.value.files).sort((a, b) => 
      new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
    )[0];
    if (lastEdited) {
      const id = Object.keys(savedData.files).find(key => 
        savedData.files[key] === lastEdited
        ) || null;
        
        savedData.active = id;
        await storage.setFiles(savedData);
        window.location.reload();

    }
  } else {
  }
}

export const storageWriter = async (fileId: string, diagramData: DiagramData) => {
  const currentStorage = await storage.getFiles<AllDiagrams>();

  const storageData = currentStorage ? currentStorage : {
    files: {},
    active: fileId,
  };

  // update or create new diagram
  storageData.files[fileId] = {
    name: storageData.files[fileId]?.name || generateFilename(),
    lastEdited: new Date().toISOString(),
    data: diagramData,
  };

  // set this diagram as the active one
  storageData.active = fileId;

  // save updated data back to local storage
  await storage.setFiles(storageData);
  localStorageCopy$.value = storageData;
  console.log('Saved');
  return localStorageCopy$;
};

export const writeToLocalStorage = debounce((fileId: string) =>{
    const nodes = state.nodes$;
    const edges = state.edges$;
    const primaryKey = primaryKey$.value;
    const uniqueKeys = uniqueKeys$.value;
    const indexes = indexes$.value;
    if (fileId !== null) {
      storageWriter(fileId, {nodes, edges, primaryKey, uniqueKeys, indexes});
    }
   
}, 2000);


export const getLocalStorageState = async (): Promise<Signal<AllDiagrams>> => {
  const data = await storage.getFiles<AllDiagrams>();
  try {
    if (data && data.hasOwnProperty("active") && data.hasOwnProperty("files")) {
      localStorageCopy$.value = data;

      if (data.active && data.files[data.active]) {
        return localStorageCopy$;
      }

      // find the last edited diagram if active record doesn't exist and set active to it's id
      const lastEdited = Object.values(localStorageCopy$.value.files).sort((a, b) => 
        new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
      )[0];

      if (lastEdited) {
        localStorageCopy$.value.active = Object.keys(localStorageCopy$.value.files).find(key => 
          localStorageCopy$.value.files[key] === lastEdited
        ) || null;
        return localStorageCopy$;
      }
    } else {
      if (data && (!data.hasOwnProperty("active") || !data.hasOwnProperty("files"))) {
        await storage.removeFiles()
      }
        const nodes = state.nodes$;
        const edges = state.edges$;
        const primaryKey = primaryKey$.value;
        const uniqueKeys = uniqueKeys$.value;
        const indexes = indexes$.value;
        return storageWriter(v4(), {nodes, edges, primaryKey, uniqueKeys, indexes});
    }
  } catch (error) {
    console.error('Failed to load from local storage:', error);
  }
  return localStorageCopy$;
};
