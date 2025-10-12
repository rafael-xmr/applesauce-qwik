import {
  createContextId,
  type Signal,
  useContextProvider,
  useSerializer$,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import { RelayPool, type SerializedRelayPool } from "applesauce-relay";
import Cookies from "js-cookie";
import { merge, Subject } from "rxjs";
import { getReadAndWriteRelayLists, type StoredRelay } from "~/utils/relays";

export const RELAYS_COOKIE_NAME = "applesauce-relays";

export const useRelaysCookieLoader = routeLoader$(({ cookie }) => {
  return cookie.get(RELAYS_COOKIE_NAME)?.value;
});

export interface StoredRelayData {
  relays: StoredRelay[];
  readRelays: string[];
  writeRelays: string[];
  relayPool?: SerializedRelayPool;
}

export interface RelayPoolContextType {
  relays: StoredRelay[];
  readRelays: string[];
  writeRelays: string[];
  relayPool: RelayPool;
}

export const RelayPoolContext = createContextId<Signal<RelayPoolContextType>>(
  "applesauce.relay-pool",
);
export const StoredRelaysContext =
  createContextId<StoredRelayData>("stored-relays");

/** Provides an RelayPoolContext to the app. */
export function useRelayPoolProvider(cookie?: string | undefined) {
  const parsedCookie = cookie ? JSON.parse(cookie) : {};
  const serverData: StoredRelayData =
    "relays" in parsedCookie ? parsedCookie : { relays: [] };

  const storedData = useStore<StoredRelayData>(serverData);

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
        // NOTE: Always create only one EventStore instance for your entire application and share it across components.
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
        Cookies.set(RELAYS_COOKIE_NAME, JSON.stringify(current));
        const { readRelays, writeRelays } = getReadAndWriteRelayLists(
          current.relays,
        );
        return { ...current, readRelays, writeRelays };
      },
    }),
  );

  useVisibleTask$(
    ({ cleanup }) => {
      const relayPool = relayPoolSignal.value.relayPool;

      // This task runs on the client and saves data to the cookie when changes occur.
      const manualSave = new Subject<void>();
      const sub = merge(manualSave, relayPool.relays$).subscribe(() => {
        const newRelays = [];
        const readRelays = [];
        const writeRelays = [];

        for (const [name, _relay] of relayPool.relays) {
          const existing = storedData.relays.find((r) => r.name === name);
          if (existing) {
            newRelays.push({
              name,
              read: existing.read,
              write: existing.write,
            });

            if (existing.read) readRelays.push(existing.name);
            if (existing.write) writeRelays.push(existing.name);
          } else {
            newRelays.push({
              name,
              read: true,
              write: true,
            });
            readRelays.push(name);
            writeRelays.push(name);
          }
        }

        const dataToStore: StoredRelayData = {
          relays: newRelays,
          readRelays,
          writeRelays,
          relayPool: relayPool.toJSON(),
        };

        Cookies.set(RELAYS_COOKIE_NAME, JSON.stringify(dataToStore));

        storedData.relays = newRelays;
      });

      cleanup(() => sub.unsubscribe());
    },
    { strategy: "document-ready" },
  );

  useContextProvider(RelayPoolContext, relayPoolSignal);
}
