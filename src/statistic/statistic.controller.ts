import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '@app/user/guards/admin.guard';
import { StatisticService } from '@app/statistic/statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get()
  @UseGuards(AdminGuard)
  async getAll() {
    return await this.statisticService.getAll();
  }
}
