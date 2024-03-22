import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { PostEntity } from '../entities';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected qbName = 'post';

    buildBaseQuery() {
        return this.createQueryBuilder(this.getQBName())
            .leftJoinAndSelect(`${this.getQBName()}.categories`, 'categories')
            .leftJoinAndSelect(`${this.getQBName()}.cards`, 'cards')
            .leftJoinAndSelect(`${this.getQBName()}.author`, 'author')
            .leftJoinAndSelect(`${this.qbName}.thumb`, 'thumb')
            .leftJoinAndSelect(`${this.qbName}.background`, 'background');
    }
}
