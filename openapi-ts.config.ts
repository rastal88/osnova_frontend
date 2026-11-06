import { defineConfig } from '@hey-api/openapi-ts';

/**
 * API types generated from the backend schema (osnova_backend: make openapi).
 * Run `npm run generate:client` after the backend API changes and commit the result.
 */
export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? '../osnova_backend/openapi.json',
  output: { path: 'src/api/generated', format: false, lint: false },
  plugins: ['@hey-api/typescript'],
});
