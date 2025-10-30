// 定义UnwrapPromise类型操作符
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

export interface Package {
    name: string
    version: string
    description: string
    author: string
    private: boolean
    license: string
    main: string
    bin?: Record<string, string>
    files: string[]
    scripts: Record<string, string>
    devDependencies: Record<string, string>
    dependencies: Record<string, string>
    engines: Record<string, string>
    homepage: string
    bugs: Record<string, string>
    config: Record<string, unknown>
    type: string
    [k: string]: unknown
}

export type IPackage = Partial<Package>

export interface InitAnswers {
    /**
     * 项目名称
     */
    name: string
    /**
     * 项目介绍
     */
    description: string
    /**
     * 作者
     */
    author: string
    /**
     * 开源协议
     */
    license: string
    /**
     * 关键词
     */
    keywords: string[]
    /**
     * 项目模板
     */
    template: string

    /**
     * 遵循的js模块规范，esm/cjs
     */
    jsModuleType: string
    /**
     * 是否开源
     */
    isOpenSource: boolean
    /**
     * 是否初始化远程 repo
     */
    isInitRemoteRepo: boolean
    /**
     * 远程 repo 地址
     */
    gitRemoteUrl: string

    /**
     * 是否发布到 npm
     */
    isPublishToNpm: boolean

    /**
     * 是否移除 github-dependabot，闭源的情况下默认移除
     */
    isRemoveDependabot: boolean
    /**
     * 是否初始化 README，仅开源的情况下初始化
     */
    isInitReadme: boolean
    /**
     * 是否初始化 贡献指南，仅开源的情况下初始化
     */
    isInitContributing: boolean
    /**
     * 是否初始化 husky
     */
    isInitHusky: boolean
    /**
     * 是否初始化 semantic-release
     */
    isInitSemanticRelease: boolean
    /**
     * 是否初始化测试
     */
    isInitTest: string
    /**
     * 是否启用赞助
     */
    isEnableSupport?: boolean
    /**
     * 是否启用 Star History
     */
    isEnableStarHistory: boolean

    /**
     * 是否移除 yarn
     */
    isRemoveYarn: boolean
    /**
     *初始化 Docker
    */
    isInitDocker: boolean
    /**
     * 需要安装的 常见依赖
    */
    commonDependencies: string[]

    /**
     * 是否为私域包？即使用自己的用户名
     */
    isPrivateScopePackage: boolean
    /**
     * 私域的名称，默认为 npm 用户名
     */
    scopeName: string

    [k: string]: unknown
}

export interface NodeIndexItem {
    version: string
    date: string
    files: string[]
    npm: string
    v8: string
    uv: string
    zlib: string
    openssl: string
    modules: string
    lts: boolean
    security: boolean
}

export type NodeIndexJson = NodeIndexItem[]

export type TemplateMeta = {
    /**
     * 模板名称
     */
    name: string
    /**
    * 主要开发语言
    */
    language: 'javascript' | 'typescript' | 'react' | 'vue' | 'java' | 'golang' | 'python'
    /**
     * 运行时
     */
    runtime: 'nodejs' | 'browser' | 'java' | 'golang' | 'python'
    /**
     * Vue 版本，非 Vue 项目为0
     */
    vueVersion?: 0 | 2 | 3

    /**
     * Java 版本，非 Java 项目为0
     */
    javaVersion?: 0 | 8 | 17
    /**
     * 是否支持使用 Docker
     */
    docker?: boolean
    /**
     * 是否支持发布到 npm
     */
    npm?: boolean
    /**
     * 优先级
     */
    priority?: number
    /**
     * 标签
     */
    tags?: string[]
}

export type TemplateCliConfig = {
    GITHUB_TOKEN: string
    GITEE_TOKEN: string
    GITHUB_USERNAME: string
    GITEE_USERNAME: string
    AFDIAN_USERNAME: string
    PATREON_USERNAME: string
    WEIBO_USERNAME: string
    TWITTER_USERNAME: string
    NPM_USERNAME: string
    DOCKER_USERNAME: string
    DOCKER_PASSWORD: string
    CONTACT_EMAIL: string
    /**
     * @deprecated 由于 npm 的安全机制修改，所以不再需要设置 NPM_TOKEN 了
     */
    NPM_TOKEN: string
}

export type GiteeRepo = {
    access_token: string
    name: string
    description: string
    private: boolean
}

export type GithubRepo = {
    name: string
    description: string
    private: boolean
}

export type GithubTopics = {
    owner: string
    repo: string
    topics: string[]
}

export type GetARepositoryPublicKeyRequest = {
    owner: string
    repo: string
}

export type CreateOrUpdateARepositorySecretRequest = {
    owner: string
    repo: string
    secret_name: string
    secret_value: string
}
