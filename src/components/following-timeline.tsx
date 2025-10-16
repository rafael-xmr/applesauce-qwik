import { component$, Resource, useContext } from "@qwik.dev/core";
import { useTimeline } from "~/hooks/use-timeline-loader";
import { ContactsContext } from "~/providers";
import { ContactsWrapper } from "./contacts-wrapper";

const TimelineItems = component$(() => {
  const contactsCtx = useContext(ContactsContext);

  const serverLoadedTimeline = useTimeline({
    kinds: [1, 6, 16],
    authors: contactsCtx.contacts?.map((p) => p.pubkey),
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
});

export const FollowingTimeline = component$(() => {
  return (
    <ContactsWrapper>
      <TimelineItems />
    </ContactsWrapper>
  );
});
