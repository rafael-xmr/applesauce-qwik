import { component$, Resource, Slot, useContext } from "@qwik.dev/core";
import { getProfilePointersFromList } from "applesauce-core/helpers/lists";
import { ContactsContext } from "~/providers/contacts";
import { useContactsEvent } from "../hooks/use-contacts-event";

export const ContactsWrapper = component$(() => {
	const contactsCtx = useContext(ContactsContext);
	const contactsEvent = useContactsEvent();

	return (
		<div>
			{contactsCtx.contacts.length > 0 ? (
				<Slot />
			) : (
				<Resource
					value={contactsEvent.value}
					onRejected={(err) => {
						console.error(err);
						return <>Failed to load contacts.</>;
					}}
					onPending={() => <>Loading contacts...</>}
					onResolved={(resolvedContactsEvent) => {
						const contacts =
							resolvedContactsEvent &&
							getProfilePointersFromList(resolvedContactsEvent);

						if (contacts) {
							contactsCtx.contacts = contacts;
							contactsCtx.contactsEvent = resolvedContactsEvent;
						}

						return <Slot />;
					}}
				/>
			)}
		</div>
	);
});
