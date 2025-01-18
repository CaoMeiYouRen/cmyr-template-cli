import { TEMPLATES_META_LIST } from '@/core/constants'
import { TemplateMeta } from '@/types/interfaces'

export function getTemplateMeta(templateName: string): TemplateMeta | undefined {
    return TEMPLATES_META_LIST.find((t) => t.name === templateName)
}
