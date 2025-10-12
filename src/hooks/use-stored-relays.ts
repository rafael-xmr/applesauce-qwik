import { useContext } from "@qwik.dev/core";
import { RelayPoolContext } from "../providers";

export function useRelayPool() {
  const relayPool = useContext(RelayPoolContext);
  return relayPool.value.relayPool;
}

export function useStoredRelays() {
  const relayPool = useContext(RelayPoolContext);
  return relayPool.value.relays;
}

export function useReadRelays() {
  const relayPool = useContext(RelayPoolContext);
  return relayPool.value.readRelays;
}

export function useWriteRelays() {
  const relayPool = useContext(RelayPoolContext);
  return relayPool.value.writeRelays;
}
