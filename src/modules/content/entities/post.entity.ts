import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { MediaEntity } from '@/modules/media/entities';
import { UserEntity } from '@/modules/user/entities';

import { CardEntity } from './card.entity';
import { CategoryEntity } from './category.entity';

/**
 * @description 文章模型
 * @export
 * @class PostEntity
 * @extends {BaseEntity}
 */
@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    /**
     * 文章ID
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 文章标题
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章标题' })
    title!: string;

    /**
     * 文章内容
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'longtext' })
    body!: string;

    /**
     * 文章描述
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    /**
     * 文章标题_英文
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章标题_英文', nullable: true })
    title_en?: string;

    /**
     * 文章内容_英文
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容_英文', type: 'longtext', nullable: true })
    body_en?: string;

    /**
     * 文章描述_英文
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章描述_英文', nullable: true })
    summary_en?: string;

    /**
     * 关键字
     *
     * @type {string[]}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({ comment: '文章标签', type: 'simple-array', nullable: true })
    tags?: string[];

    /**
     * 创建时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;

    /**
     * 更新时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt!: Date;

    /**
     * @description 与分类多对多关联
     * @type {CategoryEntity[]}
     */
    @Expose()
    @Type(() => CategoryEntity)
    @ManyToMany((type) => CategoryEntity, (category) => category.posts, {
        // 在新增文章时,如果所属分类不存在则直接创建
        cascade: true,
    })
    @JoinTable()
    categories!: CategoryEntity[];

    @Expose()
    @ManyToMany((type) => CardEntity, (card) => card.posts)
    cards!: CardEntity[];

    /**
     * @description 发布时间
     * @type {(Date | null)}
     */
    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    /**
     * @description 自定义文章排序
     * @type {number}
     */
    @Expose()
    @Column({ comment: '全局文章排序', default: 0 })
    customOrder!: number;

    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.posts, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    author!: UserEntity;

    @Expose()
    @OneToOne(() => MediaEntity, (image) => image.deal, { nullable: true, cascade: true })
    @JoinColumn()
    thumb: MediaEntity;

    @Expose()
    @OneToOne(() => MediaEntity, (background) => background.deal, { nullable: true, cascade: true })
    @JoinColumn()
    background: MediaEntity;
}
