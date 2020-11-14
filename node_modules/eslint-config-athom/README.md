# eslint-config-athom
ESLint config for Athom B.V. JavaScript projects.

## Usage

In your JavaScript project:

```bash
$ npm install --save-dev eslint eslint-config-athom
```

Then create a file `/.eslintrc.json` in your project's root:

```javascript
{
  "extends": "athom"
}
```

Now, edit your project's `/package.json` file to contain the following:

```json
"engines": {
  "node": ">=8.0.0"
}
```

Optionally, copy the `.editorconfig` file in this repository to your project's root to force 2 spaces.
```bash
$ cp node_modules/eslint-config-athom/.editorconfig .editorconfig
```
