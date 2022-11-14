import { Min } from 'class-validator';

export class ReplenishBalanceDto {
  @Min(0)
  amount: number;
}
