import { asyncExec } from './exec'

export async function getGitUserName(): Promise<string> {
    try {
        return (await asyncExec('git config user.name') as string)?.trim()
    } catch {
        return ''
    }
}

export async function initGitRepo(projectPath: string): Promise<void> {
    try {
        await asyncExec('git init', { cwd: projectPath })

    } catch {
        throw new Error('Failed to initialize git repository')
    }
}

export async function addGitRemote(
    projectPath: string,
    remoteUrl: string,
): Promise<void> {
    try {
        await asyncExec(`git remote add origin ${remoteUrl}`, { cwd: projectPath })
    } catch {
        throw new Error('Failed to add git remote')
    }
}

