import { Injectable } from "@nestjs/common";
import { CreateAccountDto } from "../../../dtos/request/create-account.dto";
import { DeleteAccountDto } from "../../../dtos/request/delete-account.dto";
import { AccountService } from "../services/account.service";

@Injectable()
export class AccountTransactionContext {
  constructor(private readonly accountService: AccountService) {}

  public async createAccount(dto: CreateAccountDto): Promise<void> {
    const account = await this.accountService.createAccount(dto);
    if (dto.body.isMainAccount) {
      await this.setMainAccount(account.id, dto.user.id);
    }
  }

  public async deleteAccount(dto: DeleteAccountDto): Promise<void> {
    const { account, excludeAccounts, userId } = dto;
    await this.accountService.deleteAccount(account.id);

    if (account.isMainAccount) {
      const latestAccount = excludeAccounts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).at(-1);
      await this.setMainAccount(latestAccount.id, userId);
    }
  }

  public async setMainAccount(accountId: string, userId: string) {
    await this.accountService.disableAllAccount(userId);
    await this.accountService.setMainAccount(accountId);
  }
}
