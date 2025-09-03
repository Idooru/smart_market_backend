import { Injectable } from "@nestjs/common";
import { SecurityLibrary } from "../../../../auth/providers/security.library";
import { CatchCallbackFactoryLibrary } from "../../../../../common/lib/util/catch-callback-factory.library";
import bcrypt from "bcrypt";

@Injectable()
export class CommonUserCommandHelper {
  constructor(
    private readonly securityLibrary: SecurityLibrary,
    private readonly callbackFactory: CatchCallbackFactoryLibrary,
  ) {}

  public hashPassword(password: string, hasTransaction: true): Promise<string> {
    return bcrypt
      .hash(password, this.securityLibrary.hashSalt)
      .catch(this.callbackFactory.getCatchHashPasswordFunc(hasTransaction));
  }
}
