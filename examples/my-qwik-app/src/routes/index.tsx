import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import {
	ExtensionSigner,
	GetRelaysButton,
	ProfileCard,
} from "applesauce-qwik/components";
import { useRelayPoolProvider } from "applesauce-qwik/providers";
import { useAccountsProvider } from "applesauce-qwik/providers/account-manager";
import { useAccountsCookieLdr, useRelaysCookieLdr } from "./layout";

export default component$(() => {
	const accountCookie = useAccountsCookieLdr();
	useAccountsProvider(accountCookie.value);

	const relaysCookie = useRelaysCookieLdr();
	useRelayPoolProvider(relaysCookie.value);

	// useVisibleTask$(() => {
	// 	const cookies = document.cookie.split(";");
	// 	for (const cookie of cookies) {
	// 		const [name, value] = cookie.trim().split("=");
	// 		if (name === "my-cookie") {
	// 			cookieValue.value = value;
	// 			break;
	// 		}
	// 	}
	// });

	return (
		<>
			<div>
				<ProfileCard />
			</div>
			<div>
				<ExtensionSigner />
			</div>
			<div>
				<GetRelaysButton />
			</div>
		</>
	);
});

export const head: DocumentHead = {
	title: "Welcome to Qwik",
	meta: [
		{
			name: "description",
			content: "Qwik site description",
		},
	],
};
