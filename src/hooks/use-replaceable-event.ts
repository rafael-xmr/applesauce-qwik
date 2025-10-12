import { useComputed$, useContext } from "@qwik.dev/core";
import type { AddressPointerWithoutD } from "applesauce-core/helpers";

import { parseCoordinate } from "applesauce-core/helpers";
import type { AddressPointer } from "nostr-tools/nip19";
import { RelayPoolContext } from "../providers";
import {
  useAddressableQuery,
} from "../queries/addressable-query";
import { useEventModel } from "./use-event-model";

export default function useReplaceableEvent(
  cord: string | AddressPointer | AddressPointerWithoutD | undefined,
  fallbackRelays?: string[] | undefined,
) {
  const parsed = useComputed$(() =>
    typeof cord === "string" ? parseCoordinate(cord) : cord,
  );

  const AddressableQuery = useAddressableQuery(parsed.value, fallbackRelays);

  return useEventModel(AddressableQuery, []);
}
