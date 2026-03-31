import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { UserNotFoundException } from '@modules/user/domain/exceptions/user-not-found.exception';
import { UsernameTakenException } from '@modules/user/domain/exceptions/username-taken.exception';
import { Username } from '@modules/user/domain/value-objects/username.vo';
import { FullName } from '@modules/user/domain/value-objects/full-name.vo';
import { AvatarUrl } from '@modules/user/domain/value-objects/avatar-url.vo';
import { UserProfileOutput } from '../create-user/create-user.dto';
import { UpdateUserInput, UpdateUserOutput } from './update-user.dto';

/**
 * Use-case: Update an existing user profile.
 *
 * Applies the provided field updates to the UserProfile aggregate,
 * enforcing domain rules (uniqueness, validation). Only supplied
 * fields are changed.
 */
@Injectable()
export class UpdateUserHandler {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    // 1. Find the user profile
    const userProfile = await this.userProfileRepo.findById(input.id);
    if (!userProfile || userProfile.isDeleted()) {
      throw new UserNotFoundException();
    }

    // 2. Apply username update if provided
    if (input.username !== undefined) {
      const usernameResult = Username.create(input.username);
      if (usernameResult.isFailure()) {
        throw new ConflictException(usernameResult.getError());
      }
      const username = usernameResult.getValue();

      const taken = await this.userProfileRepo.existsByUsername(username);
      if (taken && !userProfile.username.equals(username)) {
        throw new UsernameTakenException();
      }

      userProfile.updateUsername(username);
    }

    // 3. Apply full name update if provided
    if (input.fullName !== undefined) {
      const fullNameResult = FullName.create(input.fullName);
      if (fullNameResult.isFailure()) {
        throw new ConflictException(fullNameResult.getError());
      }
      userProfile.updateFullName(fullNameResult.getValue());
    }

    // 4. Apply avatar URL update if provided
    if (input.avatarUrl !== undefined) {
      const avatarUrlResult = AvatarUrl.create(input.avatarUrl);
      if (avatarUrlResult.isFailure()) {
        throw new ConflictException(avatarUrlResult.getError());
      }
      userProfile.updateAvatarUrl(avatarUrlResult.getValue());
    }

    // 5. Persist changes
    await this.userProfileRepo.update(userProfile);

    // 6. Build response
    const user = new UserProfileOutput();
    user.id = userProfile.id;
    user.username = userProfile.username.value;
    user.fullName = userProfile.fullName.value;
    user.avatarUrl = userProfile.avatarUrl.value;
    user.createdAt = userProfile.createdAt.toISOString();
    user.updatedAt = userProfile.updatedAt.toISOString();

    const output = new UpdateUserOutput();
    output.user = user;
    return output;
  }
}
