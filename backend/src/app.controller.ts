import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('session')
export class AppController {
    constructor(private configService: ConfigService) { }

    @Get()
    getSession() {
        return { id: this.configService.get<string>('MOCK_USER_ID'), name: this.configService.get<string>('MOCK_USER_NAME'), email: this.configService.get<string>('MOCK_USER_EMAIL'), tier: this.configService.get<string>('MOCK_USER_TIER') };
    }
}