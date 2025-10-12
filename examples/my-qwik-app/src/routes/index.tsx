import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import {
  ExtensionSigner,
  FollowingCount,
  FollowingTimeline,
  GetRelaysButton,
  ProfileCard,
  useAccountsProvider,
  useContactsProvider,
  useRelayPoolProvider,
} from "applesauce-qwik";
import {
  useAccountsCookieLdr,
  useContactsCookieLdr,
  useRelaysCookieLdr,
} from "./layout";

export default component$(() => {
  const accountCookie = useAccountsCookieLdr();
  useAccountsProvider(accountCookie.value);

  const relaysCookie = useRelaysCookieLdr();
  useRelayPoolProvider(relaysCookie.value);

  const contactsCookie = useContactsCookieLdr();
  useContactsProvider(contactsCookie.value);

  // useVisibleTask$(() => {
  // 	const cookies = document.cookie.split(";");
  // 	for (const cookie of cookies) {
  // 		const [name, value] = cookie.trim().split("=");
  // 		if (name === "my-cookie") {
  // 			cookieValue.value = value;
  // 			break;
  // 		}
  // 	}
  // });

  return (
    <>
      <div>
        <ProfileCard />
      </div>
      <div>
        <FollowingCount />
      </div>
      <div>
        <ExtensionSigner />
      </div>
      <div>
        <GetRelaysButton />
      </div>
      <div>
        <FollowingTimeline />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
