import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '@src/core/service/user.service';
import { Request, Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('find-by-id/:id') 
  @HttpCode(HttpStatus.OK)
  async findById(@Req() _req:Request, @Res() res:Response, @Param('id') id: string): Promise<void> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
     res.status(HttpStatus.OK).send(user);
  }
}
