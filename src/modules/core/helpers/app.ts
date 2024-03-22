import { Global, Module, ModuleMetadata, Type } from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import chalk from 'chalk';
import { isArray, isNil, isObject, omit } from 'lodash';
import yargs, { CommandModule } from 'yargs';

import { DatabaseModule } from '@/modules/database/database.module';
import { RestfulModule } from '@/modules/restful/restful.module';
import { ApiConfig } from '@/modules/restful/types';

import { App } from '../app';
import { Configure } from '../configure';
import { MODULE_BUILDER_REGISTER } from '../constants';
import { CoreModule } from '../core.module';
import { AppFilter, AppIntercepter, AppPipe } from '../providers';
import {
    AppConfig,
    AppParams,
    CommandItem,
    CreateOptions,
    Creator,
    CreatorData,
    ModuleBuilderMeta,
    ModuleItem,
    ModuleOption,
} from '../types';

import { CreateModule, deepMerge, isAsyncFn } from './utils';

/**
 * 创建应用的快捷函数
 * @param options
 */
export function createApp(options: CreateOptions): Creator {
    return async () => App.create(options);
}
// export async function runApp<T extends INestApplication>(
//     builder: () => Promise<CreatorData<T>>,
//     listened?: (params: CreatorData<T>) => () => Promise<void>,
// ) {
//     const { configure, app } = await builder();
//     const { port, host } = configure.get<AppConfig>('app');
//     await app.listen(port, host, listened({ app, configure }));
// }

/**
 * 构建一个启动模块
 * @param params
 * @param options
 */
export async function createBootModule(
    params: AppParams,
    options: Pick<Partial<CreateOptions>, 'meta' | 'modules' | 'globals'>,
): Promise<{ BootModule: Type<any>; modules: ModuleItem[] }> {
    const { meta: bootMeta, modules, globals = {} } = options;
    const importModules = [...modules, CoreModule];
    if (!isNil(params.configure.get<ApiConfig>('database', null))) {
        importModules.push(DatabaseModule);
    }
    if (!isNil(params.configure.get<ApiConfig>('api', null))) {
        importModules.push(RestfulModule);
    }
    const imports = await createImportModules(params.configure, importModules);
    const providers: ModuleMetadata['providers'] = [];
    if (globals.pipe !== null) {
        const pipe = globals.pipe
            ? globals.pipe(params)
            : new AppPipe({
                  transform: true,
                  forbidUnknownValues: false,
                  validationError: { target: false },
              });
        providers.push({
            provide: APP_PIPE,
            useValue: pipe,
        });
    }
    if (globals.interceptor !== null) {
        providers.push({
            provide: APP_INTERCEPTOR,
            useClass: globals.interceptor ?? AppIntercepter,
        });
    }
    if (globals.filter !== null) {
        providers.push({
            provide: APP_FILTER,
            useClass: AppFilter,
        });
    }
    if (!isNil(globals.guard)) {
        providers.push({
            provide: APP_GUARD,
            useClass: globals.guard,
        });
    }
    return {
        BootModule: CreateModule('BootModule', () => {
            let meta: ModuleMetadata = {
                imports: [...imports],
                providers,
            };
            if (bootMeta) {
                meta = mergeMeta(meta, bootMeta(params));
            }
            return meta;
        }),
        modules: importModules,
    };
}

/**
 * 构建APP CLI,默认start命令应用启动监听app
 * @param builder APP构建器
 * @param listened start命令的监听回调
 */
export async function buildApp(
    builder: () => Promise<CreatorData>,
    listened?: (params: CreatorData) => () => Promise<void>,
) {
    const params = await builder();
    const commands = await createCommands(params, listened);
    console.log();
    commands.forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            if (!msg && !err) {
                yargs.showHelp();
                process.exit();
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}

/**
 * 深度合并启动模块的metadata
 * @param meta 默认metadata
 * @param custom 自定义metadata
 */
function mergeMeta(meta: ModuleMetadata, custom: ModuleMetadata) {
    const keys = Array.from(new Set([...Object.keys(meta), ...Object.keys(custom)]));
    const useMerge = <T>(i: T, p: T) => {
        if (isArray(p)) return [...((i as unknown as any[]) ?? []), ...((p as any[]) ?? [])];
        if (isObject(p)) return deepMerge(i, p);
        return p;
    };
    const merged = Object.fromEntries(
        keys
            .map((type) => [
                type,
                useMerge(meta[type as keyof ModuleMetadata], custom[type as keyof ModuleMetadata]),
            ])
            .filter(([_, item]) => (isArray(item) ? item.length > 0 : !!item)),
    );
    return { ...meta, ...merged };
}

/**
 * 根据模块类生成导入到启动模块的模块列表
 * @param configure 配置实例
 * @param modules 模块类列表
 */
async function createImportModules(
    configure: Configure,
    modules: ModuleItem[],
): Promise<Type<any>[]> {
    return Promise.all(
        modules.map(async (item) => {
            const option: ModuleOption = 'module' in item ? item : { module: item };
            const metadata: ModuleBuilderMeta = await getModuleMeta(configure, option);
            Module(omit(metadata, ['global', 'commands']))(option.module);
            if (metadata.global) Global()(option.module);
            return option.module;
        }),
    );
}

/**
 * 根据模块构建装饰器生成medadata
 * @param configure
 * @param option
 */
async function getModuleMeta(configure: Configure, option: ModuleOption) {
    let metadata: ModuleBuilderMeta = {};
    const register = Reflect.getMetadata(MODULE_BUILDER_REGISTER, option.module);
    const params = option.params ?? {};
    if (!isNil(register)) {
        metadata = isAsyncFn(register)
            ? await register(configure, params)
            : register(configure, params);
    }
    return metadata;
}

/**
 * 创建所有自定义及模块的命令
 * @param params
 * @param listened start命令的监听回调
 */
async function createCommands(
    params: CreatorData,
    listened?: (params: CreatorData) => () => Promise<void>,
): Promise<CommandModule<any, any>[]> {
    const { app, configure, modules } = params;
    const moduleCommands: Array<CommandItem<any, any>> = (
        await Promise.all(
            modules.map(async (item) => {
                const option: ModuleOption = 'module' in item ? item : { module: item };
                const { commands }: ModuleBuilderMeta = await getModuleMeta(configure, option);
                return commands ?? [];
            }),
        )
    ).reduce((o, n) => [...o, ...n], []);
    const commands = [...params.commands, ...moduleCommands].map((item) => {
        const command = item(params);
        return {
            ...command,
            handler: async (args: yargs.Arguments<any>) => {
                const handler = command.handler as (
                    ...argvs: yargs.Arguments<any>
                ) => Promise<void>;
                await handler({ ...params, ...args });
                await app.close();
                process.exit();
            },
        };
    });
    commands.push(createStartCommand(params, listened) as any);
    return commands;
}

function createStartCommand(
    params: Required<AppParams>,
    listened?: (params: CreatorData) => () => Promise<void>,
) {
    const { configure, app } = params;
    return {
        command: ['start', '$0'],
        describe: 'Start app',
        builder: {},
        handler: async () => {
            const { port, host } = configure.get<AppConfig>('app');
            await app.listen(port, host, listened({ app, configure } as any));
        },
    };
}
