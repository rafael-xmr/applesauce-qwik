import fs from "fs";
import path from "path";

const dbPath = path.resolve("./db.json");

interface DbData {
  [key: string]: any;
}

function readDb(): DbData {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function writeDb(data: DbData) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getValue(key: string) {
  const db = readDb();
  return db[key];
}

export function setValue(key: string, value: any) {
  const db = readDb();
  db[key] = value;
  writeDb(db);
}
