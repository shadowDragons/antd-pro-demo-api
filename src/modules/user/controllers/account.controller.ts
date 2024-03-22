import { createReadStream, existsSync } from 'fs';

import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Request,
    Res,
    SerializeOptions,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { isNil, pick } from 'lodash';

import { lookup } from 'mime-types';

import { Configure } from '@/modules/core/configure';
import { OptionalUUIDPipe } from '@/modules/core/pipes';
import { ClassToPlain } from '@/modules/core/types';
import { MediaModule } from '@/modules/media/media.module';
import { MediaService } from '@/modules/media/services';

import { Depends } from '@/modules/restful/decorators';

import { CaptchaActionType } from '../constants';
import { Guest, ReqUser } from '../decorators';

import {
    AccountBoundDto,
    BoundEmailCaptchaDto,
    CredentialDto,
    EmailRetrievePasswordDto,
    RetrievePasswordDto,
    UpdateAccountDto,
    UpdatePasswordDto,
    UploadAvatarDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { getUserConfig } from '../helpers';
import { CaptchaJob } from '../queue';
import { AuthService, UserService } from '../services';
import { UserModule } from '../user.module';

import { AuthCaptchaController } from './captcha.controller';

/**
 * 账户中心控制器
 */

@ApiTags('账户操作')
@Depends(UserModule, MediaModule)
@Controller('account')
export class AccountController extends AuthCaptchaController {
    constructor(
        protected readonly userService: UserService,
        protected readonly authService: AuthService,
        protected readonly captchaJob: CaptchaJob,
        protected configure: Configure,
        protected mediaService: MediaService,
    ) {
        super(captchaJob);
    }

    @Post('login')
    @ApiOperation({ summary: '用户通过凭证(可以是用户名,邮箱,手机号等)+密码登录' })
    @Guest()
    @UseGuards(LocalAuthGuard)
    async login(@ReqUser() user: ClassToPlain<UserEntity>, @Body() _data: CredentialDto) {
        return { token: await this.authService.createToken(user.id) };
    }

    /**
     * 注销登录
     * @param req
     */
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: '用户登出账户' })
    @ApiBearerAuth()
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 通过用户凭证(用户名,短信,邮件)发送邮件和短信验证码后找回密码
     * @param data
     */
    @Patch('retrieve-password')
    @ApiOperation({ summary: '通过对凭证发送邮件验证码来找回密码' })
    @Guest()
    async retrievePassword(
        @Body()
        data: RetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.credential,
        });
    }

    /**
     * 通过邮件验证码找回密码
     * @param data
     */
    @Patch('retrieve-password-email')
    @ApiOperation({ summary: '通过邮件验证码找回密码' })
    @Guest()
    async retrievePasswordByEmail(
        @Body()
        data: EmailRetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.email,
        });
    }

    /**
     * 获取用户个人信息
     * @param user
     */
    @Get(['profile', 'profile/:item'])
    @ApiBearerAuth()
    @ApiOperation({ summary: '查询账户信息(只有用户自己才能查询)' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async profile(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Param('item', new OptionalUUIDPipe()) item?: string,
    ) {
        console.log(user);
        if (isNil(item) && isNil(user)) throw new NotFoundException();
        return this.userService.detail(item ?? user.id);
    }

    /**
     * 更新账户信息
     * @param user
     * @param data
     */
    @Patch()
    @ApiBearerAuth()
    @ApiOperation({ summary: '修改账户信息' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async update(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body()
        data: UpdateAccountDto,
    ) {
        return this.userService.update({ id: user.id, ...pick(data, ['username', 'nickname']) });
    }

    /**
     * 更改密码
     * @param user
     * @param data
     */
    @Patch('reset-passowrd')
    @ApiBearerAuth()
    @ApiOperation({ summary: '重置密码' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async resetPassword(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body() data: UpdatePasswordDto,
    ): Promise<UserEntity> {
        return this.userService.updatePassword(user, data);
    }

    /**
     * 发送邮件绑定验证码
     * @param data
     */
    @ApiOperation({ summary: '绑定或换绑邮箱' })
    @ApiBearerAuth()
    @Post('send-email-bound')
    async sendEmailBound(@Body() data: BoundEmailCaptchaDto) {
        return this.captchaJob.send({
            data,
            action: CaptchaActionType.ACCOUNTBOUND,
            message: 'can not send email for bind',
        });
    }

    /**
     * 绑定或更改邮箱
     * @param user
     * @param data
     */
    @Patch('bound-email')
    @ApiBearerAuth()
    @ApiOperation({ summary: '绑定或换绑邮箱' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async boundEmail(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body() data: AccountBoundDto,
    ): Promise<UserEntity> {
        return this.authService.boundCaptcha(user, {
            ...data,
            value: data.email,
        });
    }

    @Post('avatar')
    @ApiBearerAuth()
    @ApiOperation({ summary: '上传头像' })
    @ApiConsumes('multipart/form-data')
    async uploadAvatar(
        @Body() { image }: UploadAvatarDto,
        @ReqUser() user: ClassToPlain<UserEntity>,
    ) {
        return this.mediaService.upload({
            file: image,
            dir: 'avatars',
            user,
            relation: { entity: UserEntity, field: 'avatar', id: user.id },
        });
    }

    @Get('avatar')
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取默认头像' })
    @Guest()
    async defaultAvatar(@Res({ passthrough: true }) res: FastifyReply) {
        const avatar = getUserConfig<string>('avatar');
        if (!existsSync(avatar)) throw new NotFoundException('file not exists!');
        const image = createReadStream(avatar);
        res.type(lookup(avatar) as string);
        return new StreamableFile(image);
    }
}
