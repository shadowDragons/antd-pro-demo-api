import { createConnectionOptions } from '@/modules/core/helpers';
import { ConfigureFactory, RedisConfig, RedisConfigOptions } from '@/modules/core/types';

export const redis: ConfigureFactory<RedisConfigOptions, RedisConfig> = {
    register: () => ({
        host: '127.0.0.1',
        port: 6379,
    }),
    hook: (configure, value) => createConnectionOptions(value),
};
