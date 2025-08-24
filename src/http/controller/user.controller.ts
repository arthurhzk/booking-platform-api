import {
  Controller,
  Get,
  Put,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '@src/core/service/user.service';
import { Request, Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('find-by-id/:id')
  async findById(
    @Req() _req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    res.status(HttpStatus.OK).send(user);
  }
  @Post('create-user')
  async createUser(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      const message = `Usuário com email ${email} já existe`;
      res.status(HttpStatus.BAD_REQUEST).send(message);
      throw new NotFoundException(message);
    }
    const user = await this.userService.createUser(req.body);
    res.status(HttpStatus.CREATED).send(user);
  }
  @Post('auth')
  async auth(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { email, password } = req.body;
    const user = await this.userService.authUser(email, password);
    res.status(HttpStatus.OK).send(user);
  }
  @Post('password-recover')
  async passwordRecover(@Req() req: Request, @Res() res: Response){
    const { email } = req.body;
    const user = await this.userService.passwordRecover(email);
    res.status(HttpStatus.OK).send(user);
  }
  @Put('reset-password')
  async resetPassword(@Req() req: Request, @Res() res: Response){
    const { id, token, newPassword } = req.body;
    const user = await this.userService.resetPassword(id, token, newPassword);
    res.status(HttpStatus.OK).send(user);
  }
}
