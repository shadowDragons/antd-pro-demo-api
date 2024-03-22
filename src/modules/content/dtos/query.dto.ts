import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';

import { Transform } from 'class-transformer';

import { IsOptional, IsBoolean, IsEnum, IsUUID, MaxLength } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { tBoolean } from '@/modules/core/helpers';
import { IsModelExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { UserEntity } from '@/modules/user/entities';

import { PostOrderType } from '../constants';
import { CategoryEntity } from '../entities';

/**
 * 分页文章列表查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryPostDto extends OmitType(ListQueryDto, ['trashed']) {
    @ApiPropertyOptional({
        description: '搜索关键字:文章全文搜索字符串',
        maxLength: 100,
    })
    @MaxLength(100, {
        always: true,
        message: '搜索字符串长度不得超过$constraint1',
    })
    @IsOptional({ always: true })
    search?: string;

    @ApiPropertyOptional({
        description: '分类ID:过滤一个分类及其子孙分类下的文章',
    })
    @IsModelExist(CategoryEntity, {
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: '用户ID:根据文章作者过滤文章',
    })
    @IsModelExist(UserEntity, {
        message: '指定的用户不存在',
    })
    @IsUUID(undefined, { message: '用户ID格式错误' })
    @IsOptional()
    author?: string;

    @ApiPropertyOptional({
        description: '发布状态:根据是否发布过滤文章状态',
    })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: '排序规则:可指定文章列表的排序规则,默认为综合排序',
        enum: PostOrderType,
    })
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;
}

@DtoValidation({ type: 'query' })
export class QueryCategoryDto extends OmitType(ListQueryDto, ['trashed']) {}

@DtoValidation({ type: 'query' })
export class QueryCardDto extends OmitType(ListQueryDto, ['trashed']) {}

@DtoValidation({ type: 'query' })
export class QueryCarsouelDto extends OmitType(ListQueryDto, ['trashed']) {}
