import cds from '@sap/cds/eslint.config.mjs';
import cdsPlugin from '@sap/eslint-plugin-cds';
import prettier from 'eslint-config-prettier';

export default [...cds.recommended, prettier, cdsPlugin.configs.recommended];
