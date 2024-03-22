import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { ClassToPlain } from '@/modules/core/types';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';
import { MediaRepository } from '@/modules/media/repositories';
import { UserEntity } from '@/modules/user/entities';
import { UserService } from '@/modules/user/services';

import { PostOrderType } from '../constants';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostEntity } from '../entities/post.entity';
import { CardRepository } from '../repositories';
import { CategoryRepository } from '../repositories/category.repository';
import { PostRepository } from '../repositories/post.repository';

import { CategoryService } from './category.service';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

/**
 * 文章服务
 *
 * @export
 * @class PostService
 */
@Injectable()
export class PostService extends BaseService<PostEntity, PostRepository, FindParams> {
    constructor(
        protected mediaRepository: MediaRepository,
        protected postRepository: PostRepository,
        protected categoryRepository: CategoryRepository,
        protected cardRepository: CardRepository,
        protected categoryService: CategoryService,
        protected userService: UserService,
    ) {
        super(postRepository);
    }

    /**
     * @description 添加文章
     * @param {CreatePostDto} data
     */
    async create({ author, ...data }: CreatePostDto) {
        const createPostDto = {
            ...data,
            author: await this.userService.getCurrentUser({
                id: author,
            } as ClassToPlain<UserEntity>),
            // 文章所属分类
            categories: data.categories
                ? await this.categoryRepository.findBy({
                      id: In(data.categories),
                  })
                : [],
            cards: data.cards
                ? await this.cardRepository.findBy({
                      id: In(data.cards),
                  })
                : [],
            thumb: await this.mediaRepository.findOneByOrFail({ id: data.thumb }),
            background: await this.mediaRepository.findOneByOrFail({ id: data.background }),
        };
        const item = await this.repository.save(createPostDto);
        return this.detail(item.id);
    }

    /**
     * 更新文章
     * @param data
     */
    async update({ id, thumb, background, categories, cards, author, ...data }: UpdatePostDto) {
        const post = await this.detail(id);
        if (categories) {
            // 更新文章所属分类
            await this.repository
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(categories, post.categories ?? []);
        }
        if (cards) {
            // 更新文章所属分类
            await this.repository
                .createQueryBuilder('post')
                .relation(PostEntity, 'cards')
                .of(post)
                .addAndRemove(cards, post.cards ?? []);
        }
        const oldThumb = post.thumb;
        const oldBg = post.background;
        if ((!isNil(oldThumb) && oldThumb.id !== thumb) || isNil(oldThumb)) {
            if (!isNil(oldThumb)) await this.mediaRepository.remove(oldThumb);
            const image = await this.mediaRepository.findOneByOrFail({ id: thumb });
            image.thumb = post;
            await this.mediaRepository.save(image);
        }
        if ((!isNil(oldBg) && oldBg.id !== background) || isNil(oldBg)) {
            if (!isNil(oldBg)) await this.mediaRepository.remove(oldBg);
            const image = await this.mediaRepository.findOneByOrFail({ id: background });
            image.background = post;
            await this.mediaRepository.save(image);
        }
        await this.repository.update(id, data);
        return this.detail(id);
    }

    async delete(items: string[]) {
        const result = await super.delete(items, false);
        return result;
    }

    protected async buildListQuery(
        queryBuilder: SelectQueryBuilder<PostEntity>,
        options: FindParams,
        callback?: QueryHook<PostEntity>,
    ) {
        const { search, category, orderBy, isPublished, author } = options;
        let qb = queryBuilder;
        if (typeof isPublished === 'boolean') {
            qb = isPublished
                ? qb.where({
                      publishedAt: Not(IsNull()),
                  })
                : qb.where({
                      publishedAt: IsNull(),
                  });
        }
        if (!isNil(author)) {
            qb.where({
                'author.id': author,
            });
        }

        if (!isNil(search)) {
            qb.andWhere('MATCH(title) AGAINST (:search IN BOOLEAN MODE)', { search }).orWhere(
                'MATCH(body) AGAINST (:search IN BOOLEAN MODE)',
                { search },
            );
        }

        this.queryOrderBy(qb, orderBy);
        if (callback) {
            qb = await callback(qb);
        }
        if (category) {
            qb = await this.queryByCategory(category, qb);
        }
        return super.buildListQuery(qb, options);
    }

    /**
     * 对文章进行排序的Query构建
     * @param query
     * @param orderBy
     */
    protected queryOrderBy(query: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return query.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return query.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return query.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.CUSTOM:
                return query.orderBy('customOrder', 'DESC');
            default:
                return query
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有文章的Query构建
     * @param id
     * @param query
     */
    protected async queryByCategory(id: string, query: SelectQueryBuilder<PostEntity>) {
        const root = await this.categoryService.detail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return query.where('categories.id IN (:...ids)', {
            ids,
        });
    }
}
