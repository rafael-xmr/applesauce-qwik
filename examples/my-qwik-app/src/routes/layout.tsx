import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
  useAccountsCookieLoader,
  useRelaysCookieLoader,
} from "applesauce-qwik/providers";
import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useAccountsCookieLdr = useAccountsCookieLoader;
export const useRelaysCookieLdr = useRelaysCookieLoader;

export default component$(() => {
  useStyles$(styles);
  return (
    <main>
      <Slot />
    </main>
  );
});
