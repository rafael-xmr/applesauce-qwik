import { useComputed$, useContext } from "@qwik.dev/core";
import { kinds } from "nostr-tools";
import { AccountManagerContext, ContactsContext } from "../providers";
import useReplaceableEvent from "./use-replaceable-event";

export function useContactsEvent() {
  const accountManagerCtx = useContext(AccountManagerContext);
  const contactsCtx = useContext(ContactsContext);

  const pubkey = useComputed$(
    () => accountManagerCtx.value.activeAccount?.pubkey,
  );

  const coord = useComputed$(() => {
    if (contactsCtx.contactsEvent) {
      // NOTE: no pointer if we have a stored contacts event, useReplaceableEvent will return the stored contacts
      return undefined;
    }

    return pubkey.value && `${kinds.Contacts}:${pubkey.value}`;
  });

  const listEvent = useReplaceableEvent(coord, {}, contactsCtx.contactsEvent);

  return listEvent;
}
