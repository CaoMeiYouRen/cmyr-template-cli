import os from 'os'
import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        readJSON: vi.fn(),
    },
}))

import fs from 'fs-extra'
import { loadTemplateCliConfig } from './config'

const fsMock = fs as unknown as {
    pathExists: ReturnType<typeof vi.fn>
    readJSON: ReturnType<typeof vi.fn>
}

let cwdSpy: ReturnType<typeof vi.spyOn>
let homedirSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
    vi.clearAllMocks()
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('C:/workspace')
    homedirSpy = vi.spyOn(os, 'homedir').mockReturnValue('C:/users/home')
})

afterEach(() => {
    cwdSpy.mockRestore()
    homedirSpy.mockRestore()
})

describe('loadTemplateCliConfig', () => {
    it('merges home and local configs giving preference to local values', async () => {
        const localPath = path.join('C:/workspace', '.ctrc')
        const homePath = path.join('C:/users/home', '.ctrc')
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.readJSON.mockResolvedValueOnce({
            GITHUB_TOKEN: 'local-token',
            CONTACT_EMAIL: '',
        })
        fsMock.readJSON.mockResolvedValueOnce({
            GITHUB_TOKEN: 'home-token',
            CONTACT_EMAIL: 'author@example.com',
            GITEE_USERNAME: 'author',
        })

        const config = await loadTemplateCliConfig()

        expect(fsMock.readJSON).toHaveBeenCalledWith(localPath)
        expect(fsMock.readJSON).toHaveBeenCalledWith(homePath)
        expect(config).toMatchObject({
            GITHUB_TOKEN: 'local-token',
            CONTACT_EMAIL: 'author@example.com',
            GITEE_USERNAME: 'author',
        })
    })

    it('falls back to home config when local config fails to load', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* empty */ })
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.readJSON.mockRejectedValueOnce(new Error('boom'))
        fsMock.pathExists.mockResolvedValueOnce(true)
        const homeConfig = { GITHUB_TOKEN: 'home-token' }
        fsMock.readJSON.mockResolvedValueOnce(homeConfig)

        const config = await loadTemplateCliConfig()

        expect(config).toEqual(homeConfig)
        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })

    it('returns an empty object when no config files exist', async () => {
        fsMock.pathExists.mockResolvedValue(false)

        const config = await loadTemplateCliConfig()

        expect(config).toEqual({})
        expect(fsMock.readJSON).not.toHaveBeenCalled()
    })
})
