// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://ops-dss.github.io',
  base: process.env.BASE_PATH || '/config-generator',
  output: 'static',
  build: {
    assets: '_astro',
  },
});
