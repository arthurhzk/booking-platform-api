import { Injectable } from '@nestjs/common';
import { UserEntity, UserEntityProps } from '@src/core/entity/user.entity';
import { PrismaService } from '@src/persistence/prisma.service';
import * as bcrypt from 'bcrypt';
import { RedisService } from '@src/persistence/redis.service';
@Injectable()
export class UserRepository {
  private readonly model: PrismaService['user'];

  private readonly saltRounds = 10;
  constructor(prismaService: PrismaService) {
    this.model = prismaService.user;
  }
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.model.findUnique({
      where: { id },
    });
    if (!user) return null;
    return UserEntity.create({
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    const userCache = await new RedisService().get('email:' + email);
    if (userCache) {
      return UserEntity.create(JSON.parse(userCache));
    }
    const user = await this.model.findUnique({
      where: { email },
    });
    if (!user) return null;
    return UserEntity.create({
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
  async createUser(data: UserEntityProps): Promise<UserEntity> {
    const user = UserEntity.createNew(data);

    const payload = {
      email: user.getEmail(),
      password: await bcrypt.hash(user.getPassword(), this.saltRounds),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      phone: user.getPhone(),
      avatar: user.getAvatar(),
    };
    const { password, ...userWithoutPassword } = payload;

    const createdUser = await this.model.create({
      data: payload,
    });
    await new RedisService().set(
      'email:' + user.getEmail(),
      JSON.stringify(userWithoutPassword),
    );
    return UserEntity.create({
      ...createdUser,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    });
  }
}
