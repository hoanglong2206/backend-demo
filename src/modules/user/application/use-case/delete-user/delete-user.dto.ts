import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserInput {
  @IsString()
  @IsNotEmpty()
  id: string = '';
}

export class DeleteUserOutput {
  message: string = '';
}
