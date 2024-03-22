import { createQueueOptions } from '@/modules/core/helpers';
import { QueueConfigOptions, ConfigureFactory, RedisConfig } from '@/modules/core/types';

export const queue: ConfigureFactory<QueueConfigOptions> = {
    register: () => ({
        redis: 'default',
    }),
    hook: (configure, value) => createQueueOptions(value, configure.get<RedisConfig>('redis')),
};
