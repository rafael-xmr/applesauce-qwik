import {
  type ComputedSignal,
  type NoSerialize,
  noSerialize,
  type QRL,
  useContext,
  useResource$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@qwik.dev/core";
import {
  type ModelConstructor,
  withImmediateValueOrDefault,
} from "applesauce-core";
import {
  catchError,
  lastValueFrom,
  map,
  type Observable,
  of,
  timeout,
} from "rxjs";
import { EventStoreContext } from "../providers/event-store.js";

/** Runs and subscribes to a model on the event store */
export function useEventModel<T, Args extends Array<any>>(
  factory: ComputedSignal<NoSerialize<QRL<ModelConstructor<T, Args>>>>,
  args: Args,
  defaultValue?: T,
) {
  const eventStore = useContext(EventStoreContext);

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
  const shouldGetClientResult = useSignal();
  const shouldUseClientResult = useSignal();

  useVisibleTask$(
    ({ track, cleanup }) => {
      const newObservableSubject = track(observableSubject);

      if (newObservableSubject && shouldGetClientResult.value) {
        shouldUseClientResult.value = true;

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
        });
      }

      shouldGetClientResult.value = true;
    },
    { strategy: "document-ready" },
  );

  return useResource$(async ({ track }) => {
    const newClientResult = track(clientResult);

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
