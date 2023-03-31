# Incepto Frontend Tech Stack

This repo contains a scaffold for building frontend apps. Includes testing, hot reload, and build integrated.

The tech stack is:

- [ViteJS](https://vitejs.dev/): for bundling
- [Preact](): like React; more optimized.
- [Vitest](https://vitest.dev/): a test runnner with an API similar to Jest
- [Preact Testing Library](https://preactjs.com/guide/v10/preact-testing-library/): for DOM testing. analogous to React Testing Library.
- CSS and SASS are available. PostCSS is configured with
  - [Autoprefixer](https://github.com/postcss/autoprefixer#readme)
  - [postcss-rem](https://github.com/pierreburel/postcss-rem): Rem helpers. e.g. `rem(10px)`
  - [cssnano](https://cssnano.co/): to compress CSS
  - [purge-css](https://purgecss.com/): prevents emitting unused styles.

### Editor config

These are not checked in, but vscode folder should have a settings.json with this in it.

```json
{
	"typescript.format.semicolons": "insert",
	"[typescriptreact]": {
		"editor.formatOnSave": true,
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[typescript]": {
		"editor.formatOnSave": true,
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"editor.codeActionsOnSave": {
		"source.fixAll": true,
		"source.organizeImports": true,
		"source.sortMembers": true
	}
}
```
