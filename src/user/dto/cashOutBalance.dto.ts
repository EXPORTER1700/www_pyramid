import { Min } from 'class-validator';

export class CashOutBalanceDto {
  @Min(0)
  amount: number;
}
