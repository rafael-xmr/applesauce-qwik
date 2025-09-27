import {
	createContextId,
	type Signal,
	useContext,
	useContextProvider,
	useVisibleTask$,
} from "@qwik.dev/core";
import { ActionHub } from "applesauce-actions";
import type { IEventStore } from "applesauce-core";
import type { EventFactory } from "applesauce-factory";

export const ActionsContext =
	createContextId<Signal<ActionHub>>("applesauce.actions");

/** Returns the ActionHub from the context. */
export function useActionHub(): ActionHub | undefined {
	const actionHub = useContext(ActionsContext);
	return actionHub.value;
}

/** Provides an ActionsContext to the app. */
export function useActionHubProvider(
	eventStore: Signal<IEventStore | undefined>,
	factory: Signal<EventFactory | undefined>,
	actionHub: Signal<ActionHub | undefined>,
) {
	useVisibleTask$(
		(_) => {
			if (eventStore.value && factory.value) {
				actionHub.value = new ActionHub(eventStore.value, factory.value);
				console.log("ActionHub initialized", actionHub.value);
			}
		},
		{ strategy: "document-ready" },
	);

	useContextProvider(ActionsContext, actionHub);
}
