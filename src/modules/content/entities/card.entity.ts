import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Exclude()
@Entity('content_cards')
export class CardEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '卡片标题' })
    title!: string;

    @Expose()
    @Column({ comment: '卡片内容', type: 'longtext' })
    body!: string;

    @Expose()
    @Column({ comment: '卡片链接' })
    link!: string;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt!: Date;

    @Expose()
    @Type(() => PostEntity)
    @ManyToMany((type) => PostEntity, (post) => post.cards, {
        // 在新增文章时,如果所属分类不存在则直接创建
        cascade: true,
    })
    @JoinTable()
    posts!: PostEntity[];

    /**
     * @description 自定义文章排序
     * @type {number}
     */
    @Expose()
    @Column({ comment: '全局文章排序', default: 0 })
    customOrder!: number;
}
