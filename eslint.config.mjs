// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import cmyr from 'eslint-config-cmyr'
import tseslint from 'typescript-eslint'
import { __WARN__, createLanguageOptions } from 'eslint-config-cmyr/utils'

export default defineConfig([
    globalIgnores([
        'templates/**/*',
        '*.config.ts',
    ]),
    cmyr,
    {
        rules: {
            'no-console': 0,
            'require-await': 0,

            'max-lines': [1, { max: 500 }], // 强制文件的最大行数
            'max-lines-per-function': [0, { max: 150 }], // 强制函数最大行数
        },
    },
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        extends: [
            // tseslint.configs.recommendedTypeChecked,
        ],
        plugins: {
            tseslint,
        },
        languageOptions: createLanguageOptions({}, {
            projectService: {
                defaultProject: 'tsconfig.json',
            },
            tsconfigRootDir: process.cwd(),
        }),
        rules: {
            '@typescript-eslint/no-require-imports': 0,
            '@typescript-eslint/no-deprecated': [1], // 禁止使用已废弃的 API
        },
    },
])
