import type { RequestHandler } from "@qwik.dev/router";
import { getValue, setValue } from "../../db";

export const onGet: RequestHandler = async ({ query, json }) => {
  const user = query.get("user");
  if (!user) {
    json(400, { message: "User not specified" });
    return;
  }

  const profile = getValue(`${user}-profiles`);
  if (!profile) {
    json(200, []);
    return;
  }

  json(200, profile);
};

export const onPost: RequestHandler = async ({ query, parseBody, json }) => {
  const user = query.get("user");
  if (!user) {
    return;
  }

  const body = await parseBody();
  setValue(`${user}-profiles`, body);
  json(200, body);
};
