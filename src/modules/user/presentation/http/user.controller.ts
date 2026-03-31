import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/presentation/guard/jwt-auth.guard';
import { CreateUserHandler } from '@modules/user/application/use-case/create-user/create-user.handler';
import { CreateUserInput } from '@modules/user/application/use-case/create-user/create-user.dto';
import { GetUserHandler } from '@modules/user/application/use-case/get-user/get-user.handler';
import { UpdateUserHandler } from '@modules/user/application/use-case/update-user/update-user.handler';
import { UpdateUserInput } from '@modules/user/application/use-case/update-user/update-user.dto';
import { DeleteUserHandler } from '@modules/user/application/use-case/delete-user/delete-user.handler';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getUserHandler: GetUserHandler,
    private readonly updateUserHandler: UpdateUserHandler,
    private readonly deleteUserHandler: DeleteUserHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateUserInput) {
    return this.createUserHandler.execute(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getUser(@Param('id') id: string) {
    return this.getUserHandler.execute({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserInput) {
    return this.updateUserHandler.execute({ ...dto, id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id') id: string) {
    return this.deleteUserHandler.execute({ id });
  }
}
