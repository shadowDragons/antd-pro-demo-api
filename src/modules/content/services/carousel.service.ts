import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { BaseService } from '@/modules/database/base';
import { MediaRepository } from '@/modules/media/repositories';

import { CreateCarouselDto } from '../dtos/create-carousel.dto';
import { UpdateCarouselDto } from '../dtos/update-carousel.dto';
import { CarouselEntity } from '../entities';
import { CarouselRepository } from '../repositories';

@Injectable()
export class CarouselService extends BaseService<CarouselEntity, CarouselRepository> {
    constructor(
        protected repository: CarouselRepository,
        protected mediaRepository: MediaRepository,
    ) {
        super(repository);
    }

    async list() {
        return this.repository.buildBaseQuery().take(6).getMany();
    }

    async create(data: CreateCarouselDto) {
        const createPostDto = {
            ...data,
            image: await this.mediaRepository.findOneByOrFail({ id: data.image }),
        };
        const item = await this.repository.save(createPostDto);
        return this.detail(item.id);
    }

    async update({ id, image, ...data }: UpdateCarouselDto) {
        const carousel = await this.detail(id);

        const oldImage = carousel.image;
        if ((!isNil(oldImage) && oldImage.id !== image) || isNil(oldImage)) {
            if (!isNil(oldImage)) await this.mediaRepository.remove(oldImage);
            const current = await this.mediaRepository.findOneByOrFail({ id: image });
            current.carousel = carousel;
            await this.mediaRepository.save(current);
        }
        await this.repository.update(id, data);
        return this.detail(id);
    }

    async delete(items: string[]) {
        const result = await super.delete(items, false);
        return result;
    }
}
