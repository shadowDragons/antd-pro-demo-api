import { OneToMany } from 'typeorm';

import { PostEntity } from '@/modules/content/entities';
import { EnvironmentType } from '@/modules/core/constants';
import { ConfigureFactory } from '@/modules/core/types';
import { defaultUserConfig } from '@/modules/user/helpers';
import { UserConfig } from '@/modules/user/types';

/**
 * 用户模块配置
 */
export const user: ConfigureFactory<UserConfig> = {
    register: (configure) => {
        const expiredTime =
            configure.getRunEnv() === EnvironmentType.DEVELOPMENT ? 3600 * 10000 : 3600;
        return {
            super: {
                username: configure.env('SUPER_ADMIN_USERNAME', 'admin'),
                password: configure.env('SUPER_ADMIN_PASSWORD', '123456aA$'),
            },
            hash: 10,
            jwt: {
                secret: 'my-secret',
                token_expired: expiredTime,
                refresh_secret: 'my-refresh-secret',
                refresh_token_expired: expiredTime * 30,
            },
            relations: [
                {
                    column: 'posts',
                    relation: OneToMany(
                        () => PostEntity,
                        (post) => post.author,
                        {
                            cascade: true,
                        },
                    ),
                },
            ],
        };
    },
    defaultRegister: defaultUserConfig as any,
};
