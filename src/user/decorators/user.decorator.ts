import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';

export const User = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

    if (!req.user) {
      return null;
    }

    if (data) {
      return req.user[data];
    }

    return req.user;
  },
);
