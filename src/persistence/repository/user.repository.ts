import { Injectable } from '@nestjs/common';
import { UserEntity } from '@src/core/entity/user.entity';
import { PrismaService } from '@src/persistence/prisma.service';

@Injectable() 
export class UserRepository {
    private readonly model: PrismaService["user"]
    constructor (prismaService: PrismaService) {
        this.model = prismaService.user;
    }
    async findById(id:string): Promise<UserEntity | null>{
        const user = await this.model.findUnique({
            where: { id },
        });
        if (!user) return null
        return UserEntity.create({
            ...user,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        })  
    }
}