import pkg from './package.json' with { type: 'json' }
const { name } = pkg
/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                config: 'conventional-changelog-cmyr-config',
            },
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                config: 'conventional-changelog-cmyr-config',
            },
        ],
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md',
                changelogTitle: `# ${name}`,
            },
        ],
        '@semantic-release/npm',
        '@semantic-release/github',
        [
            '@semantic-release/git',
            {
                assets: [
                    'CHANGELOG.md',
                    'package.json',
                ],
            },
        ],
    ],
}
