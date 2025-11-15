import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'

type AxiosMock = ReturnType<typeof vi.fn> & {
    get: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    defaults: Record<string, unknown>
}

type SodiumMock = {
    from_base64: ReturnType<typeof vi.fn>
    from_string: ReturnType<typeof vi.fn>
    crypto_box_seal: ReturnType<typeof vi.fn>
    to_base64: ReturnType<typeof vi.fn>
    base64_variants: { ORIGINAL: string }
}

vi.mock('axios', () => {
    const axiosMock = vi.fn() as AxiosMock
    axiosMock.defaults = {}
    axiosMock.get = vi.fn()
    axiosMock.put = vi.fn()
    return { default: axiosMock }
})

vi.mock('libsodium-wrappers', () => ({
    default: {
        from_base64: vi.fn(),
        from_string: vi.fn(),
        crypto_box_seal: vi.fn(),
        to_base64: vi.fn(),
        base64_variants: {
            ORIGINAL: 'ORIGINAL',
        },
    } as SodiumMock,
}))

import axios from 'axios'
import sodium from 'libsodium-wrappers'
import {
    createGiteeRepo,
    createGithubRepo,
    replaceGithubRepositoryTopics,
    getAuthorWebsiteFromGithubAPI,
    getLtsNodeVersionByIndexJson,
    getLtsNodeVersionByHtml,
    getFastUrl,
    getARepositoryPublicKey,
    createOrUpdateARepositorySecret,
} from './api'
import { GITEE_API_URL, GITHUB_API_URL, NODE_INDEX_URL } from './constants'
import type { CreateOrUpdateARepositorySecretRequest, GiteeRepo, GithubRepo, GithubTopics } from '@/types/interfaces'

const axiosMock = axios as unknown as AxiosMock
const sodiumMock = sodium as unknown as SodiumMock
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

afterAll(() => {
    consoleErrorSpy.mockRestore()
})

beforeEach(() => {
    vi.clearAllMocks()
})

describe('Repository creation utilities', () => {
    it('creates a Gitee repository with URL encoded payloads', async () => {
        const response = { data: { id: 1 } }
        axiosMock.mockResolvedValueOnce(response as never)
        const payload: GiteeRepo = {
            access_token: 'token',
            name: 'demo',
            description: 'desc',
            private: false,
        }

        const result = await createGiteeRepo(payload)

        expect(result).toBe(response)
        expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: GITEE_API_URL,
            method: 'POST',
        }))
        const requestConfig = axiosMock.mock.calls[0]?.[0] as { data: string }
        expect(requestConfig.data).toContain('name=demo')
        expect(requestConfig.data).toContain('access_token=token')
    })

    it('returns null when Gitee creation fails', async () => {
        axiosMock.mockRejectedValueOnce(new Error('network'))
        const payload: GiteeRepo = {
            access_token: 'token',
            name: 'demo',
            description: 'desc',
            private: false,
        }

        const result = await createGiteeRepo(payload)

        expect(result).toBeNull()
        expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('creates a Github repository with bearer auth header', async () => {
        const response = { data: { id: 2 } }
        axiosMock.mockResolvedValueOnce(response as never)
        const payload: GithubRepo = {
            name: 'demo',
            description: 'desc',
            private: true,
        }

        const result = await createGithubRepo('auth-token', payload)

        expect(result).toBe(response)
        expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: GITHUB_API_URL,
            method: 'POST',
            headers: expect.objectContaining({
                Authorization: 'Bearer auth-token',
            }),
        }))
    })
})

describe('Repository metadata helpers', () => {
    it('replaces Github repository topics', async () => {
        const response = { data: { names: ['cli'] } }
        axiosMock.mockResolvedValueOnce(response as never)
        const payload: GithubTopics = {
            owner: 'owner',
            repo: 'repo',
            topics: ['cli'],
        }

        const result = await replaceGithubRepositoryTopics('token', payload)

        expect(result).toEqual(response.data)
        expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({
            url: '/repos/owner/repo/topics',
            method: 'PUT',
            headers: expect.objectContaining({
                Authorization: 'Bearer token',
            }),
        }))
    })
})

