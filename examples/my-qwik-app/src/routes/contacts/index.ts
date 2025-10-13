import type { RequestHandler } from "@qwik.dev/router";
import { getValue, setValue } from "../../db";

export const onGet: RequestHandler = async ({ query, json }) => {
  const user = query.get("user");
  if (!user) {
    json(400, { message: "User not specified" });
    return;
  }

  const contacts = getValue(user);
  if (!contacts) {
    json(200, []);
    return;
  }

  json(200, contacts);
};

export const onPost: RequestHandler = async ({ query, parseBody }) => {
  const user = query.get("user");
  if (!user) {
    return;
  }

  const body = await parseBody();
  setValue(user, body);
};
