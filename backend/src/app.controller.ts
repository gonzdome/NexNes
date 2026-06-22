import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface ReportRequestDto {
    title: string;
    content: string;
}

@Controller('session')
export class AppController {
    constructor(
        private readonly configService: ConfigService,
        @InjectQueue('email-queue') private readonly emailQueue: Queue,
    ) { }

    @Get()
    getSession() {
        return {
            id: this.configService.get<string>('MOCK_USER_ID'),
            name: this.configService.get<string>('MOCK_USER_NAME'),
            email: this.configService.get<string>('MOCK_USER_EMAIL'),
            tier: this.configService.get<string>('MOCK_USER_TIER'),
        };
    }

    @Post('report')
    @HttpCode(202)
    async requestReport(@Body() body: ReportRequestDto) {
        const name = this.configService.get<string>('MOCK_USER_NAME');
        const targetEmail = this.configService.get<string>('MOCK_USER_EMAIL');

        const job = await this.emailQueue.add('send-report-email', { name, email: targetEmail, title: body.title, content: body.content, });

        return { success: true, message: 'Relatório customizado adicionado à fila!', jobId: job.id, };
    }
}