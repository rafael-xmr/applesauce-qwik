import { useComputed$, useContext } from "@qwik.dev/core";
import { kinds } from "nostr-tools";
import { AccountManagerContext } from "../providers";
import useReplaceableEvent from "./use-replaceable-event";

export function useProfileEvent() {
  const accountManagerCtx = useContext(AccountManagerContext);

  const storedProfile = useComputed$(
    () => accountManagerCtx.value.resolvedProfile,
  );
  const pubkey = useComputed$(
    () => accountManagerCtx.value.activeAccount?.pubkey,
  );

  const coord = useComputed$(() => {
    if (storedProfile.value) {
      // NOTE: no pointer if we have a stored profile, useReplaceableEvent will return the stored profile
      return undefined;
    }

    return pubkey.value && `${kinds.Metadata}:${pubkey.value}`;
  });

  const listEvent = useReplaceableEvent(coord, {}, storedProfile.value);

  return listEvent;
}
