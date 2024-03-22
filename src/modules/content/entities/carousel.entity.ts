import { Exclude, Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MediaEntity } from '@/modules/media/entities';

@Exclude()
@Entity('content_carousels')
export class CarouselEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '图片标题' })
    title!: string;

    @Expose()
    @Column({ comment: '图片内容', type: 'longtext' })
    description!: string;

    @Expose()
    @OneToOne(() => MediaEntity, (image) => image.carousel, { cascade: true })
    image: MediaEntity;

    @Expose()
    @Column({ comment: '图片链接' })
    link!: string;

    @Expose()
    @Column({ comment: '图片排序', default: 0 })
    customOrder!: number;
}
