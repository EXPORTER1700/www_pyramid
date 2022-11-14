import { UserEntity } from '@app/user/user.entity';

export type UserResponseType = Omit<UserEntity, 'password' | 'hashPassword'> & {
  token: string;
};
