import path from 'path';

import { AcceptLanguageResolver, I18nModule as NestI18nModule, QueryResolver } from 'nestjs-i18n';

import { ModuleBuilder } from '../core/decorators';

@ModuleBuilder((configure) => {
    return {
        global: true,
        imports: [
            NestI18nModule.forRoot({
                fallbackLanguage: 'zh',
                loaderOptions: {
                    path: path.join(__dirname, '..', '..', 'i18n'),
                    watch: true,
                },
                resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
            }),
        ],
        providers: [],
        exports: [],
    };
})
export class I18nModule {}
