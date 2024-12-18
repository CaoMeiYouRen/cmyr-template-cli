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
