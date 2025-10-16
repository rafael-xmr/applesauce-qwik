import { open } from "lmdb";

const db = open({
  path: "db",
  compression: true,
});

export function getValue<T>(key: string): T | undefined {
  return db.get(key);
}

export function setValue<T>(key: string, value: T) {
  return db.put(key, value);
}