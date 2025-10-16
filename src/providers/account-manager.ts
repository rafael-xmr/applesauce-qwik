import {
  createContextId,
  isServer,
  type QRL,
  type Signal,
  useContextProvider,
  useSerializer$,
  useStore,
  useTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
  AmberClipboardAccount,
  ExtensionAccount,
  NostrConnectAccount,
  ReadonlyAccount,
  SerialPortAccount,
} from "applesauce-accounts/accounts";
import { AccountManager } from "applesauce-accounts/manager";
import type { IAccount, SerializedAccount } from "applesauce-accounts/types";
import type { ProfileEvent } from "applesauce-core/helpers/profile";
import { ExtensionSigner } from "applesauce-signers";
import Cookies from "js-cookie";

export const ACCOUNT_MANAGER_COOKIE_NAME = "applesauce-account";
export const ACCOUNT_PUBKEY_COOKIE_NAME = "applesauce-pubkey";

export const useAccountManagerCookieLoader = routeLoader$(({ cookie }) => {
  return cookie.get(ACCOUNT_MANAGER_COOKIE_NAME)?.value;
});

export const useAccountPubkeyCookieLoader = routeLoader$(({ cookie }) => {
  return cookie.get(ACCOUNT_PUBKEY_COOKIE_NAME)?.value;
});

export enum AccountType {
  Extension = "extension",
  NostrConnect = "nostrConnect",
  SerialPort = "serialPort",
  Readonly = "readonly",
  AmberClipboard = "amberClipboard",
}

export interface StoredAccountData {
  accounts: SerializedAccount<any, any>[];
  activeAccountId?: string;
  resolvedProfile?: ProfileEvent;
  accountType?: AccountType;
}

export type AccountManagerContextType = {
  accountManager: AccountManager;
  activeAccount: IAccount | undefined;
  resolvedProfile: ProfileEvent | undefined;
  accountType?: AccountType;
};

export const AccountManagerContext = createContextId<
  Signal<AccountManagerContextType>
>("applesauce.account-manager");

export const AccountManagerStoreContext = createContextId<StoredAccountData>(
  "applesauce.account-manager-store",
);

/** Provides an AccountManager to the app. */
export function useAccountsProvider(
  serverData: StoredAccountData = {
    accounts: [],
    activeAccountId: undefined,
    resolvedProfile: undefined,
    accountType: undefined,
  },
  serverStorePathBuilder?: QRL<(pubkey: string) => string>,
) {
  const storedData = useStore(serverData);

  const accountManagerSerializerSignal = useSerializer$<
    AccountManagerContextType,
    StoredAccountData
  >(() => ({
    initial: storedData,
    serialize: (managerCtx) => {
      return {
        ...managerCtx,
        accounts: managerCtx.accountManager.toJSON(),
      };
    },
    deserialize: (deserializeData) => {
      // NOTE: Always create only one AccountManager instance for your entire application and share it across components.
      // This will be created once on the server and once on the client.
      const accountManager = new AccountManager();

      accountManager.registerType(ExtensionAccount);
      accountManager.registerType(NostrConnectAccount);
      accountManager.registerType(SerialPortAccount);
      accountManager.registerType(ReadonlyAccount);
      accountManager.registerType(AmberClipboardAccount);

      if (deserializeData.accounts) {
        accountManager.fromJSON(deserializeData.accounts);
      }

      if (deserializeData.activeAccountId) {
        const activeAccount = accountManager.getAccount(
          deserializeData.activeAccountId,
        );
        if (activeAccount) {
          accountManager.setActive(activeAccount);
          storedData.activeAccountId = activeAccount.id;
        }
      }

      if (deserializeData.resolvedProfile) {
        const pubkey = deserializeData.resolvedProfile.pubkey;

        const account = accountManager.accounts.find(
          (a) => a.pubkey === pubkey,
        );

        if (!account) {
          let newAccount: IAccount;

          switch (deserializeData.accountType) {
            // case AccountType.Extension:
            default:
              newAccount = new ExtensionAccount(pubkey, new ExtensionSigner());
              break;
            // TODO: implement
            // case AccountType.NostrConnect:
            //   newAccount = new NostrConnectAccount(pubkey, new NostrConnectSigner({}));
            //   break;
            // case AccountType.SerialPort:
            //   newAccount = new SerialPortAccount(pubkey);
            //   break;
            // case AccountType.AmberClipboard:
            //   newAccount = new AmberClipboardAccount(pubkey);
            //   break;
            // case AccountType.Readonly:
            // default:
            //   newAccount = new ReadonlyAccount(pubkey);
            //   break;
          }

          accountManager.addAccount(newAccount);
          accountManager.setActive(newAccount);

          return {
            accountManager,
            activeAccount: newAccount,
            resolvedProfile: deserializeData.resolvedProfile,
            accountType: deserializeData.accountType,
          };
        }
      }

      return {
        accountManager,
        activeAccount: accountManager.active,
        resolvedProfile: deserializeData.resolvedProfile,
        accountType: deserializeData.accountType,
      };
    },
    update: (current) => {
      if (storedData.activeAccountId) {
        const account = current.accountManager.getAccount(
          storedData.activeAccountId,
        );

        if (account) {
          current.accountManager.setActive(account);
          current.activeAccount = account;
        }
      } else {
        current.accountManager.clearActive();
        current.activeAccount = undefined;
      }

      if (storedData.resolvedProfile) {
        current.resolvedProfile = storedData.resolvedProfile;
      }
      if (storedData.accountType) {
        current.accountType = storedData.accountType;
      }

      Cookies.set(ACCOUNT_MANAGER_COOKIE_NAME, JSON.stringify(current));
      Cookies.set(
        ACCOUNT_PUBKEY_COOKIE_NAME,
        current.accountManager.active?.pubkey || "",
      );

      return current;
    },
  }));

  useTask$(async ({ track }) => {
    // NOTE: This task runs on the client and syncs resolvedProfile to/from the server when changes occur.
    if (isServer) return;

    const newAccountManagerSerializerSignal = track(
      accountManagerSerializerSignal,
    );
    const newStoredData = track(storedData);
    const serverStorePathBuilderFn = await serverStorePathBuilder?.resolve();

    const newResolvedProfile = newStoredData.resolvedProfile;

    if (newResolvedProfile?.pubkey && serverStorePathBuilderFn) {
      await fetch(serverStorePathBuilderFn(newResolvedProfile.pubkey), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolvedProfile: newResolvedProfile,
          accountType: newStoredData.accountType,
        }),
      });
    }

    const newActiveAccount = newAccountManagerSerializerSignal.activeAccount;

    if (newActiveAccount?.pubkey && serverStorePathBuilderFn) {
      const response = await fetch(
        serverStorePathBuilderFn(newActiveAccount.pubkey),
      );
      const data = await response.json();

      if (data?.resolvedProfile) {
        accountManagerSerializerSignal.value.resolvedProfile =
          data.resolvedProfile;
        accountManagerSerializerSignal.value.accountType = data.accountType;
      }
    }
  });

  useContextProvider(AccountManagerContext, accountManagerSerializerSignal);
  useContextProvider(AccountManagerStoreContext, storedData);
}
