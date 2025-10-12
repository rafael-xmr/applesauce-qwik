import {
  component$,
  Resource,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";
import {
  getDisplayName,
  getProfilePicture,
  type ProfileContent,
} from "applesauce-core/helpers";
import { useReadRelays } from "../hooks";
import useUserProfile, { useProfileLoader } from "../hooks/use-profile-loader";
import { AccountManagerContext } from "../providers";

export const ProfileCard = component$(() => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const pubkey = accountManagerCtx.value.activeAccount?.pubkey || "";
  const profileLoader = useProfileLoader(pubkey);
  const serverLoadedProfile = useUserProfile(pubkey);
  const relaysList = useReadRelays();

  const profile = useSignal<ProfileContent | undefined>(undefined);
  const shouldGetClientProfile = useSignal();
  const useClientProfile = useSignal();

  useVisibleTask$(async ({ track, cleanup }) => {
    const newPubkey = track(accountManagerCtx).activeAccount?.pubkey || "";
    const newProfile = await track(serverLoadedProfile);

    if (shouldGetClientProfile.value || newProfile === undefined) {
      useClientProfile.value = true;

      if (newPubkey) {
        const sub = profileLoader.value.subscribe({
          next: (p) => {
            profile.value = p;
          },
          error: (err) => {
            profile.value = undefined;
          },
        });

        cleanup(() => {
          sub.unsubscribe();
        });
      } else {
        profile.value = undefined;
      }
    }

    shouldGetClientProfile.value = true;
  });

  return (
    <div>
      <Resource
        value={serverLoadedProfile.value}
        onRejected={(err) => {
          return <>Failed to load profile.</>;
        }}
        onPending={() => <>Loading profile...</>}
        onResolved={(resolvedProfile) => {
          const profileToUse = useClientProfile.value
            ? profile.value
            : resolvedProfile;

          const displayName = getDisplayName(
            profileToUse,
            `${pubkey.slice(0, 8)}...`,
          );

          // Get profile picture with robohash fallback
          const profilePicture = getProfilePicture(
            profileToUse,
            `https://robohash.org/${pubkey}.png`,
          );

          return (
            <>
              <img
                src={profilePicture}
                alt={displayName}
                height={200}
                width={200}
              />
              <h3>{displayName}</h3>
              {profileToUse?.about && <p>{profileToUse.about}</p>}
            </>
          );
        }}
      />
    </div>
  );
});
