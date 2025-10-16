import { $, component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import {
  ExtensionSigner,
  FollowingCount,
  GetRelaysButton,
  NpubAvatarCard,
  NpubBioCard,
  NpubUsernameCard,
  useAccountsProvider,
  useContactsProvider,
  useRelayPoolProvider,
} from "applesauce-qwik";
import { useAccountsLdr, useContactsLdr, useRelaysCookieLdr } from "./layout";

// TODO: implement AUTH
export default component$(() => {
  const accountManagerServerData = useAccountsLdr();
  useAccountsProvider(
    accountManagerServerData.value,
    $((pubkey) => `/profiles?user=${pubkey}`),
  );

  const relaysCookie = useRelaysCookieLdr();
  useRelayPoolProvider(relaysCookie.value);

  const contactsServerData = useContactsLdr();
  useContactsProvider(
    contactsServerData.value,
    $((pubkey) => `/contacts?user=${pubkey}`),
  );

  return (
    <>
      <div>
        <NpubAvatarCard />
      </div>
      <div>
        <NpubUsernameCard />
      </div>
      <div>
        <NpubBioCard />
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
      {/* <div> */}
      {/*   <FollowingTimeline /> */}
      {/* </div> */}
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
