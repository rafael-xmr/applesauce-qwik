import { useContext } from "@qwik.dev/core";
import { kinds } from "nostr-tools";
import { ContactsContext } from "~/providers/contacts";
import { AccountManagerContext } from "../providers";
import useReplaceableEvent from "./use-replaceable-event";

export function useContactsEvent() {
	const contactsCtx = useContext(ContactsContext);

	const hasContacts = contactsCtx.contacts.length > 0;

	const accountManagerCtx = useContext(AccountManagerContext);
	const pubkey = accountManagerCtx.value.activeAccount?.pubkey;

	const listId = pubkey && `${kinds.Contacts}:${pubkey}`;
	const listEvent = useReplaceableEvent(hasContacts ? undefined : listId);

	return listEvent;
}
