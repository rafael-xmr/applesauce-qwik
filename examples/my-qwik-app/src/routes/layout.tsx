import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
  type StoredAccountData,
  type StoredContactsData,
  useAccountManagerCookieLoader,
  useAccountPubkeyCookieLoader,
  useRelaysCookieLoader,
} from "applesauce-qwik";
import { getValue } from "~/db";
import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useAccountsCookieLdr = useAccountManagerCookieLoader;
export const useAccountPubkeyLdr = useAccountPubkeyCookieLoader;
export const useRelaysCookieLdr = useRelaysCookieLoader;

export const useAccountsLdr = routeLoader$(async (requestEvent) => {
  const pubkeyCookie = await requestEvent.resolveValue(useAccountPubkeyLdr);

  let pubkey = pubkeyCookie;

  try {
    const accountManagerCookie =
      await requestEvent.resolveValue(useAccountsCookieLdr);

    if (accountManagerCookie) {
      const parsedAccountCookie = accountManagerCookie
        ? JSON.parse(accountManagerCookie)
        : {};
      const accountServerData: StoredAccountData =
        "accounts" in parsedAccountCookie
          ? parsedAccountCookie
          : { accounts: [], activeAccountId: undefined };

      const activeAccountId = accountServerData.activeAccountId;
      const activeAccount = accountServerData.accounts.find(
        (acc) => acc.id === activeAccountId,
      );

      if (activeAccount?.pubkey && !pubkey) {
        pubkey = activeAccount.pubkey;
      }

      if (!pubkey) {
        return undefined;
      }

      const profileObj = getValue(`${pubkey}-profiles`);

      return {
        activeAccountId,
        accounts: accountServerData.accounts,
        resolvedProfile: profileObj.resolvedProfile,
        accountType: profileObj.accountType,
      } as StoredAccountData;
    } else {
      if (!pubkey) {
        return undefined;
      }

      const profileObj = getValue(`${pubkey}-profiles`);

      return {
        activeAccountId: undefined,
        accounts: [],
        resolvedProfile: profileObj.resolvedProfile,
        accountType: profileObj.accountType,
      } as StoredAccountData;
    }
  } catch (e) {
    return undefined;
  }
});

export const useContactsLdr = routeLoader$(async (requestEvent) => {
  const pubkeyCookie = await requestEvent.resolveValue(useAccountPubkeyLdr);

  let pubkey = pubkeyCookie;

  try {
    const accountManagerCookie =
      await requestEvent.resolveValue(useAccountsCookieLdr);

    if (accountManagerCookie) {
      const parsedAccountCookie = accountManagerCookie
        ? JSON.parse(accountManagerCookie)
        : {};
      const accountServerData: StoredAccountData =
        "accounts" in parsedAccountCookie
          ? parsedAccountCookie
          : { accounts: [], activeAccountId: undefined };

      const activeAccountId = accountServerData.activeAccountId;
      const activeAccount = accountServerData.accounts.find(
        (acc) => acc.id === activeAccountId,
      );

      if (activeAccount?.pubkey && !pubkey) {
        pubkey = activeAccount.pubkey;
      }
    }

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
