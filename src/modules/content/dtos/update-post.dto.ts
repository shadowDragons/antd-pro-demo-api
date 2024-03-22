import { ApiProperty, PartialType } from '@nestjs/swagger';

import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsModelExist } from '@/modules/database/constraints';

import { PostEntity } from '../entities/post.entity';

import { CreatePostDto } from './create-post.dto';

/**
 * 文章更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty({
        description: '待更新的文章ID',
    })
    @IsModelExist(PostEntity, {
        groups: ['update'],
        message: '指定的文章不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    id!: string;
}
