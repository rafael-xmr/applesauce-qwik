import { type NoSerialize, useSignal, useTask$ } from "@qwik.dev/core";
import type { Observable } from "rxjs";

/**
 * Optimized for safely getting synchronous values from hot or pure observables.
 *
 * Returns a Qwik Signal that holds the latest emitted value.
 * The component will automatically re-render when the signal's value changes.
 *
 * Throws an error if the observable does not emit a value synchronously upon subscription.
 *
 * ⚠ If the observable is cold and has side effects,
 * they will be performed at least twice!
 *
 * @template TState The type of the state.
 *
 * @param state$ An observable of the state value.
 *   It's recommended to wrap the observable with `noSerialize()` before passing it to this hook,
 *   to prevent it from being serialized by Qwik during SSR.
 *
 * @returns The latest value from the observable signal.
 */
export function useObservableEagerState<TState>(
	state$: NoSerialize<Observable<TState>>,
) {
	const errorSignal = useSignal<Error | null>(null);
	const didSyncEmit = useSignal(false);

	const stateSignal = useSignal<TState | undefined>(() => {
		if (!state$) {
			// This can happen if the parent component doesn't provide the observable.
			// We'll let the check below handle the error.
			return undefined;
		}

		let initialState: TState;
		const sub = state$.subscribe({
			next: (value) => {
				didSyncEmit.value = true;
				initialState = value;
			},
			error: (error) => {
				errorSignal.value = error;
			},
		});
		// sub?.unsubscribe();
		return initialState!;
	});

	useTask$(({ cleanup }) => {
		// Subscribe to the observable for updates.
		const subscription = state$?.subscribe({
			next: (value) => {
				// Qwik signals automatically prevent unnecessary re-renders
				// if the new value is the same as the old one.
				stateSignal.value = value;
			},
			error: (error) => {
				errorSignal.value = error;
			},
		});

		cleanup(() => {
			subscription?.unsubscribe();
		});
	});

	// Propagate errors from either sync or async subscriptions.
	if (errorSignal.value) {
		throw errorSignal.value;
	}

	// Enforce the "eager" contract: a value must be available synchronously.
	if (!didSyncEmit.value) {
		throw new Error("Observable did not synchronously emit a value.");
	}

	return stateSignal;
}
