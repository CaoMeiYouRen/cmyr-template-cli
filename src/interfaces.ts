export interface Package {
    name: string
    version: string
    description: string
    author: string
    private: boolean
    license: string
    main: string
    bin: Record<string, string>
    files: string[]
    scripts: Record<string, string>
    devDependencies: Record<string, string>
    dependencies: Record<string, string>
    engines: Record<string, string>
    homepage: string
    bugs: Record<string, string>
    [k: string]: unknown
}

export type IPackage = Partial<Package>

export interface InitAnswers {
    name: string
    description: string
    author: string
    template: string
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
}
