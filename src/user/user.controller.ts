import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { UserResponseType } from '@app/user/types/userResponse.type';
import { ReplenishBalanceDto } from '@app/user/dto/replenishBalance.dto';
import { InvestorGuard } from '@app/user/guards/investor.guard';
import { CashOutBalanceDto } from '@app/user/dto/cashOutBalance.dto';
import { AdminGuard } from '@app/user/guards/admin.guard';
import { FindAllUsersQueryInterface } from '@app/user/types/FindAllUsersQuery.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  async findAll(
    @Query() query: FindAllUsersQueryInterface,
  ): Promise<UserEntity[]> {
    return await this.userService.findAll(query);
  }

  @Post('create')
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateUserDto): Promise<UserResponseType> {
    const user = await this.userService.create(dto);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: LoginUserDto): Promise<UserResponseType> {
    const user = await this.userService.login(dto);
    return this.userService.buildUserResponse(user);
  }

  @Post('balance/replenish')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async replenishBalance(
    @User() currentUser: UserEntity,
    @Body() dto: ReplenishBalanceDto,
  ): Promise<UserResponseType> {
    const user = await this.userService.replenishBalance(currentUser, dto);
    return this.userService.buildUserResponse(user);
  }

  @Post('balance/cash-out')
  @UseGuards(InvestorGuard)
  @UsePipes(new ValidationPipe())
  async cashOutBalance(
    @User() currentUser: UserEntity,
    @Body() dto: CashOutBalanceDto,
  ): Promise<UserResponseType> {
    const user = await this.userService.cashOutBalance(currentUser, dto);
    return this.userService.buildUserResponse(user);
  }

  @Put('balance/steal')
  @UseGuards(AdminGuard)
  async stealAll(@User() currentUser: UserEntity): Promise<UserResponseType> {
    const user = await this.userService.stealAll(currentUser);
    return this.userService.buildUserResponse(user);
  }

  @Put('balance/steal/:username')
  @UseGuards(AdminGuard)
  async stealOne(
    @User() currentUser: UserEntity,
    @Param('username') username: string,
  ): Promise<UserResponseType> {
    const user = await this.userService.stealOne(currentUser, username);
    return this.userService.buildUserResponse(user);
  }
}
