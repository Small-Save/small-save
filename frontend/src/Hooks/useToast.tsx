import { useState, useEffect, useCallback } from "react";

type ToastColor = "success" | "danger" | "warning" | "primary";
type ToastPosition = "top" | "bottom" | "middle";

export interface ToastOptions {
  message: string;
  header?: string;
  duration?: number;
  color?: ToastColor;
  position?: ToastPosition;
}

interface ToastState extends ToastOptions {
  id: string;
  isOpen: boolean;
}

interface State {
  toasts: ToastState[];
}

let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Listener = (state: State) => void;
const listeners: Listener[] = [];
let memoryState: State = { toasts: [] };

function dispatch(next: State): void {
  memoryState = next;
  listeners.forEach((l) => l(memoryState));
}

export function toast(opts: ToastOptions) {
  const id = genId();
  const entry: ToastState = {
    ...opts,
    id,
    isOpen: true,
    duration: opts.duration ?? 3000,
    color: opts.color ?? "primary",
    position: opts.position ?? "bottom",
  };

  dispatch({
    toasts: [...memoryState.toasts, entry],
  });

  return { id, dismiss: () => dismissToast(id) };
}

export function dismissToast(id: string): void {
  dispatch({
    toasts: memoryState.toasts.map((t) =>
      t.id === id ? { ...t, isOpen: false } : t
    ),
  });

  setTimeout(() => {
    dispatch({
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    });
  }, 300);
}

export function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const show = useCallback((opts: ToastOptions) => toast(opts), []);
  const dismiss = useCallback((id: string) => dismissToast(id), []);

  return { toasts: state.toasts, toast: show, dismiss };
}

export type { ToastState };
