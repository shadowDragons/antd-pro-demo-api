import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { isNil } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { tNumber } from '@/modules/core/helpers';
import { IsModelExist } from '@/modules/database/constraints';
import { MediaEntity } from '@/modules/media/entities';
import { UserEntity } from '@/modules/user/entities';

import { CardEntity, CategoryEntity } from '../entities';
/**
 * 创建文章数据验证
 */
@DtoValidation({ groups: ['create'] })
export class CreatePostDto {
    @ApiProperty({ description: '文章标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '文章内容' })
    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    @ApiPropertyOptional({ description: '文章描述', maxLength: 500 })
    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    // @ApiProperty({ description: '文章标题_英文', maxLength: 255 })
    // @MaxLength(255, {
    //     always: true,
    //     message: '文章标题_英文长度最大为$constraint1',
    // })
    // @IsOptional({ always: true })
    // title_en?: string;

    // @ApiProperty({ description: '文章内容_英文' })
    // @IsOptional({ always: true })
    // body_en?: string;

    // @ApiPropertyOptional({ description: '文章描述_英文', maxLength: 500 })
    // @MaxLength(500, {
    //     always: true,
    //     message: '文章描述_英文长度最大为$constraint1',
    // })
    // @IsOptional({ always: true })
    // summary_en?: string;

    @ApiPropertyOptional({
        description: '发布时间:通过设置文章的发布时间来发布文章',
        type: Date,
    })
    @IsDateString({ strict: true }, { always: true })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    @ApiPropertyOptional({
        description: '关键字:用于SEO',
        type: [String],
        maxLength: 20,
    })
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @ApiPropertyOptional({
        description: '文章标签: 小标题',
        type: [String],
        maxLength: 20,
    })
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: '关联分类ID列表:一篇文章可以关联多个分类',
        type: [String],
    })
    @IsModelExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '分类ID格式不正确',
    })
    @IsOptional({ always: true })
    categories?: string[];

    @ApiPropertyOptional({
        description: '关联卡片ID列表:一篇文章可以关联多个卡片',
        type: [String],
    })
    @IsModelExist(CardEntity, {
        each: true,
        always: true,
        message: '卡片不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '卡片ID格式不正确',
    })
    @IsOptional({ always: true })
    cards?: string[];

    @ApiPropertyOptional({
        description:
            '文章作者ID:可用于在管理员发布文章时分配给其它用户,如果不设置,则作者为当前管理员',
        type: String,
    })
    @IsModelExist(UserEntity, {
        always: true,
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    @IsOptional({ always: true })
    author?: string;

    @ApiProperty({
        description: '文章封面图ID',
    })
    @IsModelExist(MediaEntity, { always: true, message: '图片不存在' })
    @IsUUID(undefined, { message: 'uuid format is error' })
    @IsNotEmpty({ groups: ['create'], message: 'image cannot be empty' })
    @IsOptional({ groups: ['update'] })
    thumb!: string;

    @ApiProperty({
        description: '文章b背景图ID',
    })
    @IsModelExist(MediaEntity, { always: true, message: '图片不存在' })
    @IsUUID(undefined, { message: 'uuid format is error' })
    @IsNotEmpty({ groups: ['create'], message: 'image cannot be empty' })
    @IsOptional({ groups: ['update'] })
    background!: string;

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
