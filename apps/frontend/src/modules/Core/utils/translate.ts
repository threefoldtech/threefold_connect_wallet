import { createI18n } from 'vue-i18n';
import translates from '@/translates';

export const i18n = createI18n({
    locale: 'en',
    silentTranslationWarn: true,
    silentFallbackWarn: true,
    messages: <any>translates,
});

export const translate = (translatePath: string, data?: Record<string, any>) => {
    return i18n.global.t(translatePath, data as any);
};
