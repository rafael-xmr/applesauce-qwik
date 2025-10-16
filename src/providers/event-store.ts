import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
  useSerializer$,
} from "@qwik.dev/core";
import {
  EventStore,
  type IEventStore,
  type SerializedEventStore,
} from "applesauce-core/event-store";

export const EventStoreContext = createContextId<Signal<IEventStore>>(
  "applesauce.event-store",
);

/** Returns the EventStore from the context. If required is true, it will throw an error if the EventStore is not
  found. */
export function useEventStore(): IEventStore {
  const eventStore = useContext(EventStoreContext);
  return eventStore.value;
}

/** Provides an EventStore to the app. */
export function useEventStoreProvider() {
  // NOTE: Always create only one EventStore instance for your entire application and share it across components.
  const eventStore = useSerializer$<IEventStore, SerializedEventStore>({
    serialize: (eventStore) => eventStore.toJSON(),
    deserialize: (deserializeData) => new EventStore(deserializeData),
  });

  useContextProvider(EventStoreContext, eventStore);
}
