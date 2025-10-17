import {
  type ComputedSignal,
  isServer,
  type NoSerialize,
  noSerialize,
  type QRL,
  useComputed$,
  useContext,
  useResource$,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import type { ModelConstructor } from "applesauce-core/event-store";
import { withImmediateValueOrDefault } from "applesauce-core/observable";
import {
  catchError,
  lastValueFrom,
  map,
  type Observable,
  of,
  timeout,
} from "rxjs";
import { EventLoadersContext } from "~/providers/relay-pool.js";
import { EventStoreContext } from "../providers/event-store.js";

/** Runs and subscribes to a model on the event store */
export function useEventModel<T, Args extends Array<any>>(
  factory: ComputedSignal<NoSerialize<QRL<ModelConstructor<T, Args>>>>,
  coord: ComputedSignal<string | undefined>,
  args: Args,
  defaultValue?: T,
) {
  const eventStore = useContext(EventStoreContext);
  const eventLoadersCtx = useContext(EventLoadersContext);

  const isLoadingEvent = useComputed$(
    () => coord.value && !!eventLoadersCtx[coord.value],
  );

  const observableSubject =
    useSignal<NoSerialize<Observable<T | undefined> | undefined>>();

  useTask$(async ({ track }) => {
    const newFactory = track(factory);

    if (newFactory) {
      const factoryValue = await newFactory.resolve();

      observableSubject.value = noSerialize(
        eventStore.value
          .model(factoryValue, ...args)
          .pipe(withImmediateValueOrDefault(undefined)),
      );
    }
  });

  const clientResult = useSignal<T | undefined>(undefined);
  const shouldUseClientResult = useSignal();

  useTask$(({ track, cleanup }) => {
    const newObservableSubject = track(observableSubject);

    if (isServer) return;

    if (newObservableSubject) {
      shouldUseClientResult.value = true;

      if (!coord.value || isLoadingEvent.value) return;

      eventLoadersCtx[coord.value] = true;

      const sub = newObservableSubject.subscribe({
        next: (p) => {
          clientResult.value = p;
        },
        error: () => {
          clientResult.value = undefined;
        },
      });

      cleanup(() => {
        sub.unsubscribe();

        if (coord.value && eventLoadersCtx[coord.value]) {
          delete eventLoadersCtx[coord.value];
        }
      });
    }
  });

  return useResource$(async ({ track }) => {
    const newClientResult = track(clientResult);

    if (coord.value && eventLoadersCtx[coord.value]) {
      delete eventLoadersCtx[coord.value];
    }

    if (newClientResult) return newClientResult;
    if (!observableSubject.value) return undefined;
    if (defaultValue) return defaultValue;

    let eventValue: T | undefined;

    await lastValueFrom(
      observableSubject.value.pipe(
        timeout(3000),
        catchError((_err) => of(undefined)),
        map((item) => {
          if (item) eventValue = item;
        }),
      ),
      { defaultValue: defaultValue },
    );
    return eventValue;
  });
}
