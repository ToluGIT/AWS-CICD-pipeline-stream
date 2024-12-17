// eslint.config.mjs
import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    "no-console": "warn",
  },
});
