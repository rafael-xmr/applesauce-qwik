import { component$, Resource } from "@qwik.dev/core";
import { getProfilePointersFromList } from "applesauce-core/helpers";
import type { ProfilePointer } from "nostr-tools/nip19";
import { useContactsEvent } from "~/hooks/use-contacts-event";
import { useTimeline } from "~/hooks/use-timeline-loader";

export const FollowingTimeline = component$(() => {
	const contacts = useContactsEvent();

	return (
		<Resource
			value={contacts.value}
			onRejected={(err) => {
				console.error(err);
				return <>Failed to load contacts.</>;
			}}
			onPending={() => <>Loading contacts...</>}
			onResolved={(resolvedContacts) => {
				return (
					<TimelineItems
						resolvedContacts={
							resolvedContacts && getProfilePointersFromList(resolvedContacts)
						}
					/>
				);
			}}
		/>
	);
});

const TimelineItems = component$(
	({
		resolvedContacts,
	}: {
		resolvedContacts: ProfilePointer[] | undefined;
	}) => {
		const serverLoadedTimeline = useTimeline({
			kinds: [1, 6, 16],
			authors: resolvedContacts?.map((p) => p.pubkey),
		});

		return (
			<Resource
				value={serverLoadedTimeline.value}
				onRejected={(err) => {
					console.error(err);
					return <>Failed to load timeline.</>;
				}}
				onPending={() => <>Loading timeline...</>}
				onResolved={(resolvedTimeline) => {
					return resolvedTimeline?.map((item) => {
						return (
							<div key={item.id}>
								<div>{item.pubkey}:</div>
								<div>{item.content}</div>
								<hr />
							</div>
						);
					});
				}}
			/>
		);
	},
);
