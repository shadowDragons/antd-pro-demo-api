import { DataSource } from 'typeorm';

import { BaseSeeder } from '../base/seeder';

import { getDbConfig } from '../helpers';
import { DbFactory } from '../types';

/**
 * 默认的Seed Runner
 */
export class SeederService extends BaseSeeder {
    /**
     * 运行一个连接的填充类
     * @param _factory
     * @param _dataSource
     */
    public async run(_factory: DbFactory, _dataSource: DataSource): Promise<any> {
        const seeders = (getDbConfig(this.connection) as any).seeders ?? [];
        for (const seeder of seeders) {
            await this.call(seeder);
        }
    }
}
