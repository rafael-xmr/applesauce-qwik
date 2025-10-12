import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import {
  useAccountsCookieLoader,
  useContactsCookieLoader,
  useRelaysCookieLoader,
} from "applesauce-qwik";
import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useAccountsCookieLdr = useAccountsCookieLoader;
export const useRelaysCookieLdr = useRelaysCookieLoader;
export const useContactsCookieLdr = useContactsCookieLoader;

export default component$(() => {
  useStyles$(styles);
  return (
    <main>
      <Slot />
    </main>
  );
});
