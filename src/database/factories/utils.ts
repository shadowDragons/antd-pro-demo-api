import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { lookup } from 'mime-types';

import { panic } from '@/modules/core/helpers';
import { MediaEntity } from '@/modules/media/entities';
import { uploadLocalFile } from '@/modules/media/helpers';
import { UserEntity } from '@/modules/user/entities';
import { getUserConfig } from '@/modules/user/helpers';
import { UserConfig } from '@/modules/user/types';

export const getCreator = async () => {
    const { username } = getUserConfig<UserConfig['super']>('super');
    return UserEntity.findOneByOrFail({ username });
};
export const saveFile = async (
    user: UserEntity,
    filename: string,
    fromDir?: string,
    toDir?: string,
) => {
    const file = resolve(
        __dirname,
        `../../assets/media/${fromDir ? `${fromDir}/` : ''}${filename}`,
    );

    if (!existsSync(file)) panic(`File ${file} not exists!`);

    const mediaPath = uploadLocalFile(
        {
            filename: file,
            mimetype: lookup(file) as string,
            value: readFileSync(file, { encoding: 'base64' }),
        },
        toDir,
    );
    const media = new MediaEntity();
    media.file = mediaPath;
    media.user = user;
    return MediaEntity.save(media);
};
