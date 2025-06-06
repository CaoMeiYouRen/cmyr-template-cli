import { TemplateMeta } from '@/types/interfaces'

export const TEMPLATES_META_LIST: TemplateMeta[] = [
    {
        name: 'vite-latest-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
        tags: ['vite'],
    },
    // {
    //     name: 'vite3-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 3,
    //     docker: false,
    //     priority: 0,
    // },
    {
        name: 'vite2-vue2-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
        tags: ['vite'],
    },
    // {
    //     name: 'vite2-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 3,
    //     docker: false,
    //     priority: 0,
    // },
    // {
    //     name: 'vue-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 2,
    //     docker: false,
    //     priority: 0,
    // },
    // {
    //     name: 'vue3-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 3,
    //     docker: false,
    //     priority: 0,
    // },
    {
        name: 'tauri-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
        tags: ['tauri', 'vite'],
    },
    {
        name: 'electron-vite-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
        tags: ['electron', 'vite'],
    },
    // {
    //     name: 'electron-vue-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 3,
    //     docker: false,
    //     priority: 0,
    // },
    {
        name: 'nuxt-latest-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
        tags: ['nuxt'],
    },
    // {
    //     name: 'nuxt-template',
    //     language: 'vue',
    //     runtime: 'browser',
    //     vueVersion: 2,
    //     docker: false,
    //     priority: 0,
    //     tags: ['nuxt'],
    // },
    {
        name: 'uni-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 2,
        docker: false,
        priority: 0,
        tags: ['uni-app'],
    },
    {
        name: 'uni-vite2-template',
        language: 'vue',
        runtime: 'browser',
        vueVersion: 3,
        docker: false,
        priority: 0,
        tags: ['uni-app'],
    },
    {
        name: 'react-vite-template',
        language: 'react',
        runtime: 'browser',
        vueVersion: 0,
        docker: false,
        priority: 0,
        tags: ['vite'],
    },
    {
        name: 'react-template',
        language: 'react',
        runtime: 'browser',
        vueVersion: 0,
        docker: false,
        priority: 0,
    },
    // {
    //     name: 'react16-template',
    //     language: 'react',
    //     runtime: 'browser',
    //     vueVersion: 0,
    //     docker: false,
    //     priority: 0,
    // },
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
        tags: ['express'],
    },
    // {
    //     name: 'koa2-template',
    //     language: 'typescript',
    //     runtime: 'nodejs',
    //     vueVersion: 0,
    //     docker: true,
    //     priority: 0,
    // },
    {
        name: 'nest-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        priority: 0,
        tags: ['nestjs'],
    },
    {
        name: 'hono-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: true,
        priority: 0,
        tags: ['hono', 'vercel', 'cloudflare-workers'],
    },
    // {
    //     name: 'auto-release-template',
    //     language: 'typescript',
    //     runtime: 'nodejs',
    //     vueVersion: 0,
    //     docker: false,
    //     npm: true,
    //     priority: 0,
    // },
    {
        name: 'tsup-template',
        language: 'typescript',
        runtime: 'nodejs',
        vueVersion: 0,
        docker: false,
        npm: true,
        priority: 0,
    },
      {
        name: 'tsdown-template',
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
        tags: ['github-action'],
    },
    {
        name: 'python-flask-template',
        language: 'python',
        runtime: 'python',
        vueVersion: 0,
        docker: true,
        priority: 0,
        tags: ['flask'],
    },
    {
        name: 'go-gin-template',
        language: 'golang',
        runtime: 'golang',
        vueVersion: 0,
        docker: true,
        priority: 0,
        tags: ['gin'],
    },
    {
        name: 'spring-boot-template',
        language: 'java',
        runtime: 'java',
        vueVersion: 0,
        javaVersion: 8,
        docker: true,
        priority: 0,
        tags: ['spring-boot'],
    },
    {
        name: 'spring-boot-v3-template',
        language: 'java',
        runtime: 'java',
        vueVersion: 0,
        javaVersion: 17,
        docker: true,
        priority: 0,
        tags: ['spring-boot-v3'],
    },
]
