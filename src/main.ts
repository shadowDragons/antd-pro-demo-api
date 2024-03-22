// /*
//  *  ┌─────────────────────────────────────────────────────────────┐
//  *  │┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐│
//  *  ││Esc│!1 │@2 │#3 │$4 │%5 │^6 │&7 │*8 │(9 │)0 │_- │+= │|\ │`~ ││
//  *  │├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┤│
//  *  ││ Tab │ Q │ W │ E │ R │ T │ Y │ U │ I │ O │ P │{[ │}] │ BS  ││
//  *  │├─────┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴─────┤│
//  *  ││ Ctrl │ A │ S │ D │ F │ G │ H │ J │ K │ L │: ;│" '│ Enter  ││
//  *  │├──────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴────┬───┤│
//  *  ││ Shift  │ Z │ X │ C │ V │ B │ N │ M │< ,│> .│? /│Shift │Fn ││
//  *  │└─────┬──┴┬──┴──┬┴───┴───┴───┴───┴───┴──┬┴───┴┬──┴┬─────┴───┘│
//  *  │      │Fn │ Alt │         Space         │ Alt │Win│   HHKB   │
//  *  │      └───┴─────┴───────────────────────┴─────┴───┘          │
//  *  └─────────────────────────────────────────────────────────────┘
//  *
//  * 🐳 pincman   : pincman
//  * 🕰 Created_At: 2022-08-17 14:48:32
//  * ✍️ Last_Editors: pincman
//  * ⌛️ Updated_At: 2022-11-23 16:48:52
//  * 📃 FilePath  : /src/main.ts
//  * 🔥 Description: 3R教室(https://pincman.com/classroom)提供TS全栈开发在线培训及远程工作求职指导
//  * 🧊 Homepage  : https://pincman.com
//  * 📮 Email     : pincman@qq.com
//  * 🐱 Github    : https://github.com/nestjs/nestjs
//  * 🐧 QQ        : 1849600177
//  * 💬 微信        : yjosscom
//  * 👥 QQ群       : 455820533
//  * ✨ Copyright (c) 2022 by pincman.com, All Rights Reserved.
//  */

// import { NestFactory } from '@nestjs/core';
// import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

// import { CommonModule } from '@/modules/core';

// import * as configs from './config';
// import { ContentModule } from './modules/content/content.module';
// import { createApp, buildApp } from './modules/core';

// import { RbacModule } from './modules/rbac';
// import { echoApi, RestfulFactory, RestfulModule } from './modules/restful';
// import { UserModule } from './modules/user';

// const creator = createApp({
//     configs,
//     configure: { storage: true },
//     websockets: true,
//     // globals: {
//     //     guard: RbacGuard,
//     // },
//     modules: [CommonModule, UserModule, RbacModule, RestfulModule, ContentModule],
//     builder: async ({ configure, BootModule }) => {
//         return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
//             cors: true,
//             logger: ['error', 'warn'],
//         });
//     },
// });
// buildApp(creator, ({ app, configure }) => async () => {
//     const restful = app.get(RestfulFactory);
//     echoApi(configure, restful);
// });
/*
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐│
 *  ││Esc│!1 │@2 │#3 │$4 │%5 │^6 │&7 │*8 │(9 │)0 │_- │+= │|\ │`~ ││
 *  │├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┤│
 *  ││ Tab │ Q │ W │ E │ R │ T │ Y │ U │ I │ O │ P │{[ │}] │ BS  ││
 *  │├─────┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴┬──┴─────┤│
 *  ││ Ctrl │ A │ S │ D │ F │ G │ H │ J │ K │ L │: ;│" '│ Enter  ││
 *  │├──────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴────┬───┤│
 *  ││ Shift  │ Z │ X │ C │ V │ B │ N │ M │< ,│> .│? /│Shift │Fn ││
 *  │└─────┬──┴┬──┴──┬┴───┴───┴───┴───┴───┴──┬┴───┴┬──┴┬─────┴───┘│
 *  │      │Fn │ Alt │         Space         │ Alt │Win│   HHKB   │
 *  │      └───┴─────┴───────────────────────┴─────┴───┘          │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * 🐳 pincman   : pincman
 * 🕰 Created_At: 2022-08-17 14:48:32
 * ✍️ Last_Editors: pincman
 * ⌛️ Updated_At: 2022-12-14 06:18:20
 * 📃 FilePath  : /src/main.ts
 * 🔥 Description: 3R教室(https://pincman.com/classroom)提供TS全栈开发在线培训及远程工作求职指导
 * 🧊 Homepage  : https://pincman.com
 * 📮 Email     : pincman@qq.com
 * 🐱 Github    : https://github.com/nestjs/nestjs
 * 🐧 QQ        : 1849600177
 * 💬 微信        : yjosscom
 * 👥 QQ群       : 455820533
 * ✨ Copyright (c) 2022 by pincman.com, All Rights Reserved.
 */

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { buildApp, createApp } from '@/modules/core/helpers/app';

import * as configs from './config';

import { ContentModule } from './modules/content/content.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { MediaModule } from './modules/media/media.module';

import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';
import { RestfulFactory } from './modules/restful/factory';
import { echoApi } from './modules/restful/helpers';
import { UserModule } from './modules/user/user.module';

const creator = createApp({
    configs,
    configure: { storage: true },
    modules: [ContentModule, MediaModule, UserModule, RbacModule, I18nModule],
    websockets: true,
    globals: { guard: RbacGuard },
    builder: async ({ configure, BootModule }) => {
        return NestFactory.create<NestFastifyApplication>(BootModule, new FastifyAdapter(), {
            cors: true,
            logger: ['error', 'warn'],
        });
    },
});
buildApp(creator, ({ app, configure }) => async () => {
    const restful = app.get(RestfulFactory);
    echoApi(configure, restful);
});
