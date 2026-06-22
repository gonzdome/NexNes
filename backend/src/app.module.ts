import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { EmailProcessor } from './services/email.processor';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({ connection: { host: 'localhost', port: 6379, }, }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({ name: 'email-queue', }),
    ],
    controllers: [AppController],
    providers: [EmailProcessor],
})
export class AppModule { }