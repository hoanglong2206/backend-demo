import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { UserNotFoundException } from '@modules/user/domain/exceptions/user-not-found.exception';
import { UserProfileOutput } from '../create-user/create-user.dto';
import { GetUserInput, GetUserOutput } from './get-user.dto';

/**
 * Use-case: Retrieve a user profile by ID.
 *
 * Fetches the UserProfile aggregate from the repository and maps it
 * to the output DTO. Throws a domain exception if not found.
 */
@Injectable()
export class GetUserHandler {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    // 1. Find the user profile
    const userProfile = await this.userProfileRepo.findById(input.id);
    if (!userProfile || userProfile.isDeleted()) {
      throw new UserNotFoundException();
    }

    // 2. Build response
    const user = new UserProfileOutput();
    user.id = userProfile.id;
    user.username = userProfile.username.value;
    user.fullName = userProfile.fullName.value;
    user.avatarUrl = userProfile.avatarUrl.value;
    user.createdAt = userProfile.createdAt.toISOString();
    user.updatedAt = userProfile.updatedAt.toISOString();

    const output = new GetUserOutput();
    output.user = user;
    return output;
  }
}
