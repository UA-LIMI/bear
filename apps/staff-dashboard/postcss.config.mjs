import { config as reshapedConfig } from 'reshaped/config/postcss';

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    ...reshapedConfig.plugins,
  },
};

export default config;
