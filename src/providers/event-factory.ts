import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
  useSerializer$,
} from "@qwik.dev/core";
import { EventFactory } from "applesauce-factory/event-factory";

export const EventFactoryContext = createContextId<
  Signal<EventFactory | undefined>
>("applesauce.event-factory");

/** Returns the EventFactory from the context. */
export function useEventFactory(): EventFactory | undefined {
  const factory = useContext(EventFactoryContext);
  return factory.value;
}

/** Provides an EventFactory to the app. */
export function useEventFactoryProvider() {
  const eventFactory = useSerializer$<EventFactory, object>({
    // NOTE: for this object type, it's safe to simply re-create it every time as it is
    // just a combination of utility functions and there is nothing to be stored/serialized
    serialize: () => ({}) as object,
    deserialize: () => new EventFactory(),
  });

  useContextProvider(EventFactoryContext, eventFactory);
}
