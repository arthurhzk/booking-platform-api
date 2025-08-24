import { Module } from '@nestjs/common';
import { PrismaService } from '@src/persistence/prisma.service';
import { UserService } from '@src/core/service/user.service';
import { UserRepository } from '@src/persistence/repository/user.repository';
import { UserController } from '@src/http/controller/user.controller';
import { RedisService } from '@src/persistence/redis.service';
import { MailService } from '@src/shared/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { EnvModule } from '@src/shared/env/env.module';
import { envSchema } from '@src/shared/env/env';
import { EnvService } from '@src/shared/env/env.service';
import {LoggerModule} from '@src/shared/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        transport: {
          host: envService.get('EMAIL_HOST'),
          port: +(envService.get('EMAIL_PORT')),
          secure: envService.get('EMAIL_SECURE'),
          auth: {
            user: envService.get('EMAIL_USER'),
            pass: envService.get('EMAIL_PASSWORD'),
          },
        },
      }),
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
export class AppModule { }