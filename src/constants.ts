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
}

export const TEMPLATES_META_LIST: TemplateMeta[] = [
    {
        name: 'vite4-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'vite3-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'vite2-vue2-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
    },
    {
        name: 'vite2-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'electron-vite-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'electron-vue-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'nuxt-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
    },
    {
        name: 'uni-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
    },
    {
        name: 'uni-vite2-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'react-vite-template',
        language: 'react',
        runtime: 'browser',
        vueVersion: 0,
        docker: false,
        priority: 0,
    },
    {
        name: 'react-template',
        language: 'react',
        runtime: 'browser',
        vueVersion: 0,
        docker: false,
        priority: 0,
    },
    {
        name: 'react16-template',
        language: 'react',
        runtime: 'browser',
        vueVersion: 0,
        docker: false,
        priority: 0,
    },
    {
        name: 'ts-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        npm: true,
        priority: 0,
    },
    {
        name: 'express-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        priority: 0,
    },
    {
        name: 'koa2-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        priority: 0,
    },
    {
        name: 'nest-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        priority: 0,
    },
    {
        name: 'auto-release-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: false,
        npm: true,
        priority: 0,
    },
    {
        name: 'rollup-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: false,
        npm: true,
        priority: 0,
    },
    {
        name: 'webpack-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: false,
        npm: true,
        priority: 0,
    },
    {
        name: 'github-action-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: false,
        priority: 0,
    },
    {
        name: 'vue-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
    },
    {
        name: 'vue3-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
    },
    {
        name: 'python-flask-template',
        language: 'python',
        runtime: 'python',
        vueVersion: 0,
        docker: true,
        priority: 0,
    },
    {
        name: 'go-gin-template',
        language: 'golang',
        runtime: 'golang',
        vueVersion: 0,
        docker: true,
        priority: 0,
    },
    {
        name: 'spring-boot-template',
        language: 'java',
        runtime: 'java',
        vueVersion: 0,
        javaVersion: 8,
        docker: true,
        priority: 0,
    },
    {
        name: 'spring-boot-v3-template',
        language: 'java',
        runtime: 'java',
        vueVersion: 0,
        javaVersion: 17,
        docker: true,
        priority: 0,
    },
]
