import { DataSource, EntityManager } from 'typeorm';

import { CarouselEntity, CategoryEntity, PostEntity } from '@/modules/content/entities';
import { CardRepository, CategoryRepository, PostRepository } from '@/modules/content/repositories';

import { getRandListData } from '@/modules/core/helpers';
import { BaseSeeder } from '@/modules/database/base';

import { DbFactory } from '@/modules/database/types';

import { CardEntity } from '../../modules/content/entities/card.entity';
import { CarouselRepository } from '../../modules/content/repositories/carousel.repository';
import { getCustomRepository } from '../../modules/database/helpers';
import { categories, CategoryData, CarouselData, carousels } from '../factories/content.data';
import { IPostFactoryOptions, ICardFactoryOptions } from '../factories/content.factory';
import { getCreator, saveFile } from '../factories/utils';

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, CategoryEntity];

    protected factorier!: DbFactory;

    protected categoryRepository: CategoryRepository;

    protected postRepository: PostRepository;

    protected cardRepository: CardRepository;

    protected carouselRepository: CarouselRepository;

    async run(_factorier: DbFactory, _dataSource: DataSource, _em: EntityManager) {
        this.categoryRepository = getCustomRepository(this.dataSource, CategoryRepository);
        this.postRepository = getCustomRepository(this.dataSource, PostRepository);
        this.cardRepository = getCustomRepository(this.dataSource, CardRepository);
        this.carouselRepository = getCustomRepository(this.dataSource, CarouselRepository);
        this.factorier = _factorier;
        if ((await this.categoryRepository.count()) < 1) await this.loadCategories(categories);
        if ((await this.postRepository.count()) < 1) await this.loadPosts();
        if ((await this.cardRepository.count()) < 1) await this.loadCards();
        if ((await this.carouselRepository.count()) < 1) await this.loadCarousels(carousels);
    }

    private async loadCategories(data: CategoryData[], parent?: CategoryEntity) {
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.name = item.name;
            category.customOrder = order;
            if (parent) category.parent = parent;
            await this.categoryRepository.save(category);
            order++;
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    private async loadPosts() {
        await this.factorier(PostEntity)<IPostFactoryOptions>({
            categories: getRandListData(await this.categoryRepository.find()),
        }).createMany(50);
    }

    private async loadCards() {
        await this.factorier(CardEntity)<ICardFactoryOptions>({
            posts: getRandListData(await this.postRepository.find()),
        }).createMany(50);
    }

    private async loadCarousels(data: CarouselData[]) {
        let order = 0;
        for (const item of data) {
            const carousel = new CarouselEntity();
            carousel.title = item.title;
            carousel.description = item.description;
            carousel.link = 'https://google.com';
            carousel.image = await saveFile(
                await getCreator(),
                item.image,
                'carousels',
                'carousels',
            );
            carousel.customOrder = order;
            await this.carouselRepository.save(carousel);
            order++;
        }
    }
}
