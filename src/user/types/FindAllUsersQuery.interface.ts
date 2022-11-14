import { UserRolesEnum } from '@app/user/types/userRoles.enum';

export interface FindAllUsersQueryInterface {
  username: string;
  email: string;
  role: UserRolesEnum;
  limit: number;
  offset: number;
  inviter: string;
}
