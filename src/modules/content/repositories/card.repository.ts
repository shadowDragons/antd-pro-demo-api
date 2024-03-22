import { BaseRepository } from '@/modules/database/base';
import { OrderType } from '@/modules/database/constants';
import { CustomRepository } from '@/modules/database/decorators';

import { CardEntity } from '../entities';

@CustomRepository(CardEntity)
export class CardRepository extends BaseRepository<CardEntity> {
    protected qbName = 'card';

    protected orderBy = { name: 'customOrder', order: OrderType.ASC };

    buildBaseQuery() {
        return this.createQueryBuilder(this.getQBName())
            .leftJoinAndSelect(`${this.getQBName()}.posts`, 'posts')
            .loadRelationCountAndMap(`${this.getQBName()}.postCount`, `${this.getQBName()}.posts`);
    }
}
