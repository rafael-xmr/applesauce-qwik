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
import { ActionHub } from "applesauce-actions";
import { EventFactoryContext } from "./event-factory";
import { EventStoreContext } from "./event-store";

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
  const eventFactory = useContext(EventFactoryContext);

  // Needs both eventStore and eventFactory to create ActionHub
  useTask$(({ track }) => {
    const newEventStore = track(eventStore);
    const newFactory = track(eventFactory);
    if (!newEventStore || !newFactory) return;

    actionHub.value = noSerialize(new ActionHub(newEventStore, newFactory));
  });

  // NOTE: on document-ready ensure deserialized eventStore and eventFactory are used
  // can't use useSerializer$ here because can't pass the both required and already
  // deserialized eventStore and eventFactory
  useVisibleTask$(
    ({ track }) => {
      const newEventStore = track(eventStore);
      const newFactory = track(eventFactory);
      if (!newEventStore || !newFactory) return;

      actionHub.value = new ActionHub(newEventStore, newFactory);
    },
    { strategy: "document-ready" },
  );

  useContextProvider(ActionsContext, actionHub);
}
