import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest as Request } from 'fastify';
import { pick } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { Repository } from 'typeorm';

import { App } from '@/modules/core/app';
import { Configure } from '@/modules/core/configure';
import { EnvironmentType } from '@/modules/core/constants';
import { getTime } from '@/modules/core/helpers';
import { PermissionRepository, RoleRepository } from '@/modules/rbac/repositories';

import { CaptchaActionType } from '../constants';
import { CaptchaEntity } from '../entities/captcha.entity';
import { UserEntity } from '../entities/user.entity';
import { decrypt, encrypt, getUserConfig } from '../helpers';
import { UserRepository } from '../repositories/user.repository';

import { CaptchaTimeOption, CaptchaValidate, UserConfig } from '../types';

import { TokenService } from './token.service';

import { UserService } from './user.service';

/**
 * 户认证服务
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        protected readonly roleRepository: RoleRepository,
        protected permissionRepository: PermissionRepository,

        protected configure: Configure,
    ) {}

    /**
     * 用户登录验证
     * @param credential
     * @param password
     */
    async validateUser(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential, async (query) =>
            query.addSelect('user.password'),
        );
        const adminConf = getUserConfig<UserConfig['super']>('super');
        console.log(adminConf);
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 登录用户,并生成新的token和refreshToken
     * @param user
     */
    async login(user: UserEntity) {
        const now = getTime();
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 用户手机号/邮箱+验证码登录用户
     * @param value
     * @param code
     * @param type
     * @param message
     */
    async loginByCaptcha(value: string, code: string, message?: string) {
        const expired = await this.checkCodeExpired({ value, code }, CaptchaActionType.LOGIN);
        if (expired) {
            throw new BadRequestException('captcha has been expired,cannot used to login');
        }
        const user = await this.userService.findOneByCondition({ email: value });
        if (!user) {
            const error = message ?? `your email or captcha code not correct`;
            throw new UnauthorizedException(error);
        }
        return user;
    }

    /**
     * 注销登录
     * @param req
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 登录用户后生成新的token和refreshToken
     * @param id
     */
    async createToken(id: string) {
        const now = getTime();
        let user: UserEntity;
        try {
            user = await this.userService.detail(id);
        } catch (error) {
            throw new ForbiddenException();
        }
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 通过验证码重置密码
     * @param data
     */
    async retrievePassword(data: CaptchaValidate<{ password: string }>) {
        const { value, password } = data;
        const expired = await this.checkCodeExpired(data, CaptchaActionType.RETRIEVEPASSWORD);
        if (expired) {
            throw new ForbiddenException(
                'captcha has been expired,cannot to used to retrieve password',
            );
        }
        const user = await this.userService.findOneByCredential(value);
        const error = `user not exists of credential ${value}`;
        if (!user) {
            throw new ForbiddenException(error);
        }
        user.password = encrypt(password);
        await this.userRepository.save(pick(user, ['id', 'password']));
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 绑定或更改手机号/邮箱
     * @param user
     * @param data
     */
    async boundCaptcha(user: UserEntity, data: CaptchaValidate) {
        const { code, value } = data;
        const error = {
            code: 2002,
            message: 'new email captcha code is error',
        };

        const captcha = await this.captchaRepository.findOne({
            where: {
                code,
                value,
                action: CaptchaActionType.ACCOUNTBOUND,
            },
        });
        if (!captcha) {
            throw new ForbiddenException(error);
        }
        user.email = value;
        await this.userRepository.save(user);
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 检测验证码是否过期
     * @param data
     * @param action
     */
    protected async checkCodeExpired(data: CaptchaValidate, action: CaptchaActionType) {
        const { value, code } = data;
        const conditional: Record<string, any> = { code, value, action };
        const codeItem = await this.captchaRepository.findOne({
            where: conditional,
        });
        if (!codeItem) {
            throw new ForbiddenException('captcha code is not incorrect');
        }
        const { expired } = getUserConfig<CaptchaTimeOption>(`captcha.time.${action}`);
        return getTime({ date: codeItem.updated_at }).add(expired, 'second').isBefore(getTime());
    }

    /**
     * 导入Jwt模块
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: () => {
                const config = getUserConfig<UserConfig>();
                return {
                    secret: config.jwt.secret,
                    ignoreExpiration: App.configure.getRunEnv() === EnvironmentType.DEVELOPMENT,
                    signOptions: { expiresIn: `${config.jwt.token_expired}s` },
                };
            },
        });
    }
}
