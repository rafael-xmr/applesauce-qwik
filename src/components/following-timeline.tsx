import { component$, Resource, useContext } from "@qwik.dev/core";
import type { ProfilePointer } from "nostr-tools/nip19";
import { useTimeline } from "~/hooks/use-timeline-loader";
import { ContactsContext } from "~/providers";
import { ContactsWrapper } from "./contacts-wrapper";

export const FollowingTimelineBody = component$(() => {
  const contactsCtx = useContext(ContactsContext);

  return <TimelineItems contacts={contactsCtx.contacts} />;
});

export const FollowingTimeline = component$(() => {
  return (
    <ContactsWrapper>
      <FollowingTimelineBody />
    </ContactsWrapper>
  );
});

const TimelineItems = component$(
  ({ contacts }: { contacts: ProfilePointer[] | undefined }) => {
    const serverLoadedTimeline = useTimeline({
      kinds: [1, 6, 16],
      authors: contacts?.map((p) => p.pubkey),
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
