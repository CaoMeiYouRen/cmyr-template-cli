import { describe, expect, it } from 'vitest'
import { adjustDependabotConfig, buildWorkflowPlan, shouldRemoveDependabot, DependabotConfig } from './ci'
import { IPackage } from '@/types/interfaces'

describe('buildWorkflowPlan', () => {
    it('includes release workflow when semantic release enabled', () => {
        const plan = buildWorkflowPlan({ isInitSemanticRelease: true })
        expect(plan.filesToCopy).toContain('.github/workflows/release.yml')
    })

    it('removes release workflow when semantic release disabled', () => {
        const plan = buildWorkflowPlan({ isInitSemanticRelease: false })
        expect(plan.filesToRemove).toContain('.github/workflows/release.yml')
    })
})

describe('shouldRemoveDependabot', () => {
    it('removes when project is closed source', () => {
        expect(shouldRemoveDependabot({ isOpenSource: false, isRemoveDependabot: false })).toBe(true)
    })

    it('respects explicit removal flag', () => {
        expect(shouldRemoveDependabot({ isOpenSource: true, isRemoveDependabot: true })).toBe(true)
    })
})

describe('adjustDependabotConfig', () => {
    const buildBaseConfig = (): DependabotConfig => ({
        version: 2,
        updates: [
            {
                'package-ecosystem': 'npm',
                directory: '/',
                'open-pull-requests-limit': 10,
                schedule: {
                    interval: 'daily',
                    time: '01:00',
                    timezone: 'UTC',
                },
            },
        ],
    })

    it('normalizes schedule and adds art-template ignore when needed', () => {
        const pkg: IPackage = { dependencies: { 'art-template': '^4.13.1' } }
        const result = adjustDependabotConfig({ dependabot: buildBaseConfig(), pkg })
        const npmUpdate = result.updates.find((update) => update['package-ecosystem'] === 'npm')
        expect(npmUpdate?.schedule).toEqual({ interval: 'monthly', time: '04:00', timezone: 'Asia/Shanghai' })
        expect(npmUpdate?.ignore).toEqual([
            {
                'dependency-name': 'art-template',
                versions: ['>= 4.13.3'],
            },
        ])
    })

    it('ensures github-actions updater exists', () => {
        const pkg: IPackage = { dependencies: {} }
        const result = adjustDependabotConfig({ dependabot: buildBaseConfig(), pkg })
        expect(result.updates.some((update) => update['package-ecosystem'] === 'github-actions')).toBe(true)
    })

    it('removes art-template ignore when dependency is absent', () => {
        const config = buildBaseConfig()
        config.updates[0].ignore = [
            {
                'dependency-name': 'art-template',
                versions: ['>= 4.13.3'],
            },
        ]
        const pkg: IPackage = { dependencies: {} }
        const result = adjustDependabotConfig({ dependabot: config, pkg })
        const npmUpdate = result.updates.find((update) => update['package-ecosystem'] === 'npm')
        expect(npmUpdate?.ignore).toBeUndefined()
    })

    it('does not duplicate github-actions updater if already present', () => {
        const config = buildBaseConfig()
        config.updates.push({
            'package-ecosystem': 'github-actions',
            directory: '/',
            'open-pull-requests-limit': 5,
            schedule: {
                interval: 'weekly',
                time: '05:00',
                timezone: 'UTC',
            },
        })
        const pkg: IPackage = { dependencies: {} }
        const result = adjustDependabotConfig({ dependabot: config, pkg })
        const actionsUpdates = result.updates.filter((update) => update['package-ecosystem'] === 'github-actions')
        expect(actionsUpdates).toHaveLength(1)
        expect(actionsUpdates[0].schedule).toEqual({ interval: 'weekly', time: '05:00', timezone: 'UTC' })
    })
})
