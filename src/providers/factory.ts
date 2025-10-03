import {
	createContextId,
	noSerialize,
	type Signal,
	useContext,
	useContextProvider,
	useSignal,
	useTask$,
} from "@qwik.dev/core";
import { EventFactory } from "applesauce-factory";
import { EventStoreContext } from "./event-store";

export const FactoryContext =
	createContextId<Signal<EventFactory>>("applesauce.factory");

/** Returns the EventFactory from the context. */
export function useFactory(): EventFactory | undefined {
	const factory = useContext(FactoryContext);
	return factory.value;
}

/** Provides an EventFactory to the app. */
export function useFactoryProvider() {
	const factory = useSignal<EventFactory | undefined>();
	const eventStore = useContext(EventStoreContext);

	useTask$(({ track }) => {
		const newEventStore = track(eventStore);
		if (!newEventStore) return;

		factory.value = noSerialize(new EventFactory());
	});

	useContextProvider(FactoryContext, factory);
}
