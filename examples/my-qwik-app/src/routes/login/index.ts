import type { RequestHandler } from "@qwik.dev/router";
import { nip98 } from "nostr-tools";

export const onPost: RequestHandler = async ({ request, url, json }) => {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      json(401, { error: "Missing Authorization header" });
      return;
    }

    const event = await nip98.unpackEventFromToken(authHeader);

    // Parse body if present; payload tag check is optional per spec
    // and only applied when body has content/keys
    let bodyObj: unknown = undefined;
    try {
      const text = await request.text();
      bodyObj = text ? JSON.parse(text) : undefined;
    } catch {
      // Ignore body parse errors, not required for validation here
    }

    // Throws with descriptive error when invalid
    await nip98.validateEvent(event, url.href, request.method, bodyObj);

    // Authorized — return minimal info; client may use pubkey for state
    json(200, { ok: true, pubkey: event.pubkey });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    json(401, { error: message });
  }
};

export const onGet: RequestHandler = async (ev) => {
  return onPost(ev as any);
};
