import { Injectable } from '@nestjs/common';
import { AllStatisticResponseInterface } from '@app/statistic/types/allStatisticResponse.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Not, Repository } from 'typeorm';
import { UserRolesEnum } from '@app/user/types/userRoles.enum';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async getAll(): Promise<AllStatisticResponseInterface> {
    const allUsers = await this.userRepository.find({
      where: { role: Not(UserRolesEnum.ADMIN) },
    });
    const allUsersCount = allUsers.length;
    const allAmount = allUsers.reduce((acc, user) => acc + user.balance, 0);
    const usersCount = allUsers.filter(
      (user) => user.role === UserRolesEnum.USER,
    ).length;
    const investorsCount = allUsers.filter(
      (user) => user.role === UserRolesEnum.INVESTOR,
    ).length;

    return {
      allAmount,
      allUsersCount,
      investorsCount,
      usersCount,
    };
  }
}
