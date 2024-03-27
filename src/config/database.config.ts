import { CardFactory, PostFactory } from '@/database/factories/content.factory';
import { UserFactory } from '@/database/factories/user.factory';
import ContentSeeder from '@/database/seeders/content.seeder';
import UserSeeder from '@/database/seeders/user.seeder';
import { ConfigureFactory } from '@/modules/core/types';
import { createDbOptions } from '@/modules/database/helpers';
import { DbConfigOptions, DbConfig } from '@/modules/database/types';

/**
 * 数据库配置函数
 */
export const database: ConfigureFactory<DbConfigOptions, DbConfig> = {
    register: (configure) => ({
        common: {
            charset: 'utf8mb4',
            synchronize: false,
            logging: ['error'],
        },
        connections: [
            {
                type: 'mysql',
                host: configure.env('DB_HOST', '10.0.3.119'),
                port: 3306,
                username: configure.env('DB_USERNAME', 'admin'),
                password: configure.env('DB_PASSWORD', 'admin#4399'),
                database: configure.env('DB_NAME', 'test2'),
                // entities: [],
                // 自动加载模块中注册的entity
                // autoLoadEntities: true,
                // 可以在webpack热更新时保持连接,目前用不到
                // keepConnectionAlive: true,
                // 可以在开发环境下同步entity的数据结构到数据库
                // synchronize: false,
                seeders: [UserSeeder, ContentSeeder],
                factories: [UserFactory, PostFactory, CardFactory],
            },
        ],
    }),
    hook: (configure, value) => createDbOptions(value),
};
