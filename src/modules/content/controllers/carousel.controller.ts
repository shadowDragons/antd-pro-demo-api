import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';
import { Guest } from '@/modules/user/decorators';

import { ContentModule } from '../content.module';

import { CarouselService } from '../services/carousel.service';

@ApiTags('首页轮播查询')
@Depends(ContentModule)
@Controller('carousels')
export class CarouselController {
    constructor(protected service: CarouselService) {}

    @Get()
    @ApiOperation({ summary: '查询文章分类表,以分页形式展示' })
    @Guest()
    @SerializeOptions({ groups: ['carousel-list'] })
    async list() {
        return this.service.list();
    }
}
