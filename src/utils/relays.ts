export interface StoredRelays {
  [name: string]: {
    read: boolean;
    write: boolean;
  };
}

export function getReadAndWriteRelayLists(relays: StoredRelays) {
  const readRelays = [];
  const writeRelays = [];
  for (const [name, relay] of Object.entries(relays)) {
    if (relay.read) {
      readRelays.push(name);
    }
    if (relay.write) {
      writeRelays.push(name);
    }
  }
  return { readRelays, writeRelays };
}
