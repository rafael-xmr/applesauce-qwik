import {
	createContextId,
	noSerialize,
	type Signal,
	useContext,
	useContextProvider,
	useSignal,
	useTask$,
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
export function useEventStoreProvider() {
	const eventStore = useSignal<IEventStore | undefined>();

	useTask$((_) => {
		eventStore.value = noSerialize(new EventStore());
	});

	useVisibleTask$(
		(_) => {
			eventStore.value = new EventStore();
		},
		{ strategy: "document-ready" },
	);

	useContextProvider(EventStoreContext, eventStore);
}
