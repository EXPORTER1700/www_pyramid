import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserRolesEnum } from '@app/user/types/userRoles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();

    if (request?.user?.role === UserRolesEnum.ADMIN) {
      return true;
    }

    throw new HttpException('No rights', HttpStatus.FORBIDDEN);
  }
}
