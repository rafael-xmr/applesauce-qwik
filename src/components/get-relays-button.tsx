import {
	component$,
	useContext,
	useSignal,
	useVisibleTask$,
} from "@qwik.dev/core";
import { AccountManagerContext, RelayPoolContext } from "../providers";

export const GetRelaysButton = component$(() => {
	const accountManagerCtx = useContext(AccountManagerContext);
	const relayPoolCtx = useContext(RelayPoolContext);

	const newRelayInput = useSignal("");
	const newRelayRead = useSignal(true);
	const newRelayWrite = useSignal(true);

	const hasExtension = useSignal(false);

	useVisibleTask$(() => {
		hasExtension.value = !!window.nostr;
	});

	return (
		<>
			<ul>
				{relayPoolCtx.value.relays.map((relay, index) => (
					<li key={relay.name}>
						{relay.name}
						<label>
							<input
								type="checkbox"
								checked={relay.read}
								onChange$={() => {
									relayPoolCtx.value.relays[index].read = !relay.read;
								}}
							/>
							Read
						</label>
						<label>
							<input
								type="checkbox"
								checked={relay.write}
								onChange$={() => {
									relayPoolCtx.value.relays[index].write = !relay.write;
								}}
							/>
							Write
						</label>
						<button
							type="button"
							onClick$={() => {
								relayPoolCtx.value.relays.splice(index, 1);
							}}
						>
							Delete
						</button>
					</li>
				))}
			</ul>

			<div>
				<input
					type="text"
					value={newRelayInput.value}
					onInput$={(e) => {
						newRelayInput.value = (e.target as HTMLInputElement).value;
					}}
					placeholder="wss://new.relay.com"
				/>
				<label>
					<input
						type="checkbox"
						checked={newRelayRead.value}
						onChange$={() => {
							newRelayRead.value = !newRelayRead.value;
						}}
					/>
					Read
				</label>
				<label>
					<input
						type="checkbox"
						checked={newRelayWrite.value}
						onChange$={() => {
							newRelayWrite.value = !newRelayWrite.value;
						}}
					/>
					Write
				</label>
				<button
					type="button"
					onClick$={() => {
						const relayUrl = newRelayInput.value.trim();
						if (/^wss?:\/\/.+/.test(relayUrl)) {
							relayPoolCtx.value.relays.push({
								name: relayUrl,
								read: newRelayRead.value,
								write: newRelayWrite.value,
							});
							newRelayInput.value = "";
							newRelayRead.value = true;
							newRelayWrite.value = true;
						} else {
							alert(
								"Please enter a valid relay URL starting with wss:// or ws://",
							);
						}
					}}
				>
					Add Relay
				</button>
			</div>

			{accountManagerCtx.value.activeAccount ? (
				<button
					type="button"
					onClick$={async () => {
						const fetchedRelays =
							await accountManagerCtx.value.activeAccount?.getRelays();
						if (fetchedRelays) {
							const newRelays = Object.entries(fetchedRelays).map(
								([name, { read, write }]) => ({
									name,
									read,
									write,
								}),
							);
							newRelays.forEach((newRelay) => {
								if (
									!relayPoolCtx.value.relays.some(
										(existing) => existing.name === newRelay.name,
									)
								) {
									relayPoolCtx.value.relays.push(newRelay);
								}
							});
						}
					}}
				>
					Get relays from extension
				</button>
			) : (
				<button type="button" disabled={true}>
					No Nostr relays
				</button>
			)}
		</>
	);
});
