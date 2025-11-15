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
            'max-lines': [1, { max: 500 }], // 强制文件的最大行数
            'max-lines-per-function': [1, { max: 150 }], // 强制函数最大行数
        },
    },
])
