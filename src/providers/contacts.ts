import {
	createContextId,
	isServer,
	type QRL,
	useContext,
	useContextProvider,
	useStore,
	useTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Cookies from "js-cookie";
import type { Event } from "nostr-tools";
import type { ProfilePointer } from "nostr-tools/nip19";
import { AccountManagerContext } from "./account-manager";

export const CONTACTS_COOKIE_NAME = "applesauce-contacts";

export const useContactsCookieLoader = routeLoader$(({ cookie }) => {
	return cookie.get(CONTACTS_COOKIE_NAME)?.value;
});

export const ContactsContext = createContextId<StoredContactsData>(
	"applesauce.contacts",
);

export interface StoredContactsData {
	contacts: ProfilePointer[];
	contactsEvent: Event | undefined;
}

/** Provides an ContactsContext to the app. */
export function useContactsProvider(
	serverData: StoredContactsData = {
		contacts: [],
		contactsEvent: undefined,
	},
	serverStorePathBuilder?: QRL<(pubkey: string) => string>,
) {
	const activeAccount = useContext(AccountManagerContext);
	const contactsStore = useStore<StoredContactsData>(serverData);

	useTask$(async ({ track }) => {
		if (isServer) return;

		// NOTE: This task tracks the activeAccount and updates the contactsStore based on the active account's pubkey.
		const newActiveAccount = track(activeAccount).activeAccount;

		if (!newActiveAccount?.pubkey) {
			return;
		}

		const serverStorePathBuilderFn = await serverStorePathBuilder?.resolve();

		if (serverStorePathBuilderFn) {
			const response = await fetch(
				serverStorePathBuilderFn(newActiveAccount.pubkey),
			);
			const data = await response.json();

			if (data) {
				contactsStore.contacts = data.contacts;
				contactsStore.contactsEvent = data.contactsEvent;
			}
		}
	});

	useTask$(async ({ track }) => {
		const newContacts = track(contactsStore);

		if (isServer) return;

		// NOTE: This task tracks changes to contactsStore to persist contacts data to the server and cookies.
		// TODO: check if changed
		const activePubkey = activeAccount.value?.activeAccount?.pubkey;

		if (!activePubkey) {
			return;
		}

		const dataToStore = JSON.stringify(newContacts);

		Cookies.set(CONTACTS_COOKIE_NAME, JSON.stringify(dataToStore));

		const serverStorePathBuilderFn = await serverStorePathBuilder?.resolve();

		if (serverStorePathBuilderFn)
			await fetch(serverStorePathBuilderFn(activePubkey), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: dataToStore,
			});
	});

	useContextProvider(ContactsContext, contactsStore);
}
