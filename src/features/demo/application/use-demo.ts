"use client";
import { useEffect, useReducer, useState } from "react";
import { demoReducer, initialState } from "./demo-state";
import { decodeDemo, STORAGE_KEY } from "../infrastructure/storage";
export function useDemo() {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  // Hydrate only after mount: identical initial server/client markup, no legacy prototype data import.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      dispatch({
        type: "hydrate",
        state: decodeDemo(localStorage.getItem(STORAGE_KEY)),
      });
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageError(true);
    }
  }, [state, ready]);
  /* eslint-enable react-hooks/set-state-in-effect */
  return { state, dispatch, ready, storageError };
}
