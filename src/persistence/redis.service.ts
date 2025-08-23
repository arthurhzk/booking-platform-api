import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL!);
  }
  onModuleInit() {
    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }
  onModuleDestroy() {
    this.redisClient
      .quit()
      .then(() => {
        console.log('Redis connection closed');
      })
      .catch((err) => {
        console.error('Error closing Redis connection:', err);
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
