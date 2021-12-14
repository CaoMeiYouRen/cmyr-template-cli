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
     * 是否移除 github-dependabot，闭源的情况下默认移除
     */
    isRemoveDependabot: boolean
}
