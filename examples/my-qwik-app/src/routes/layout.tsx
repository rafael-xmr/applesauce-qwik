import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
  type StoredAccountData,
  type StoredContactsData,
  useAccountsCookieLoader,
  useRelaysCookieLoader,
} from "applesauce-qwik";
import { getValue } from "~/db";
import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useAccountsCookieLdr = useAccountsCookieLoader;
export const useRelaysCookieLdr = useRelaysCookieLoader;

export const useContactsLdr = routeLoader$(async (requestEvent) => {
  const accountCookie = await requestEvent.resolveValue(useAccountsCookieLdr);

  if (!accountCookie) {
    return undefined;
  }

  try {
    const parsedCookie = accountCookie ? JSON.parse(accountCookie) : {};
    const serverData: StoredAccountData =
      "accounts" in parsedCookie
        ? parsedCookie
        : { accounts: [], activeAccountId: undefined };

    const activeAccountId = serverData.activeAccountId;
    const activeAccount = serverData.accounts.find(
      (acc) => acc.id === activeAccountId,
    );
    const pubkey = activeAccount?.pubkey;
    if (!pubkey) {
      return undefined;
    }

    const contacts = getValue(pubkey);

    return contacts as StoredContactsData | undefined;
  } catch (e) {
    console.error(e);
    return undefined;
  }
});

export default component$(() => {
  useStyles$(styles);
  return (
    <main>
      <Slot />
    </main>
  );
});
