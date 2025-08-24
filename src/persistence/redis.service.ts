import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AppLogger } from '@src/shared/logger/logger.service';
import {EnvService} from "@src/shared/env/env.service";
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient;
  private readonly logger = new AppLogger();

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL!);

  }
  onModuleInit() {
    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
    this.redisClient.on('error', (err) => {
      this.logger.error('Redis connection error', <never>err);
    });
  }
  onModuleDestroy() {
    this.redisClient
      .quit()
      .then(() => {
        this.logger.log('Redis connection closed');
      })
      .catch((err) => {
        this.logger.error('Error closing Redis connection', err);
      });
  }
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }
  async setWithExpiry(key: string, value: string, expiryInSeconds: number){
    await this.redisClient.set(key, value, 'EX', expiryInSeconds);
  }
}
