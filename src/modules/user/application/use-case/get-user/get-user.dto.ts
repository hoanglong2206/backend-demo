import { IsNotEmpty, IsString } from 'class-validator';
import { UserProfileOutput } from '../create-user/create-user.dto';

export class GetUserInput {
  @IsString()
  @IsNotEmpty()
  id: string = '';
}

export class GetUserOutput {
  user: UserProfileOutput = new UserProfileOutput();
}
