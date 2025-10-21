import { component$, useComputed$, useContext } from "@qwik.dev/core";
import { getProfilePicture } from "applesauce-core/helpers/profile";
import { AccountManagerContext } from "../providers";
import { ProfileWrapper } from "./profile-wrapper";

const AvatarCardBody = component$(({ fallback }: { fallback?: string }) => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const profileImage = useComputed$(() =>
    getProfilePicture(accountManagerCtx.value.resolvedProfile),
  );

  return (
    <img
      src={profileImage.value || fallback}
      alt={profileImage.value || "Anonymous Avatar"}
      height={200}
      width={200}
    />
  );
});

export const NpubAvatarCard = component$(
  ({ fallback }: { fallback?: string }) => {
    return (
      <ProfileWrapper>
        <AvatarCardBody fallback={fallback} />
      </ProfileWrapper>
    );
  },
);