describe('Github profile utilities', () => {
    it('returns the author website when GitHub profile has a blog', async () => {
        axiosMock.get.mockResolvedValueOnce({ data: { blog: 'https://site' } } as never)

        const website = await getAuthorWebsiteFromGithubAPI('someone')

        expect(website).toBe('https://site')
        expect(axiosMock.get).toHaveBeenCalledWith(`${GITHUB_API_URL}/users/someone`)
    })

    it('returns empty string when the API call fails', async () => {
        axiosMock.get.mockRejectedValueOnce(new Error('missing'))

        const website = await getAuthorWebsiteFromGithubAPI('unknown')

        expect(website).toBe('')
        expect(consoleErrorSpy).toHaveBeenCalled()
    })
})

describe('Node version helpers', () => {
    it('reads the LTS version from the Node index', async () => {
        axiosMock.get.mockResolvedValueOnce({
            data: [
                { version: 'v21.0.0', lts: false },
                { version: 'v20.11.0', lts: true },
            ],
        } as never)

        const version = await getLtsNodeVersionByIndexJson()

        expect(version).toBe('20.11.0')
        expect(axiosMock.get).toHaveBeenCalledWith(NODE_INDEX_URL)
    })

    it('parses the LTS version from HTML content', async () => {
        axiosMock.get.mockResolvedValueOnce({ data: '<strong> v18.17.0 </strong>' } as never)

        const version = await getLtsNodeVersionByHtml('https://example.com')

        expect(version).toBe('v18.17.0')
        expect(axiosMock.get).toHaveBeenCalledWith('https://example.com')
    })
})

describe('getFastUrl', () => {
    it('returns the first reachable URL', async () => {
        axiosMock.mockRejectedValueOnce(new Error('timeout'))
        axiosMock.mockResolvedValueOnce({ config: { url: 'https://fast.example.com' } } as never)

        const url = await getFastUrl(['https://slow.example.com', 'https://fast.example.com'])

        expect(url).toBe('https://fast.example.com')
        expect(axiosMock).toHaveBeenCalledTimes(2)
    })
})

describe('GitHub secrets helpers', () => {
    it('fetches a repository public key', async () => {
        const response = { data: { key: 'base64', key_id: 'kid' } }
        axiosMock.get.mockResolvedValueOnce(response as never)

        const data = await getARepositoryPublicKey('token', { owner: 'me', repo: 'demo' })

        expect(data).toEqual(response.data)
        expect(axiosMock.get).toHaveBeenCalledWith(
            'https://api.github.com/repos/me/demo/actions/secrets/public-key',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'token token',
                }),
            }),
        )
    })

    it('encrypts and updates repository secrets', async () => {
        axiosMock.get.mockResolvedValueOnce({ data: { key: 'base64key', key_id: 'kid' } } as never)
        const encryptedBytes = new Uint8Array([1, 2, 3])
        sodiumMock.from_base64.mockReturnValueOnce(new Uint8Array([9, 9]))
        sodiumMock.from_string.mockReturnValueOnce(new Uint8Array([4, 5]))
        sodiumMock.crypto_box_seal.mockReturnValueOnce(encryptedBytes)
        sodiumMock.to_base64.mockReturnValueOnce('encrypted==')
        axiosMock.put.mockResolvedValueOnce({ data: { ok: true } } as never)

        const payload = {
            owner: 'me',
            repo: 'demo',
            secret_name: 'TOKEN',
            secret_value: 'plain',
        } as CreateOrUpdateARepositorySecretRequest

        const data = await createOrUpdateARepositorySecret('token', payload)

        expect(sodiumMock.from_base64).toHaveBeenCalledWith('base64key', sodiumMock.base64_variants.ORIGINAL)
        expect(sodiumMock.crypto_box_seal).toHaveBeenCalled()
        expect(axiosMock.put).toHaveBeenCalledWith(
            'https://api.github.com/repos/me/demo/actions/secrets/TOKEN',
            {
                owner: 'me',
                repo: 'demo',
                encrypted_value: 'encrypted==',
                key_id: 'kid',
            },
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'token token',
                }),
            }),
        )
        expect(data).toEqual({ ok: true })
    })
})
