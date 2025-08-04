import { Injectable } from "@nestjs/common";
import { UserService } from "../../services/user.service";
import { RegisterUserDto } from "../../dto/request/register-user.dto";
import { ModifyUserDto } from "../../dto/request/modify-user.dto";
import { AuthService } from "../../../auth/services/auth.service";

@Injectable()
export class UserTransactionContext {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  public async register(dto: RegisterUserDto): Promise<void> {
    const user = await this.userService.createUserEntity(dto.role);
    dto.password = await this.authService.hashPassword(dto.password, true);
    await this.userService.createUserBase(user, dto);
  }

  public async modifyUser(dto: ModifyUserDto): Promise<void> {
    await this.userService.modifyUser(dto);
  }
}
