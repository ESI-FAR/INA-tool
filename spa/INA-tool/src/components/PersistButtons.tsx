import { useEffect, useId, useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { store } from "@/lib/store";
import { buildProjectJson } from "@/lib/io";
import { Route } from "@/routes/__root";

const persistKey = 'ina-tool-persist';

function usePersist() {
    // Get initial value from localStorage or default to false
    const [persist, setPersist] = useState(() => {
        const storedPersist = localStorage.getItem(persistKey);
        return storedPersist ? JSON.parse(storedPersist) : false;
    });
    
    // Store persist value in local storage whenever it changes
    useEffect(() => {
        localStorage.setItem(persistKey, JSON.stringify(persist));
    }, [persist]);
    return [persist, setPersist] as const;
}

function persistState(key: string) {
    // persist state to local storage
    const value = buildProjectJson();
    localStorage.setItem(key, value);
}

function clear(key: string) {
    // Clear local storage
    localStorage.removeItem(key);
    // Clear store state
    store.getState().setNodes([]);
    store.getState().setEdges([]);
    // TODO fire toast
}

function remember(key: string) {
    const value = localStorage.getItem(key);
        if (value) {
            // load state from local storage
            const { nodes, edges } = JSON.parse(value);
            store.getState().setNodes(nodes);
            store.getState().setEdges(edges);
        }
}

export function PersistButtons() {
    const id = useId();
    const { project } = Route.useSearch()
    const key = `${persistKey}-${project}`;
    const [persist, setPersist] = usePersist();

    useEffect(() => {
        // TODO prevent loop
        // remember(key, projectFromSearchParams);
        return () => {
            if (!persist) {
                // nothing to do
                return;
            }
            persistState(key);
        }
    });

    return (
        <>
        <div className="flex items-center space-x-2">
        <Switch id={id} checked={persist} onCheckedChange={setPersist}/>
        <Label htmlFor={id}>Persist on leave</Label>
        </div>
        <Button variant="outline" title="" onClick={() => persistState(key)}>Persist</Button>
        <Button variant="outline" title="" onClick={() => remember(key)}>Remember</Button>
        <Button variant="outline" title="Delete all statements and connections" onClick={() => clear(key)}>Clear</Button>
        </>
    )
}