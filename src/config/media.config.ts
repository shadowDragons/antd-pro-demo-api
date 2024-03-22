import { JoinColumn, OneToOne } from 'typeorm';

import { PostEntity } from '@/modules/content/entities';
import { ConfigureFactory } from '@/modules/core/types';
import { defaultMediaConfig } from '@/modules/media/helpers';
import { MediaConfig } from '@/modules/media/types';

import { CarouselEntity } from '../modules/content/entities/carousel.entity';

export const media: ConfigureFactory<MediaConfig> = {
    register: () => ({
        relations: [
            {
                column: 'carousel',
                relation: OneToOne(
                    () => CarouselEntity,
                    (carousel) => carousel.image,
                    { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: true },
                ),
                others: [JoinColumn()],
            },
            {
                column: 'thumb',
                relation: OneToOne(
                    () => PostEntity,
                    (post) => post.thumb,
                    { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: true },
                ),
                others: [JoinColumn()],
            },
            {
                column: 'background',
                relation: OneToOne(
                    () => PostEntity,
                    (post) => post.background,
                    { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: true },
                ),
                others: [JoinColumn()],
            },
        ],
    }),
    defaultRegister: defaultMediaConfig,
};
