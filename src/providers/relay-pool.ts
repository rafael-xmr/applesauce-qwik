import {
  createContextId,
  type Signal,
  useContextProvider,
  useSerializer$,
  useStore,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import { RelayPool, type SerializedRelayPool } from "applesauce-relay/pool";
import { Relay } from "applesauce-relay/relay";
import Cookies from "js-cookie";
import { getReadAndWriteRelayLists, type StoredRelays } from "~/utils/relays";

export const RELAYS_COOKIE_NAME = "applesauce-relays";

export const useRelaysCookieLoader = routeLoader$(({ cookie }) => {
  return cookie.get(RELAYS_COOKIE_NAME)?.value;
});

export interface StoredRelayData {
  relays: StoredRelays;
  readRelays: string[];
  writeRelays: string[];
  relayPool?: SerializedRelayPool;
}

export interface RelayPoolContextType {
  relays: StoredRelays;
  readRelays: string[];
  writeRelays: string[];
  relayPool: RelayPool;
}

export const RelayPoolContext = createContextId<Signal<RelayPoolContextType>>(
  "applesauce.relay-pool",
);

export const EventLoadersContext = createContextId<{ [key: string]: any }>(
  "applesauce.event-loaders",
);

export const RelaysStoreContext =
  createContextId<StoredRelayData>("relays-store");

/** Provides an RelayPoolContext to the app. */
export function useRelayPoolProvider(cookie?: string | undefined) {
  const parsedCookie = cookie ? JSON.parse(cookie) : {};
  const serverData: StoredRelayData =
    "relays" in parsedCookie ? parsedCookie : { relays: {} };

  const storedData = useStore<StoredRelayData>(serverData);

  const eventLoadersStore = useStore<{ [key: string]: any }>({});

  const relayPoolSignal = useSerializer$<RelayPoolContextType, StoredRelayData>(
    () => ({
      initial: storedData,
      serialize: (relayPoolCtx) => {
        const { readRelays, writeRelays } = getReadAndWriteRelayLists(
          relayPoolCtx.relays,
        );
        return {
          relayPool: relayPoolCtx.relayPool.toJSON(),
          relays: relayPoolCtx.relays,
          readRelays: readRelays,
          writeRelays: writeRelays,
        };
      },
      deserialize: (deserializeData) => {
        // NOTE: Always create only one RelayPool instance for your entire application and share it across components.
        const relayPool = !deserializeData.relayPool
          ? new RelayPool()
          : RelayPool.fromJSON(deserializeData.relayPool);

        const { readRelays, writeRelays } = getReadAndWriteRelayLists(
          deserializeData.relays,
        );
        return {
          relays: deserializeData.relays,
          readRelays,
          writeRelays,
          relayPool,
        };
      },
      update: (current) => {
        current.relays = storedData.relays;
        for (const url of Object.keys(current.relays)) {
          current.relayPool.relays.set(url, new Relay(url));
        }
        const { readRelays, writeRelays } = getReadAndWriteRelayLists(
          current.relays,
        );
        current = { ...current, readRelays, writeRelays };

        // TODO: impl server flow
        Cookies.set(RELAYS_COOKIE_NAME, JSON.stringify(current));

        return current;
      },
    }),
  );

  useContextProvider(RelayPoolContext, relayPoolSignal);
  useContextProvider(RelaysStoreContext, storedData);
  useContextProvider(EventLoadersContext, eventLoadersStore);
}
