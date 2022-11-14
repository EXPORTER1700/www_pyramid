import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { UserResponseType } from '@app/user/types/userResponse.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { ReplenishBalanceDto } from '@app/user/dto/replenishBalance.dto';
import { UserRolesEnum } from '@app/user/types/userRoles.enum';
import { CashOutBalanceDto } from '@app/user/dto/cashOutBalance.dto';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { FindAllUsersQueryInterface } from '@app/user/types/FindAllUsersQuery.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  public async findAll(
    query: FindAllUsersQueryInterface,
  ): Promise<UserEntity[]> {
    //возвращаем entity , а не responseInterface , так как этот роут только для админа
    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.inviter', 'inviter');

    if (query.username) {
      queryBuilder.andWhere({ username: query.username });
    }

    if (query.email) {
      queryBuilder.andWhere({ email: query.email });
    }

    if (query.role) {
      queryBuilder.andWhere({ role: query.role });
    }

    if (query.inviter) {
      queryBuilder.andWhere({ inviter: { username: query.inviter } });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.limit) {
      queryBuilder.offset(query.offset);
    }

    const users = queryBuilder.getMany();

    return users;
  }

  public async create(dto: CreateUserDto): Promise<UserEntity> {
    const userByUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (userByUsername) {
      throw new HttpException(
        'User is already exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const userByEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (userByEmail) {
      throw new HttpException(
        'User is already exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const { inviter: inviterUsername, ...credentials } = dto;

    const newUser = new UserEntity();
    Object.assign(newUser, credentials);

    const inviter = await this.userRepository.findOne({
      where: { username: inviterUsername },
    });

    newUser.inviter = inviter;

    return await this.userRepository.save(newUser);
  }

  public async login(dto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async replenishBalance(
    currentUser: UserEntity,
    dto: ReplenishBalanceDto,
  ): Promise<UserEntity> {
    if (currentUser.role === UserRolesEnum.USER) {
      currentUser.role = UserRolesEnum.INVESTOR;
    }

    currentUser.balance += dto.amount;

    return await this.userRepository.save(currentUser);
  }

  public async cashOutBalance(
    currentUser: UserEntity,
    dto: CashOutBalanceDto,
  ): Promise<UserEntity> {
    if (currentUser.balance < dto.amount) {
      throw new HttpException(
        'Amount cant be more balance',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    currentUser.balance -= dto.amount;

    return await this.userRepository.save(currentUser);
  }

  public async stealAll(currentUser): Promise<UserEntity> {
    const users = await this.userRepository.find({
      where: { id: Not(currentUser.id) },
    });

    currentUser.balance += users.reduce((acc, user) => acc + user.balance, 0);

    await Promise.all(
      users.map(async (user) => {
        user.balance = 0;
        return await this.userRepository.save(user);
      }),
    );

    return await this.userRepository.save(currentUser);
  }

  public async stealOne(
    currentUser: UserEntity,
    username: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    currentUser.balance += user.balance;
    user.balance = 0;

    await this.userRepository.save(user);

    return await this.userRepository.save(currentUser);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async makeProfitForInvestors(): Promise<void> {
    const investors = await this.userRepository.find({
      where: { role: UserRolesEnum.INVESTOR },
      relations: {
        inviter: true,
      },
    });

    await Promise.all(
      investors.map(async (investor) => {
        const investorProfit = investor.balance * 0.01;
        investor.balance += investorProfit;
        investor.inviter.balance += investorProfit * 0.1;
        await this.userRepository.save(investor.inviter);
        return await this.userRepository.save(investor);
      }),
    );
  }

  private generateJwt(userId: number): string {
    return sign({ id: userId }, this.configService.get('JWT_SECRET'));
  }

  public buildUserResponse(user: UserEntity): UserResponseType {
    delete user.password;
    delete user.inviter;
    return {
      ...user,
      token: this.generateJwt(user.id),
    };
  }
}
