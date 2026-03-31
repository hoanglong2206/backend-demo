import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { userProviders } from './infrastructure/provider/user.providers';

// Guard (shared from auth)
import { JwtAuthGuard } from '@modules/auth/presentation/guard/jwt-auth.guard';

// Use-case handlers
import { CreateUserHandler } from './application/use-case/create-user/create-user.handler';
import { GetUserHandler } from './application/use-case/get-user/get-user.handler';
import { UpdateUserHandler } from './application/use-case/update-user/update-user.handler';
import { DeleteUserHandler } from './application/use-case/delete-user/delete-user.handler';

// Controller
import { UserController } from './presentation/http/user.controller';

@Module({
  imports: [
    InfrastructureModule,
    JwtModule.register({}), // secrets supplied per-call by JwtTokenGeneratorService
  ],
  controllers: [UserController],
  providers: [
    ...userProviders,

    // Guard
    JwtAuthGuard,

    // Use-case handlers
    CreateUserHandler,
    GetUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
  ],
})
export class UserModule {}
