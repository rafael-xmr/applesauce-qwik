import {
	createContextId,
	type Signal,
	useContext,
	useContextProvider,
	useVisibleTask$,
} from "@qwik.dev/core";
import { AccountManager } from "applesauce-accounts";

export const AccountsContext = createContextId<Signal<AccountManager>>(
	"applesauce.accounts",
);

/** Returns the AccountManager from the context. */
export function useAccountManager(): AccountManager | undefined {
	const accounts = useContext(AccountsContext);
	return accounts.value;
}

/** Provides an AccountManager to the app. */
export function useAccountsProvider(
	accounts: Signal<AccountManager | undefined>,
) {
	useVisibleTask$(
		(_) => {
			accounts.value = new AccountManager();
			console.log("Accounts initialized", accounts.value);
		},
		{ strategy: "document-ready" },
	);

	useContextProvider(AccountsContext, accounts);
}
