import { component$, Resource, Slot, useContext } from "@qwik.dev/core";
import type { ProfileEvent } from "applesauce-core/helpers/profile";
import { useProfileEvent } from "~/hooks/use-profile-event";
import { AccountManagerStoreContext } from "../providers";

export const ProfileWrapper = component$(() => {
  const accountManagerStoreCtx = useContext(AccountManagerStoreContext);
  const profileEvent = useProfileEvent();

  return (
    <Resource
      value={profileEvent.value}
      onRejected={(err) => {
        console.error("Failed to load profile:", err);
        return <>Failed to load profile.</>;
      }}
      onPending={() => <>Loading profile...</>}
      onResolved={(resolvedProfile) => {
        if (resolvedProfile) {
          accountManagerStoreCtx.resolvedProfile =
            resolvedProfile as ProfileEvent;
        }
        return <Slot />;
      }}
    />
  );
});
