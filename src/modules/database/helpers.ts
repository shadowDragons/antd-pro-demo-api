import { resolve } from 'path';

import { Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { isNil } from 'lodash';

import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { Ora } from 'ora';
import {
    ObjectLiteral,
    ObjectType,
    SelectQueryBuilder,
    DataSource,
    EntityTarget,
    DataSourceOptions,
    EntityManager,
    Repository,
} from 'typeorm';

import { App } from '@/modules/core/app';

import { Configure } from '@/modules/core/configure';
import { createConnectionOptions, deepMerge, panic } from '@/modules/core/helpers';

import { ClassType } from '../core/types';

import { ADDTIONAL_RELATIONS, CUSTOM_REPOSITORY_METADATA } from './constants';
import { FactoryService } from './services';

import {
    DbFactoryBuilder,
    DefineFactory,
    SeederConstructor,
    DbConfig,
    DynamicRelation,
    DbConfigOptions,
    TypeormOption,
    IPaginateDto,
    OrderQueryType,
    SeederOptions,
    Seeder,
    FactoryOptions,
} from './types';

/** ****************************** 配置相关 **************************** */

/**
 * 创建数据库配置
 * @param options 自定义配置
 */
export const createDbOptions = (options: DbConfigOptions) => {
    const newOptions: DbConfigOptions = {
        common: deepMerge(
            {
                charset: 'utf8mb4',
                logging: ['error'],
                migrations: [],
                paths: {
                    migration: resolve(__dirname, '../../database/migrations'),
                },
            },
            options.common ?? {},
            'replace',
        ),
        connections: createConnectionOptions(options.connections ?? []),
    };
    newOptions.connections = newOptions.connections.map((connection) => {
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
            newOptions.common,
            { ...newOption, synchronize: false, autoLoadEntities: true } as any,
            'replace',
        );
    });
    return newOptions as DbConfig;
};

/**
 * 根据数据配置名称获取一个数据库连接配置
 * @param cname 默认为default
 */
export function getDbConfig(cname = 'default') {
    const { connections = [] }: DbConfig = App.configure.get<DbConfig>('database');
    const dbConfig = connections.find(({ name }) => name === cname);
    if (isNil(dbConfig)) panic(`Database connection named ${cname} not exists!`);
    return dbConfig as TypeormOption;
}

/** ****************************** 类注册及读取 **************************** */

/**
 * 在模块上注册entity
 * @param configure 配置类实例
 * @param entities entity类列表
 * @param dataSource 数据连接名称,默认为default
 */
export const addEntities = (
    configure: Configure,
    entities: EntityClassOrSchema[] = [],
    dataSource = 'default',
) => {
    const database = configure.get<DbConfig>('database');
    if (isNil(database)) throw new Error(`Typeorm have not any config!`);
    const dbConfig = database.connections.find(({ name }) => name === dataSource);
    // eslint-disable-next-line prettier/prettier, prefer-template
    if (isNil(dbConfig))
        throw new Error(`Database connection named ${  dataSource  } not exists!`);
    const oldEntities = (dbConfig.entities ?? []) as ObjectLiteral[];
    /**
     * 为有动态关联的entity添加动态关联
     */
    const es = entities.map((e) => {
        const relationsRegister = Reflect.getMetadata(ADDTIONAL_RELATIONS, e);
        if ('prototype' in e && relationsRegister && typeof relationsRegister === 'function') {
            const relations: DynamicRelation[] = relationsRegister();
            relations.forEach(({ column, relation, others }) => {
                const cProperty = Object.getOwnPropertyDescriptor(e.prototype, column);
                if (!cProperty) {
                    Object.defineProperty(e.prototype, column, {
                        writable: true,
                    });
                    relation(e.prototype, column);
                    if (!isNil(others)) {
                        for (const other of others) {
                            other(e.prototype, column);
                        }
                    }
                }
            });
        }
        return e;
    });
    /**
     * 更新数据库配置,添加上新的模型
     */
    configure.set(
        'database.connections',
        database.connections.map((connection) =>
            connection.name === dataSource
                ? {
                      ...connection,
                      entities: [...es, ...oldEntities],
                  }
                : connection,
        ),
    );
    return TypeOrmModule.forFeature(es, dataSource);
};

/**
 * 在模块上注册订阅者
 * @param configure 配置类实例
 * @param subscribers 订阅者列表
 * @param dataSource 数据库连接名称
 */
export const addSubscribers = (
    configure: Configure,
    subscribers: Type<any>[] = [],
    dataSource = 'default',
) => {
    const database = configure.get<DbConfig>('database');
    if (isNil(database)) throw new Error(`Typeorm have not any config!`);
    const dbConfig = database.connections.find(({ name }) => name === dataSource);
    // eslint-disable-next-line prettier/prettier, prefer-template
    if (isNil(dbConfig)) throw new Error('Database connection named' + dataSource + 'not exists!');

    const oldSubscribers = (dbConfig.subscribers ?? []) as any[];

    /**
     * 更新数据库配置,添加上新的订阅者
     */
    configure.set(
        'database.connections',
        database.connections.map((connection) =>
            connection.name === dataSource
                ? {
                      ...connection,
                      subscribers: [...oldSubscribers, ...subscribers],
                  }
                : connection,
        ),
    );
    return subscribers;
};

/**
 * 获取自定义Repository的实例
 * @param dataSource 数据连接池
 * @param Repo repository类
 */
export const getCustomRepository = <T extends Repository<E>, E extends ObjectLiteral>(
    dataSource: DataSource,
    Repo: ClassType<T>,
): T => {
    if (isNil(Repo)) return null;
    const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
    if (!entity) return null;
    const base = dataSource.getRepository<ObjectType<any>>(entity);
    return new Repo(base.target, base.manager, base.queryRunner) as T;
};

