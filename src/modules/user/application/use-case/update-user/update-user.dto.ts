import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserProfileOutput } from '../create-user/create-user.dto';

export class UpdateUserInput {
  @IsString()
  @IsNotEmpty()
  id: string = '';

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class UpdateUserOutput {
  user: UserProfileOutput = new UserProfileOutput();
}
