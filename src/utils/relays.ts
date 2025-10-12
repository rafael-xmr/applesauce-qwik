export interface StoredRelay {
  name: string;
  read: boolean;
  write: boolean;
}

export function getReadAndWriteRelayLists(relays: StoredRelay[]) {
  const readRelays = [];
  const writeRelays = [];
  for (const relay of relays) {
    if (relay.read) {
      readRelays.push(relay.name);
    } else if (relay.write) {
      writeRelays.push(relay.name);
    }
  }
  return { readRelays, writeRelays };
}
