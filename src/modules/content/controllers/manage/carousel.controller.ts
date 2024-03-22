import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClassToPlain } from '@/modules/core/types';
import { UploadFileDto } from '@/modules/media/dtos';
import { MediaModule } from '@/modules/media/media.module';

import { MediaService } from '@/modules/media/services';
import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCurdOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseController } from '@/modules/restful/base.controller';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../../content.module';
import { CreateCarouselDto, QueryCarsouelDto, UpdateCarouselDto } from '../../dtos';
import { CarouselService } from '../../services';

const permissions: PermissionChecker[] = [async (ab) => ab.can(PermissionAction.MANAGE, 'all')];

@ApiTags('首页轮播管理')
@ApiBearerAuth()
@Depends(ContentModule, MediaModule)
@Crud({
    id: 'carousel',
    enabled: [
        { name: 'list', option: simpleCurdOption(permissions, '轮播图查询,以分页模式展示') },
        { name: 'detail', option: simpleCurdOption(permissions, '轮播图详情') },
        { name: 'store', option: simpleCurdOption(permissions, '添加轮播图') },
        { name: 'update', option: simpleCurdOption(permissions, '修改轮播图') },
        { name: 'delete', option: simpleCurdOption(permissions, '删除轮播图,支持批量删除') },
    ],
    dtos: {
        list: QueryCarsouelDto,
        store: CreateCarouselDto,
        update: UpdateCarouselDto,
    },
})
@Controller('carousels')
export class CarouselManageController extends BaseController<CarouselService> {
    constructor(protected service: CarouselService, protected mediaService: MediaService) {
        super(service);
    }

    @Post('image')
    @ApiOperation({ summary: '上传轮播图' })
    @ApiConsumes('multipart/form-data')
    async uploadThumb(@Body() data: UploadFileDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.mediaService.upload({
            file: data.image,
            user,
            dir: 'carousels',
        });
    }
}
