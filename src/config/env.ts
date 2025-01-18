const env = process.env
/**
 * 运行环境 development | production
 */
// export const NODE_ENV = env.NODE_ENV
/**
 * 是否为开发环境
 */
export const __DEV__ = env.NODE_ENV === 'development'

export const PACKAGE_MANAGER = 'pnpm'
