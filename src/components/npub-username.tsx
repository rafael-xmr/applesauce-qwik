import { component$, useComputed$, useContext } from "@qwik.dev/core";
import { getDisplayName } from "applesauce-core/helpers/profile";
import { AccountManagerContext } from "../providers";
import { ProfileWrapper } from "./profile-wrapper";

const UsernameCardBody = component$(() => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const displayName = useComputed$(() => {
    const profileEvent = accountManagerCtx.value.resolvedProfile;
    const fallback = accountManagerCtx.value.activeAccount?.pubkey;

    return getDisplayName(profileEvent, fallback);
  });

  return <>{displayName.value}</>;
});

export const NpubUsernameCard = component$(() => {
  return (
    <ProfileWrapper>
      <UsernameCardBody />
    </ProfileWrapper>
  );
});
