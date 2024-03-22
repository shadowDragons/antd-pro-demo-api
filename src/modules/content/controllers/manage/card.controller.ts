import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';

import { simpleCurdOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';

import { BaseController } from '@/modules/restful/base.controller';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ContentModule } from '../../content.module';
import { QueryCardDto, UpdateCardDto } from '../../dtos';
import { CreateCardDto } from '../../dtos/create-card.dto';
import { CardService } from '../../services';

const permissions: PermissionChecker[] = [async (ab) => ab.can(PermissionAction.MANAGE, 'all')];

@ApiTags('卡片管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud({
    id: 'card',
    enabled: [
        { name: 'list', option: simpleCurdOption(permissions, '卡片查询,以分页模式展示') },
        { name: 'detail', option: simpleCurdOption(permissions, '卡片详情') },
        { name: 'store', option: simpleCurdOption(permissions, '添加卡片') },
        { name: 'update', option: simpleCurdOption(permissions, '修改卡片') },
        { name: 'delete', option: simpleCurdOption(permissions, '删除卡片,支持批量删除') },
    ],
    dtos: {
        list: QueryCardDto,
        store: CreateCardDto,
        update: UpdateCardDto,
    },
})
@Controller('cards')
export class CardManageController extends BaseController<CardService> {
    constructor(protected service: CardService) {
        super(service);
    }
}
