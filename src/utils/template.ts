import { TEMPLATES_META_LIST } from '@/core/constants'
import { TemplateMeta } from '@/types/interfaces'

export function getTemplateMeta(templateName: string): TemplateMeta {
    const templateMeta = TEMPLATES_META_LIST.find((t) => t.name === templateName)
    if (!templateMeta) {
        throw new Error(`Unknown template: ${templateName}`)
    }
    return templateMeta
}
