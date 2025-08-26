// eslint.config.mjs
import { defineConfig } from 'eslint/config'
import cmyr from 'eslint-config-cmyr'

export default defineConfig([
    cmyr,
    {
        rules: {
            'no-console': 0,
            'require-await': 0,
            '@typescript-eslint/no-require-imports': 0,
        },
    },
])
