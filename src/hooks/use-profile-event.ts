import { useComputed$, useContext } from "@qwik.dev/core";
import {
  addRelayHintsToPointer,
  parseCoordinate,
} from "applesauce-core/helpers/pointers";
import { kinds } from "nostr-tools";
import { AccountManagerContext, RelayPoolContext } from "../providers";
import useReplaceableEvent from "./use-replaceable-event";

export function useProfileEvent() {
  const accountManagerCtx = useContext(AccountManagerContext);
  const relayPoolCtx = useContext(RelayPoolContext);

  const storedProfile = useComputed$(
    () => accountManagerCtx.value.resolvedProfile,
  );
  const pubkey = useComputed$(
    () => accountManagerCtx.value.activeAccount?.pubkey,
  );

  const pointer = useComputed$(() => {
    const coord = parseCoordinate(`${kinds.Metadata}:${pubkey.value}`);

    if (!!storedProfile.value) {
      // NOTE: no pointer if we have a stored profile, useReplaceableEvent will return the stored profile
      return undefined;
    }

    return (
      (!!pubkey.value &&
        !!coord &&
        addRelayHintsToPointer(coord, relayPoolCtx.value.readRelays)) ||
      undefined
    );
  });

  const listEvent = useReplaceableEvent(pointer, {}, storedProfile.value);

  return listEvent;
}
