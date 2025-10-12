import { component$, useContext } from "@qwik.dev/core";
import { ContactsWrapper } from "~/components/contacts-wrapper";
import { ContactsContext } from "~/providers/contacts";

export const FollowingCountBody = component$(() => {
  const contactsCtx = useContext(ContactsContext);

  return <>Contacts: {contactsCtx.contacts.length}.</>;
});

export const FollowingCount = component$(() => {
  return (
    <ContactsWrapper>
      <FollowingCountBody />
    </ContactsWrapper>
  );
});
