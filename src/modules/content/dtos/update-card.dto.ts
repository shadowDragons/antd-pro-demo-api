import { ApiProperty, PartialType } from '@nestjs/swagger';

import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsModelExist } from '@/modules/database/constraints';

import { CardEntity } from '../entities';

import { CreateCardDto } from './create-card.dto';

@DtoValidation({ groups: ['update'] })
export class UpdateCardDto extends PartialType(CreateCardDto) {
    @ApiProperty({
        description: '待更新的卡片ID',
    })
    @IsModelExist(CardEntity, {
        groups: ['update'],
        message: '指定的卡片不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: 'ID格式错误' })
    @IsDefined({ groups: ['update'], message: 'ID必须指定' })
    id!: string;
}
