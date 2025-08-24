import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityProps } from '@src/core/entity/user.entity';
import { PrismaService } from '@src/persistence/prisma.service';
import {compare, hash} from 'bcrypt';
import { RedisService } from '@src/persistence/redis.service';
import { MailService } from '@src/shared/email.service';
@Injectable()
export class UserRepository {
  private readonly model: PrismaService['user'];
  private readonly mailService: MailService;
  private redisService: RedisService = new RedisService();
  private readonly saltRounds = 10;
  
  constructor(prismaService: PrismaService, mailService: MailService) {
    this.model = prismaService.user;
    this.mailService = mailService;
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
    const userCache = await this.redisService.get('email:' + email);
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
      password: await hash(user.getPassword(), this.saltRounds),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      phone: user.getPhone(),
      avatar: user.getAvatar(),
    };
    const { password, ...userWithoutPassword } = payload;

    const createdUser = await this.model.create({
      data: payload,
    });
    await this.redisService.set(
      'email:' + user.getEmail(),
      JSON.stringify(userWithoutPassword),
    );
    return UserEntity.create({
      ...createdUser,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    });
  }
  async authUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await compare(password, user.getPassword());
    if (!isPasswordValid)
      throw new BadRequestException('Email ou senha inválidos');
    return user;
  }
  async passwordRecover(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    const token = Math.random().toString(36).substring(2, 15);
    const expiryInSeconds = 3600; 
    const redisKey = `password-recover:${user.getId()}`;
    await this.redisService.setWithExpiry(redisKey, token, expiryInSeconds);
    const message = `Olá ${user.getFirstName()}, você solicitou a recuperação de senha. Por favor, siga as instruções enviadas para o seu email.`;
    try {
      await this.mailService.sendEmail(user.getEmail(), message);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao enviar email de recuperação de senha',
      );
    }
  }
}
