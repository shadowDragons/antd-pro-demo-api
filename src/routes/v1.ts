import * as contentControllers from '@/modules/content/controllers';
import * as contentManageControllers from '@/modules/content/controllers/manage';
import { MediaManageController } from '@/modules/media/controllers/media-manage.controller';
import { MediaController } from '@/modules/media/controllers/media.controller';
import { VersionOption } from '@/modules/restful/types';
import * as userControllers from '@/modules/user/controllers';

export const v1: VersionOption = {
    routes: [
        {
            name: 'app',
            path: '/',
            controllers: [],
            doc: {
                title: '应用接口',
                description: '前端APP应用接口',
                tags: [
                    { name: '文章查询', description: '用户对文章进行查询及搜索等操作' },
                    { name: '分类查询', description: '文章分类列表及详情查询' },
                    { name: '首页轮播查询', description: '查询首页排序前6个的轮播图' },
                    {
                        name: '文件操作',
                        description: '浏览及下载文件等',
                    },
                ],
            },
            children: [
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(contentControllers),
                },
                {
                    name: 'media',
                    path: '',
                    controllers: [MediaController],
                },
            ],
        },
        {
            name: 'manage',
            path: 'manage',
            controllers: [],
            doc: {
                title: '管理接口',
                description: '后台管理面板接口',
                tags: [
                    {
                        name: '账户操作',
                        description: '登录,登出,修改账户信息,绑定邮箱等',
                    },
                    { name: '分类管理', description: '内容模块-文章分类管理' },
                    { name: '文章管理', description: '内容模块-文章管理' },
                    { name: '卡片管理', description: '内容模块-文章管理' },
                    { name: '首页轮播管理', description: '内容模块-首页轮播管理' },
                    {
                        name: '文件管理',
                        description: '上传的动态文件管理',
                    },
                ],
            },
            children: [
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(contentManageControllers),
                },
                {
                    name: 'user',
                    path: '',
                    controllers: Object.values(userControllers),
                },
                {
                    name: 'media',
                    path: '',
                    controllers: [MediaManageController],
                },
            ],
        },
    ],
};
