import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({ host: 'localhost', port: 1025, ignoreTLS: true, });
    }

    async process(job: Job<{ name: string; email: string; title: string; content: string }>): Promise<any> {
        this.logger.log(`[WORKER] Processando Job #${job.id} - Título: "${job.data.title}" para ${job.data.email}`);

        try {
            const info = await this.transporter.sendMail({
                from: '"Estudos NestJS" <noreply@nestjs.local>',
                to: job.data.email,
                subject: job.data.title,
                text: `Olá ${job.data.name},\n\n${job.data.content}`,
                html: `<div style="font-family: sans-serif; color: #333; padding: 20px;">
                       <p>Olá <strong>${job.data.name}</strong>,</p>
                       <div style="background: #f4f4f5; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 4px;">
                         ${job.data.content.replace(/\n/g, '<br>')}
                       </div>
                       <small style="color: #71717a;">Enviado assincronamente via BullMQ & Redis.</small>
                      </div>`,
            });

            this.logger.log(`[WORKER] E-mail do Job #${job.id} enviado com sucesso!`);
            return info;
        } catch (error) {
            this.logger.error(`[WORKER] Erro ao enviar e-mail no Job #${job.id}:`, error);
            throw error;
        }
    }
}