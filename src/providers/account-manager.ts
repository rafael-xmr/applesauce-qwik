import {
	createContextId,
	type Signal,
	useContextProvider,
	useSerializer$,
	useStore,
	useVisibleTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
	AccountManager,
	type IAccount,
	type SerializedAccount,
} from "applesauce-accounts";
import { registerCommonAccountTypes } from "applesauce-accounts/accounts";
import Cookies from "js-cookie";
import { merge, Subject } from "rxjs";

export const ACCOUNT_MANAGER_COOKIE_NAME = "applesauce-account";

export const useAccountsCookieLoader = routeLoader$(({ cookie }) => {
	return cookie.get(ACCOUNT_MANAGER_COOKIE_NAME)?.value;
});

export interface StoredAccountData {
	accounts: SerializedAccount<any, any>[];
	activeAccountId?: string;
}

export type AccountManagerContextType = {
	accountManager: AccountManager;
	activeAccount: IAccount | undefined;
};

export const AccountManagerContext = createContextId<
	Signal<AccountManagerContextType>
>("applesauce.account-manager");

/** Provides an AccountManager to the app. */
export function useAccountsProvider(cookie?: string | undefined) {
	const parsedCookie = cookie ? JSON.parse(cookie) : undefined;
	const serverData: StoredAccountData =
		"accounts" in (parsedCookie || {})
			? parsedCookie
			: { accounts: [], activeAccountId: undefined };

	const storedData = useStore(serverData);

	const accountManagerSerializerSignal = useSerializer$<
		AccountManagerContextType,
		StoredAccountData
	>(() => ({
		initial: storedData,
		serialize: (manager) => ({
			accounts: manager.accountManager.toJSON(),
			activeAccountId: manager.activeAccount?.id,
		}),
		deserialize: (deserializeData) => {
			const accountManager = new AccountManager();

			registerCommonAccountTypes(accountManager);

			if (deserializeData?.accounts) {
				accountManager.fromJSON(deserializeData.accounts);
			}

			if (deserializeData?.activeAccountId) {
				const account = accountManager.getAccount(
					deserializeData.activeAccountId,
				);
				if (account) {
					accountManager.setActive(account);
					storedData.activeAccountId = account.id;
				}
			} else {
				accountManager.clearActive();
			}

			return {
				accountManager,
				activeAccount: accountManager.active,
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

			return current;
		},
	}));

	useVisibleTask$(
		({ cleanup }) => {
			const accountManager =
				accountManagerSerializerSignal.value.accountManager;

			// This task runs on the client and saves data to the cookie when changes occur.
			const manualSave = new Subject<void>();
			const sub = merge(
				manualSave,
				accountManager.accounts$,
				accountManager.active$,
			).subscribe(() => {
				const dataToStore: StoredAccountData = {
					accounts: accountManager.toJSON(),
					activeAccountId: accountManager.active?.id,
				};
				Cookies.set(ACCOUNT_MANAGER_COOKIE_NAME, JSON.stringify(dataToStore));

				storedData.activeAccountId = accountManager.active?.id;
			});

			cleanup(() => sub.unsubscribe());
		},
		{ strategy: "document-ready" },
	);

	useContextProvider(AccountManagerContext, accountManagerSerializerSignal);
}
