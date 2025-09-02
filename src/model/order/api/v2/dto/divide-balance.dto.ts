export class DivideBalanceDto {
  public balances: { userId: string; balance: number }[];
  public totalPrices: { userId: string; totalPrice: number }[];
}
