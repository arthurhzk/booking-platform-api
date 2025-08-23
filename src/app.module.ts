import { Module } from '@nestjs/common';
import { PrismaService } from '@src/persistence/prisma.service';
import {UserService} from '@src/core/service/user.service';
import {UserRepository} from '@src/persistence/repository/user.repository';
import { UserController } from '@src/http/controller/user.controller';
import { RedisService } from '@src/persistence/redis.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [PrismaService, UserService, UserRepository, RedisService],
})
export class AppModule {}
