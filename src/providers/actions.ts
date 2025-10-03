import {
	createContextId,
	noSerialize,
	type Signal,
	useContext,
	useContextProvider,
	useSignal,
	useTask$,
} from "@qwik.dev/core";
import { ActionHub } from "applesauce-actions";
import { EventStoreContext } from "./event-store";
import { FactoryContext } from "./factory";

export const ActionsContext =
	createContextId<Signal<ActionHub>>("applesauce.actions");

/** Returns the ActionHub from the context. */
export function useActionHub(): ActionHub | undefined {
	const actionHub = useContext(ActionsContext);
	return actionHub.value;
}

/** Provides an ActionsContext to the app. */
export function useActionHubProvider() {
	const actionHub = useSignal<ActionHub | undefined>();
	const eventStore = useContext(EventStoreContext);
	const factory = useContext(FactoryContext);

	useTask$(({ track }) => {
		const newEventStore = track(eventStore);
		const newFactory = track(factory);
		if (!newEventStore || !newFactory) return;

		actionHub.value = noSerialize(
			new ActionHub(eventStore.value, factory.value),
		);
	});

	useContextProvider(ActionsContext, actionHub);
}
