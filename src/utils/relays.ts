export interface StoredRelays {
  [url: string]: {
    read: boolean;
    write: boolean;
  };
}

export function getReadAndWriteRelayLists(relays: StoredRelays) {
  const readRelays = [];
  const writeRelays = [];
  for (const [url, relay] of Object.entries(relays)) {
    if (relay.read) {
      readRelays.push(url);
    }
    if (relay.write) {
      writeRelays.push(url);
    }
  }
  return { readRelays, writeRelays };
}
