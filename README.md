# Qwik Library ⚡️

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik on GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)
- [Partytown](https://partytown.qwik.dev/)
- [Mitosis](https://github.com/BuilderIO/mitosis)
- [Builder.io](https://www.builder.io/)

---

## Project Structure

Inside your project, you'll see the following directories and files:

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── index.ts
```

- `src/components`: Recommended directory for components.

- `index.ts`: The entry point of your component library, make sure all the public components are exported from this file.

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). For Qwik during development, the `dev` command will also server-side render (SSR) the output. The client-side development modules are loaded by the browser.

```
bun dev
```

> Note: during dev mode, Vite will request many JS files, which does not represent a Qwik production build.

## Production

The production build should generate the production build of your component library in (./lib) and the typescript type definitions in (./lib-types).

```
bun build
```

## sideEffects: false

This package is configured with "sideEffects": false in its package.json.<br/>
This tells bundlers that the module [has no side effects](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) when imported.<br/>
Consequently, to maintain the integrity of tree-shaking optimizations, please ensure your code truly contains no side effects (such as modifying global variables or the DOM upon import).<br/>
If your module does introduce side effects, remove "sideEffects": false or specify the specific files with side effects.<br/>
Be sure to only remove it from the specific file where the global is being set. Finally, verify that your build continues to function as expected after making any adjustments to the sideEffects setting.

## Express Server

This app has a minimal [Express server](https://expressjs.com/) implementation. After running a full build, you can preview the build using the command:

```
bun serve
```

Then visit [http://localhost:8080/](http://localhost:8080/)

## Express Server

This app has a minimal [Express server](https://expressjs.com/) implementation. After running a full build, you can preview the build using the command:

```
bun serve
```

Then visit [http://localhost:8080/](http://localhost:8080/)

## Supported NIPs

- [X] NIP-01
- [X] NIP-02
- [ ] NIP-03
- ~[ ] NIP-04~ - deprecated. unplanned
- [ ] NIP-05
- [ ] NIP-06
- [X] NIP-07
- ~[ ] NIP-08~ - deprecated. unplanned
- [ ] NIP-09
- [ ] NIP-10
- [ ] NIP-11
- [ ] NIP-13
- [ ] NIP-14
- [ ] NIP-15
- [ ] NIP-17
- [ ] NIP-18
- [X] NIP-19
- [ ] NIP-21
- [ ] NIP-22
- [ ] NIP-23
- [ ] NIP-24
- [ ] NIP-25
- ~[ ] NIP-26~ - unrecommended. unplanned
- [ ] NIP-27
- [ ] NIP-28
- [ ] NIP-29
- [ ] NIP-30
- [ ] NIP-31
- [ ] NIP-32
- [ ] NIP-34
- [ ] NIP-35
- [ ] NIP-36
- [ ] NIP-37
- [ ] NIP-38
- [ ] NIP-39
- [ ] NIP-40
- [ ] NIP-42
- [ ] NIP-44
- [ ] NIP-45
- [ ] NIP-46
- [ ] NIP-47
- [ ] NIP-48
- [ ] NIP-49
- [ ] NIP-50
- [ ] NIP-51
- [ ] NIP-52
- [ ] NIP-53
- [ ] NIP-54
- [ ] NIP-55
- [ ] NIP-56
- ~[ ] NIP-57~ - lightning/ecash bloat. unplanned
- [ ] NIP-58
- [ ] NIP-59
- ~[ ] NIP-60~ - lightning/ecash bloat. unplanned
- ~[ ] NIP-61~ - lightning/ecash bloat. unplanned
- [ ] NIP-62
- [ ] NIP-64
- [ ] NIP-65
- [ ] NIP-66
- [ ] NIP-68
- [ ] NIP-69
- [ ] NIP-70
- [ ] NIP-71
- [ ] NIP-72
- [ ] NIP-73
- ~[ ] NIP-75~ - lightning/ecash bloat. unplanned
- [ ] NIP-77
- [ ] NIP-78
- [ ] NIP-7D
- [ ] NIP-84
- [ ] NIP-86
- [ ] NIP-87
- [ ] NIP-88
- [ ] NIP-89
- [ ] NIP-90
- [ ] NIP-92
- [ ] NIP-94
- [ ] NIP-96
- [ ] NIP-98
- [ ] NIP-99
- [ ] NIP-A0
- [ ] NIP-B0
- [ ] NIP-B7
- [ ] NIP-C0
- [ ] NIP-C7
- [ ] NIP-EE
