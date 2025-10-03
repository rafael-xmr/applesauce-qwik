import {
	createContextId,
	noSerialize,
	type Signal,
	useContext,
	useContextProvider,
	useSignal,
	useStore,
	useTask$,
	useVisibleTask$,
} from "@qwik.dev/core";
import { AccountManager } from "applesauce-accounts";
import { registerCommonAccountTypes } from "applesauce-accounts/accounts";
import { merge, Subject } from "rxjs";

// Helper function to get a cookie on the client
function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	if (match) return decodeURIComponent(match[2]);
}

// Helper function to set a cookie on the client
function setCookie(name: string, value: string, days: number) {
	if (typeof document === "undefined") return;
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	const expires = `expires=${d.toUTCString()}`;
	document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

interface ProfileData {
	name?: string;
	email?: string;
}

export interface StoredData {
	accounts: any;
	activeAccount?: string;
	profileData?: ProfileData;
}

export const AccountsContext = createContextId<Signal<AccountManager>>(
	"applesauce.account-manager",
);
export const ProfileDataContext = createContextId<ProfileData>(
	"applesauce.profile-data",
);

/**
 * Server-side loader for account data.
 * In your SSR entry (e.g., entry.ssr.tsx or a server middleware),
 * you would call this function, passing the cookie from the request headers.
 */
export function serverEntryLoader(cookies: Record<string, string>): StoredData {
	const empty = { accounts: [] };
	if (!cookies) return empty;

	const cookieValue = cookies["applesauce-account"];

	if (!cookieValue) return empty;

	// Here you could also fetch additional profile data from a backend
	// and merge it into the profileData object.

	return JSON.parse(decodeURIComponent(cookieValue));
}

/** Returns the AccountManager from the context. */
export function useAccountManager(): AccountManager | undefined {
	const accountManager = useContext(AccountsContext);
	return accountManager.value;
}

/** Returns the user's profile data. */
export function useProfileData(): ProfileData {
	return useContext(ProfileDataContext);
}

/** Provides an AccountManager to the app. */
export function useAccountsProvider(serverData: StoredData | undefined) {
	const accountManager = useSignal<AccountManager>();
	const profileData = useStore<ProfileData>(serverData?.profileData || {});

	const manager = noSerialize(new AccountManager());

	useTask$(() => {
		if (!manager) return;

		registerCommonAccountTypes(manager);
		if (serverData?.accounts) {
			manager.fromJSON(serverData.accounts);
		}
		if (serverData?.activeAccount) {
			const account = manager.getAccount(serverData.activeAccount);
			if (account) manager.setActive(account);
		}
		accountManager.value = manager;
	});

	useVisibleTask$(
		({ cleanup }) => {
			// On the client, load profile data from a cookie (if available)
			const manager = new AccountManager();

			registerCommonAccountTypes(manager);
			if (serverData?.accounts) {
				manager.fromJSON(serverData.accounts);
			}
			if (serverData?.activeAccount) {
				const account = manager.getAccount(serverData.activeAccount);
				if (account) manager.setActive(account);
			}
			accountManager.value = manager;

			const cookieName = "applesauce-account";

			// This task runs on the client and saves data to the cookie
			const manualSave = new Subject<void>();
			const sub = merge(
				manualSave,
				manager.accounts$,
				manager.active$,
			).subscribe(() => {
				const dataToStore: StoredData = {
					accounts: manager.toJSON(),
					activeAccount: manager.active?.id,
					profileData: profileData,
				};
				setCookie(cookieName, JSON.stringify(dataToStore), 365);
			});

			cleanup(() => sub.unsubscribe());
		},
		{ strategy: "document-ready" },
	);

	useContextProvider(AccountsContext, accountManager);
	useContextProvider(ProfileDataContext, profileData);
}
