import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityProps } from '@src/core/entity/user.entity';
import { PrismaService } from '@src/persistence/prisma.service';
import {compare, hash} from 'bcrypt';
import { RedisService } from '@src/persistence/redis.service';
import { MailService } from '@src/shared/mailer/email.service';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { EnvService } from '@src/shared/env/env.service';
@Injectable()
export class UserRepository {
  private readonly model: PrismaService['user'];
  private readonly mailService: MailService;
  private readonly saltRounds = 10;
  private readonly redisService: RedisService;
  
  constructor(redisService:RedisService,prismaService: PrismaService, mailService: MailService, private readonly env: EnvService) {
    this.model = prismaService.user;
    this.redisService = redisService;
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
    const token = jwt.sign(
      { id: user.getId()},
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
    const expiryInSeconds = 3600; 
    const redisKey = `password-recover:${user.getId()}`;
    await this.redisService.setWithExpiry(redisKey, token, expiryInSeconds);
    const message = `Olá ${user.getFirstName()}, você solicitou a recuperação de senha. Por favor, siga as instruções enviadas para o seu email. token: ${token}`;
    try {
      await this.mailService.sendEmail(user.getEmail(), message);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao enviar email de recuperação de senha',
      );
    }
  }
  async resetPassword(id: string, token: string, newPassword: string) {
    const redisKey = `password-recover:${id}`;
    const storedToken = await this.redisService.get(redisKey);
    if (!storedToken || storedToken !== token) {
      throw new BadRequestException('Token inválido ou expirado');
    }
    const decoded = <JwtPayload>jwt.verify(token, this.env.get('JWT_SECRET')); 
    if (decoded.id !== id) {
      throw new BadRequestException('Token inválido');
    }
    const hashedPassword = await hash(newPassword, this.saltRounds);
    await this.model.update({
      where: { id },
      data: { password: hashedPassword },
    });
    await this.redisService.delete(redisKey);
  }
}
