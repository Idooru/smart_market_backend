import { UserRole } from "../../user/types/user-role.type";

export interface JwtAccessTokenPayload {
  userId: string;
  email: string;
  nickName: string;
  userRole: UserRole;
  iat?: number;
  exp?: number;
}
