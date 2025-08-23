import { Module } from '@nestjs/common';
import { PrismaService } from '@src/persistence/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
