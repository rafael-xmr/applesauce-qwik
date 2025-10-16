import { component$, useComputed$, useContext } from "@qwik.dev/core";
import { getProfileContent } from "applesauce-core/helpers/profile";
import { AccountManagerContext } from "../providers";
import { ProfileWrapper } from "./profile-wrapper";

const BioCardBody = component$(() => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const content = useComputed$(() => {
    const profileEvent = accountManagerCtx.value.resolvedProfile;
    return profileEvent && getProfileContent(profileEvent);
  });

  return <>{content.value?.about}</>;
});

export const NpubBioCard = component$(() => {
  return (
    <ProfileWrapper>
      <BioCardBody />
    </ProfileWrapper>
  );
});
