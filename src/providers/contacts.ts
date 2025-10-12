import {
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Cookies from "js-cookie";
import type { ProfilePointer } from "nostr-tools/nip19";

export const CONTACTS_COOKIE_NAME = "applesauce-contacts";

export const useContactsCookieLoader = routeLoader$(({ cookie }) => {
  return cookie.get(CONTACTS_COOKIE_NAME)?.value;
});

export const ContactsContext = createContextId<StoredContactsData>(
  "applesauce.contacts",
);

export interface StoredContactsData {
  contacts: ProfilePointer[];
}

/** Provides an ContactsContext to the app. */
export function useContactsProvider(cookie?: string | undefined) {
  const parsedCookie = cookie ? JSON.parse(cookie) : {};
  const serverData: StoredContactsData =
    "contacts" in parsedCookie ? parsedCookie : { contacts: [] };

  const contactsStore = useStore<StoredContactsData>(serverData);

  useVisibleTask$(
    ({ track }) => {
      const newContacts = track(contactsStore.contacts);

      Cookies.set(
        CONTACTS_COOKIE_NAME,
        JSON.stringify({ contacts: newContacts }),
      );
    },
    { strategy: "document-ready" },
  );

  useContextProvider(ContactsContext, contactsStore);
}
