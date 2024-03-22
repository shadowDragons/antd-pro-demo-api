import chalk from 'chalk';
import ora from 'ora';

import { Configure } from '@/modules/core/configure';
import { panic } from '@/modules/core/helpers';

import { getDbConfig, runSeeder } from '../helpers';

import { SeederService } from '../services/seeder.service';
import { SeederOptions } from '../types';

/**
 * 数据填充命令处理器
 * @param args
 * @param configure
 */
export const SeedHandler = async (args: SeederOptions, configure: Configure) => {
    const runner = getDbConfig(args.connection).seedRunner ?? SeederService;
    const spinner = ora('Start run seeder');
    try {
        spinner.start();
        await runSeeder(runner, args, spinner, configure);
        spinner.succeed(`\n 👍 ${chalk.greenBright.underline(`Finished Seeding`)}`);
    } catch (error) {
        panic({ spinner, message: `Run seeder failed`, error });
    }
};
