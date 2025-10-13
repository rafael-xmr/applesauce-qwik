import {
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import type { Event } from "nostr-tools";
import type { ProfilePointer } from "nostr-tools/nip19";
import { AccountManagerContext } from "./account-manager";

export const ContactsContext = createContextId<StoredContactsData>(
  "applesauce.contacts",
);

export interface StoredContactsData {
  contacts: ProfilePointer[];
  contactsEvent: Event | undefined;
}

/** Provides an ContactsContext to the app. */
export function useContactsProvider(
  serverData?: StoredContactsData | undefined,
) {
  const activeAccount = useContext(AccountManagerContext);

  const contactsStore = useStore<StoredContactsData>(
    serverData || {
      contacts: [],
      contactsEvent: undefined,
    },
  );

  useVisibleTask$(
    async ({ track }) => {
      const newActiveAccount = track(activeAccount).activeAccount;

      if (!newActiveAccount?.pubkey) {
        return;
      }

      const response = await fetch(`/contacts?user=${newActiveAccount.pubkey}`);
      const data = await response.json();

      if (data) {
        contactsStore.contacts = data.contacts;
        contactsStore.contactsEvent = data.contactsEvent;
      }
    },
    { strategy: "document-ready" },
  );

  useVisibleTask$(
    async ({ track }) => {
      const newContacts = track(contactsStore);
      const newActiveAccount = track(activeAccount).activeAccount;

      if (!newActiveAccount?.pubkey) {
        return;
      }

      await fetch(`/contacts?user=${newActiveAccount.pubkey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContacts),
      });
    },
    { strategy: "document-ready" },
  );

  useContextProvider(ContactsContext, contactsStore);
}
