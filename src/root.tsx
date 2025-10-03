import { useServerData } from "@qwik.dev/core";
import { App } from "./app";
import type { StoredData } from "./providers/account-manager";

export default () => {
	const accountData = useServerData<StoredData>("accountData");

	return (
		<>
			<head>
				<meta charset="utf-8" />
				<title>Qwik Blank App</title>
			</head>
			<body>
				<App accountData={accountData} />
			</body>
		</>
	);
};
