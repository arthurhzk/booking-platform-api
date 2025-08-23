import { Module } from '@nestjs/common';
import { PrismaService } from '@src/persistence/prisma.service';
import { UserService } from '@src/core/service/user.service';
import { UserRepository } from '@src/persistence/repository/user.repository';
import { UserController } from '@src/http/controller/user.controller';
import { RedisService } from '@src/persistence/redis.service';
import { MailService } from '@src/shared/email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT!, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    PrismaService,
    UserService,
    UserRepository,
    RedisService,
    MailService,
  ],
})
export class AppModule {}
