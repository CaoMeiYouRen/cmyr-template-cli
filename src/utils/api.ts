import axios from 'axios'
import { GiteeRepo, GithubRepo, GithubTopics, NodeIndexJson } from '@/types/interfaces'
import { GITEE_API_URL, GITHUB_API_URL, NODE_INDEX_URL } from './constants'

axios.defaults.timeout = 15 * 1000

/**
 * 创建 Gitee 项目
 *
 * @author CaoMeiYouRen
 * @date 2022-09-14
 * @param data
 */
export async function createGiteeRepo(data: GiteeRepo) {
    try {
        const formData = new URLSearchParams()
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value))
        })
        return await axios({
            url: '/user/repos',
            baseURL: GITEE_API_URL,
            method: 'POST',
            data: formData.toString(),
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

/**
 * 创建 Github 项目
 *
 * @author CaoMeiYouRen
 * @date 2022-09-15
 * @param data
 */
export async function createGithubRepo(authToken: string, data: GithubRepo) {
    try {
        return await axios({
            url: '/user/repos',
            baseURL: GITHUB_API_URL,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/vnd.github+json',
            },
            data,
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

/**
 * 获取 Github 项目的 topics
 *
 * @author CaoMeiYouRen
 * @date 2025-01-18
 * @export
 * @param authToken
 * @param data
 */
export async function replaceGithubRepositoryTopics(authToken: string, data: GithubTopics) {
    try {
        const { owner, repo, topics } = data
        const resp = await axios({
            url: `/repos/${owner}/${repo}/topics`,
            baseURL: GITHUB_API_URL,
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/vnd.github+json',
            },
            data: {
                names: topics,
            },
        })
        return resp.data
    } catch (error) {
        console.error(error)
        return null
    }
}

/**
 * 根据 github name 获取作者网站
 */
export async function getAuthorWebsiteFromGithubAPI(githubUsername: string): Promise<string> {
    try {
        const userData = (await axios.get(`${GITHUB_API_URL}/users/${githubUsername}`)).data
        const authorWebsite = userData?.blog
        return authorWebsite || ''
    } catch (error) {
        console.error(error)
        return ''
    }
}

/**
 * 获取 Node.js LTS 版本
 *
 * @author CaoMeiYouRen
 * @date 2025-01-18
 * @export
 */
export async function getLtsNodeVersionByIndexJson() {
    const resp = await axios.get<NodeIndexJson>(NODE_INDEX_URL)
    return resp.data?.find((e) => e.lts)?.version?.replace('v', '')
}
/**
 * 获取 Node.js LTS 版本
 *
 * @author CaoMeiYouRen
 * @date 2025-01-18
 * @export
 */
export async function getLtsNodeVersionByHtml(url: string) {
    const html = (await axios.get(url)).data as string
    return html.match(/<strong>(.*)<\/strong>/)?.[1]?.trim()
}


/**
 * 获取响应速度最快的 URL
 *
 * @author CaoMeiYouRen
 * @date 2022-11-10
 * @param urls
 */
export async function getFastUrl(urls: string[]) {
    const fast = await Promise.any(urls.map((url) => axios({
        url,
        method: 'HEAD',
        timeout: 15 * 1000,
        headers: {
            'Accept-Encoding': '',
        },
    })))
    return fast?.config?.url
}
