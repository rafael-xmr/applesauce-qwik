import {
	createContextId,
	type Signal,
	useContext,
	useContextProvider,
	useVisibleTask$,
} from "@qwik.dev/core";
import { EventFactory } from "applesauce-factory";

export const FactoryContext =
	createContextId<Signal<EventFactory>>("applesauce.factory");

/** Returns the EventFactory from the context. */
export function useFactory(): EventFactory | undefined {
	const factory = useContext(FactoryContext);
	return factory.value;
}

/** Provides an EventFactory to the app. */
export function useFactoryProvider(factory: Signal<EventFactory | undefined>) {
	useVisibleTask$((_) => {
		factory.value = new EventFactory();
		console.log("Factory initialized", factory.value);
	});

	useContextProvider(FactoryContext, factory);
}
