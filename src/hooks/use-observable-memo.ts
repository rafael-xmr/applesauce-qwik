import { useComputed$ } from "@builder.io/qwik";
import { type NoSerialize, noSerialize, type Signal } from "@qwik.dev/core";
import { type BehaviorSubject, type Observable, of } from "rxjs";
import { useObservableEagerState } from "./use-observable-eager-state";
import { useObservableState } from "./use-observable-state";

/** A hook that recreates an observable when the dependencies change */
export function useObservableMemo<T>(
  factory: NoSerialize<() => BehaviorSubject<T>>,
  deps: any[],
): Signal<T>;
export function useObservableMemo<T>(
  factory: NoSerialize<() => Observable<T> | undefined>,
  deps: any[],
): Signal<T | undefined>;
export function useObservableMemo<T>(
  factory: NoSerialize<() => Observable<T> | undefined>,
  deps: any[],
): Signal<T | undefined> {
  return useObservableState(
    noSerialize(
      useComputed$(() => (factory ? factory() : of(undefined))).value,
    ),
  );
}
