import { useSignal } from "@builder.io/qwik";

export function useAsyncAction<T, Args extends any[]>(
	fn: (...args: Args) => Promise<T>,
) {
	const loading = useSignal(false);

	const run = async (...args: Args): Promise<T> => {
		loading.value = true;
		try {
			return await fn(...args);
		} finally {
			loading.value = false;
		}
	};

	return {
		loading,
		run,
	};
}