/** ****************************** 数据查询及操作 **************************** */
/**
 * 分页函数
 * @param qb queryBuilder实例
 * @param options 分页选项
 */
export const paginate = async <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    options: any,
): Promise<any> => {
    const start = options.page > 0 ? options.page - 1 : 0;
    const totalItems = await qb.getCount();
    qb.take(options.limit).skip(start * options.limit);
    const items = await qb.getMany();
    const totalPages = Math.ceil(totalItems / options.limit);
    const itemCount =
        // eslint-disable-next-line no-nested-ternary
        options.page < totalPages ? options.limit : options.page === totalPages ? totalItems : 0;
    return {
        items,
        meta: {
            totalItems,
            itemCount,
            itemsPerPage: options.limit,
            totalPages,
            currentPage: options.page,
        },
    };
};

/**
 * 手动分页函数
 * @param param0 分页选项
 * @param data 数据列表
 */
export function manualPaginate<T extends ObjectLiteral>(
    { page, limit }: IPaginateDto,
    data: T[],
): Pagination<T> {
    let items: T[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    const meta: IPaginationMeta = {
        itemCount,
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
    };
    return {
        meta,
        items,
    };
}

/**
 * 为查询添加排序,默认排序规则为DESC
 * @param qb 原查询
 * @param alias 别名
 * @param orderBy 查询排序
 */
export const getOrderByQuery = <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy?: OrderQueryType,
) => {
    if (isNil(orderBy)) return qb;
    if (typeof orderBy === 'string') return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    if (Array.isArray(orderBy)) {
        let q = qb;
        const i = 0;
        for (const item of orderBy) {
            if (i === 0) {
                q =
                    typeof item === 'string'
                        ? q.orderBy(`${alias}.${item}`, 'DESC')
                        : q.orderBy(`${alias}.${item}`, item.order);
            } else {
                q =
                    typeof item === 'string'
                        ? q.addOrderBy(`${alias}.${item}`, 'DESC')
                        : q.addOrderBy(`${alias}.${item}`, item.order);
            }
        }
        return q;
    }
    return qb.orderBy(`${alias}.${(orderBy as any).name}`, (orderBy as any).order);
};

/** ****************************** CLI相关 **************************** */

/**
 * 忽略外键
 * @param em EntityManager实例
 * @param type 数据库类型
 * @param disabled 是否禁用
 */
export async function resetForeignKey(
    em: EntityManager,
    type = 'mysql',
    disabled = true,
): Promise<EntityManager> {
    let key: string;
    let query: string;
    if (type === 'sqlite') {
        key = disabled ? 'OFF' : 'ON';
        query = `PRAGMA foreign_keys = ${key};`;
    } else {
        key = disabled ? '0' : '1';
        query = `SET FOREIGN_KEY_CHECKS = ${key};`;
    }
    await em.query(query);
    return em;
}
/**
 * 获取Entity类名
 *
 * @export
 * @template T
 * @param {ObjectType<T>} entity
 * @returns {string}
 */
export function entityName<T>(entity: EntityTarget<T>): string {
    if (entity instanceof Function) return entity.name;
    if (!isNil(entity)) return new (entity as any)().constructor.name;
    throw new Error('Enity is not defined');
}

/**
 * 允许填充类
 * @param Clazz 填充类
 * @param args 填充命令参数
 * @param spinner Ora雪碧图标
 */
export async function runSeeder(
    Clazz: SeederConstructor,
    args: SeederOptions,
    spinner: Ora,
    configure: Configure,
): Promise<DataSource> {
    const seeder: Seeder = new Clazz(spinner, args);
    const dbConfig = getDbConfig(args.connection);
    const dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);

    await dataSource.initialize();
    const factoryMaps: FactoryOptions = {};
    for (const factory of dbConfig.factories) {
        const { entity, handler } = factory();
        factoryMaps[entity.name] = { entity, handler };
    }
    if (typeof args.transaction === 'boolean' && !args.transaction) {
        const em = await resetForeignKey(dataSource.manager, dataSource.options.type);
        await seeder.load({
            factorier: factoryBuilder(dataSource, factoryMaps),
            factories: factoryMaps,
            dataSource,
            em,
            configure,
            connection: args.connection ?? 'default',
        });
        await resetForeignKey(em, dataSource.options.type, false);
    } else {
        // 在事务中运行
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const em = await resetForeignKey(queryRunner.manager, dataSource.options.type);
            await seeder.load({
                factorier: factoryBuilder(dataSource, factoryMaps),
                factories: factoryMaps,
                dataSource,
                em,
                configure,
                connection: args.connection ?? 'default',
            });
            await resetForeignKey(em, dataSource.options.type, false);
            // 提交事务
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            // 遇到错误则回滚
            await queryRunner.rollbackTransaction();
        } finally {
            // 执行事务
            await queryRunner.release();
        }
    }
    if (dataSource.isInitialized) await dataSource.destroy();
    return dataSource;
}

/**
 * Factory构建器
 * @param dataSource 数据连接池
 * @param factories factory函数组
 */
export const factoryBuilder: DbFactoryBuilder =
    (dataSource, factories) => (entity) => (settings) => {
        const name = entityName(entity);
        if (!factories[name]) {
            throw new Error(`has none factory for entity named ${name}`);
        }
        return new FactoryService(
            name,
            entity,
            dataSource.createEntityManager(),
            factories[name].handler,
            settings,
        );
    };

/**
 * 定义factory用于生成数据
 * @param entity 模型
 * @param handler 处理器
 */
export const defineFactory: DefineFactory = (entity, handler) => () => ({
    entity,
    handler,
});
