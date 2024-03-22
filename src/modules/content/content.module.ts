import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';
import { MediaModule } from '../media/media.module';
import { RbacModule } from '../rbac/rbac.module';
import { UserModule } from '../user/user.module';

import * as DtoMaps from './dtos';
import * as EntityMaps from './entities';
import * as RepositoryMaps from './repositories';
import * as ServerMaps from './services';
import * as SubscriberMaps from './subscribers';

const entities = Object.values(EntityMaps);
const repositories = Object.values(RepositoryMaps);
const subscribers = Object.values(SubscriberMaps);
const dtos = Object.values(DtoMaps);
const services = Object.values(ServerMaps);
@ModuleBuilder((configure) => ({
    imports: [
        MediaModule,
        UserModule,
        RbacModule,
        addEntities(configure, entities),
        // 注册自定义Repository
        DatabaseModule.forRepository(repositories),
    ],
    providers: [...addSubscribers(configure, subscribers), ...dtos, ...services],
    exports: [
        // 导出自定义Repository,以供其它模块使用
        DatabaseModule.forRepository(repositories),
        ...services,
    ],
}))
export class ContentModule {}
