import { component$, useComputed$, useContext } from "@qwik.dev/core";
import { getProfilePicture } from "applesauce-core/helpers/profile";
import { AccountManagerContext } from "../providers";
import { ProfileWrapper } from "./profile-wrapper";

const AvatarCardBody = component$(() => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const profileImage = useComputed$(() =>
    getProfilePicture(accountManagerCtx.value.resolvedProfile),
  );

  return (
    <img
      src={profileImage.value}
      alt={profileImage.value}
      height={200}
      width={200}
    />
  );
});

export const NpubAvatarCard = component$(() => {
  return (
    <ProfileWrapper>
      <AvatarCardBody />
    </ProfileWrapper>
  );
});
