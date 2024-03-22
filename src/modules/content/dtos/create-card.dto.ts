import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { tNumber } from '@/modules/core/helpers';

/**
 * 卡片文章数据验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateCardDto {
    @ApiProperty({ description: '卡片标题', maxLength: 100 })
    @MaxLength(100, {
        always: true,
        message: '卡片标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '卡片标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '卡片内容', maxLength: 500 })
    @MaxLength(500, {
        always: true,
        message: '卡片内容长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '卡片内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

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
