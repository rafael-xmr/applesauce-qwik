import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";

import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
	return {
		date: new Date().toISOString(),
	};
});

export const useCookieLoader = routeLoader$(({ cookie }) => {
	const myCookie = cookie.get("applesauce-account");
	return myCookie ? myCookie.value : undefined;
});

export default component$(() => {
	useStyles$(styles);
	return (
		<main>
			<Slot />
		</main>
	);
});
