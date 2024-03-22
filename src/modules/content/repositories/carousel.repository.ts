import { BaseRepository } from '@/modules/database/base';
import { OrderType } from '@/modules/database/constants';
import { CustomRepository } from '@/modules/database/decorators';

import { CarouselEntity } from '../entities';

@CustomRepository(CarouselEntity)
export class CarouselRepository extends BaseRepository<CarouselEntity> {
    protected qbName = 'carousel';

    protected orderBy = { name: 'customOrder', order: OrderType.ASC };

    buildBaseQuery() {
        return this.createQueryBuilder(this.getQBName()).leftJoinAndSelect(
            `${this.qbName}.image`,
            'image',
        );
    }
}
