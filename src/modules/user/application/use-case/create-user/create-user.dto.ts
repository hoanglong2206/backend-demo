import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  id: string = '';

  @IsString()
  @IsNotEmpty()
  username: string = '';

  @IsString()
  @IsNotEmpty()
  fullName: string = '';

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class UserProfileOutput {
  id: string = '';
  username: string = '';
  fullName: string = '';
  avatarUrl: string | null = null;
  createdAt: string = '';
  updatedAt: string = '';
}

export class CreateUserOutput {
  user: UserProfileOutput = new UserProfileOutput();
}
