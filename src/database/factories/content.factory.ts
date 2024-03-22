import { Faker } from '@faker-js/faker';

import { CardEntity, CategoryEntity, PostEntity } from '@/modules/content/entities';
import { getRandomIndex, getTime } from '@/modules/core/helpers';
import { defineFactory } from '@/modules/database/helpers';

import { getCreator, saveFile } from './utils';

export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    tags?: string[];
    categories: CategoryEntity[];
}>;

export type ICardFactoryOptions = Partial<{
    title: string;
    body: string;
    posts: PostEntity[];
}>;

export const PostFactory = defineFactory(
    PostEntity,
    async (faker: Faker, options: IPostFactoryOptions) => {
        faker.setLocale('zh_CN');
        const post = new PostEntity();
        const { title, summary, body, categories, tags } = options;
        post.title = title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 6);
        if (summary) post.summary = options.summary;
        post.body = body ?? faker.lorem.paragraph(Math.floor(Math.random() * 500) + 1);
        post.publishedAt = getTime().toDate();
        if (categories) post.categories = categories;
        if (tags) {
            post.tags = tags;
        } else {
            post.tags = [];
            for (let i = 0; i < getRandomIndex(5); i++) {
                post.tags.push(faker.lorem.word());
            }
        }
        post.author = await getCreator();
        post.thumb = await saveFile(
            post.author,
            `${getRandomIndex(12).toString()}.png`,
            'thumbs',
            'thumbs',
        );
        post.background = await saveFile(
            post.author,
            `${getRandomIndex(3).toString()}.png`,
            'backgrounds',
            'backgrounds',
        );
        return post;
    },
);

export const CardFactory = defineFactory(
    CardEntity,
    async (faker: Faker, options: ICardFactoryOptions) => {
        faker.setLocale('zh_CN');
        const item = new CardEntity();
        const { title, body, posts } = options;
        item.title = title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 2);
        item.body = body ?? faker.lorem.paragraph(Math.floor(Math.random() * 50) + 1);
        if (posts) item.posts = posts;
        item.link = 'https://google.com';
        return item;
    },
);
