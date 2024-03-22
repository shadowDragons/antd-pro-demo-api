import { ModuleBuilder } from '../core/decorators';

import { RestfulFactory } from './factory';

@ModuleBuilder((configure) => {
    const restful = new RestfulFactory();
    restful.create(configure.get('api'));
    return {
        global: true,
        imports: restful.getModuleImports(),
        providers: [
            {
                provide: RestfulFactory,
                useValue: restful,
            },
        ],
        exports: [RestfulFactory],
    };
})
export class RestfulModule {}
