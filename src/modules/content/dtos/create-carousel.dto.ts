import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, MaxLength, Min } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { tNumber } from '@/modules/core/helpers';
import { IsModelExist } from '@/modules/database/constraints';
import { MediaEntity } from '@/modules/media/entities';

/**
 * 卡片文章数据验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateCarouselDto {
    @ApiProperty({ description: '录播图标题', maxLength: 100 })
    @MaxLength(100, {
        always: true,
        message: '标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '录播图描述', maxLength: 500 })
    @MaxLength(500, {
        always: true,
        message: '描述长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '描述必须填写' })
    @IsOptional({ groups: ['update'] })
    description!: string;

    @ApiProperty({
        description: '图片ID',
    })
    @IsModelExist(MediaEntity, { always: true, message: '图片不存在' })
    @IsUUID(undefined, { message: 'uuid format is error' })
    @IsNotEmpty({ groups: ['create'], message: 'image cannot be empty' })
    @IsOptional({ groups: ['update'] })
    image!: string;

    @ApiPropertyOptional({
        description: '自定义排序',
        type: Number,
        minimum: 0,
        default: 0,
    })
    @Transform(({ value }) => tNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}
