import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCurdOption } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';

import { BaseController } from '@/modules/restful/base.controller';
import { Crud } from '@/modules/restful/decorators/crud.decorator';
import { Depends } from '@/modules/restful/decorators/depends.decorator';

import { ContentModule } from '../../content.module';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos';
import { CategoryService } from '../../services/category.service';

const permissions: PermissionChecker[] = [async (ab) => ab.can(PermissionAction.MANAGE, 'all')];
/**
 * 分类控制器
 */
@ApiTags('分类管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud({
    id: 'category',
    enabled: [
        {
            name: 'list',
            option: simpleCurdOption(permissions, '分类查询,以分页模式展示'),
        },
        { name: 'detail', option: simpleCurdOption(permissions, '分类详情') },
        { name: 'store', option: simpleCurdOption(permissions, '添加分类') },
        { name: 'update', option: simpleCurdOption(permissions, '修改分类信息') },
        { name: 'delete', option: simpleCurdOption(permissions, '删除分类,支持批量删除') },
    ],
    dtos: {
        store: CreateCategoryDto,
        update: UpdateCategoryDto,
    },
})
@Controller('categories')
export class CategoryManageController extends BaseController<CategoryService> {
    constructor(protected categoryService: CategoryService) {
        super(categoryService);
    }
}
