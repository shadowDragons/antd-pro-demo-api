import { Injectable } from '@nestjs/common';

import { omit } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { CreateCardDto, UpdatePostDto } from '../dtos';
import { CardEntity } from '../entities';
import { CardRepository } from '../repositories';

/**
 * 卡片服务
 */
@Injectable()
export class CardService extends BaseService<CardEntity, CardRepository> {
    constructor(protected cardRepository: CardRepository) {
        super(cardRepository);
    }

    async create(data: CreateCardDto) {
        const item = await this.repository.save(data);
        return this.detail(item.id);
    }

    async update(data: UpdatePostDto) {
        await this.repository.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }

    async delete(items: string[]) {
        const result = await super.delete(items, false);
        return result;
    }
}
