import {
	createContextId,
	type Signal,
	useContext,
	useContextProvider,
	useVisibleTask$,
} from "@qwik.dev/core";
import { EventStore, type IEventStore } from "applesauce-core";

export const EventStoreContext = createContextId<Signal<IEventStore>>(
	"applesauce.event-store",
);

/** Returns the EventStore from the context. If required is true, it will throw an error if the EventStore is not
  found. */
export function useEventStore(): IEventStore | undefined {
	const eventStore = useContext(EventStoreContext);
	return eventStore.value;
}

/** Provides an EventStore to the app. */
export function useEventStoreProvider(
	eventStore: Signal<IEventStore | undefined>,
) {
	useVisibleTask$((_) => {
		eventStore.value = new EventStore();
		console.log("EventStore initialized", eventStore.value);
	});

	useContextProvider(EventStoreContext, eventStore);
}
