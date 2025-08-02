import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { JwtException } from "../errors/jwt.exception";
import { Response } from "express";
import { JwtError } from "../errors/jwt.error";
import { loggerFactory } from "../functions/logger.factory";
import { Implemented } from "../decorators/implemented.decoration";
import {
  InvalidAccessToken,
  InvalidRefreshToken,
  ExpiredAccessToken,
  ExpiredRefreshToken,
  InvalidJwtPayload,
  JwtExceptionMessageGenerator,
} from "../../model/auth/jwt/jwt-exception-followup";
import { ResponseHandler } from "../lib/handler/response.handler";

@Catch(JwtException)
export class JwtExceptionFilter implements ExceptionFilter {
  private jwtExceptionMap: Record<string, new () => JwtExceptionMessageGenerator> = {
    "invalid token:access_token": InvalidAccessToken,
    "invalid token:refresh_token": InvalidRefreshToken,
    "invalid signature:access_token": InvalidAccessToken,
    "invalid signature:refresh_token": InvalidRefreshToken,
    "jwt expired:access_token": ExpiredAccessToken,
    "jwt expired:refresh_token": ExpiredRefreshToken,
  };

  constructor(private readonly responseHandler: ResponseHandler) {}

  @Implemented()
  public catch(exception: JwtException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { error } = exception.getResponse() as JwtException;

    const generator = this.jwtExceptionMessageGeneratorFactory(error);
    const message = this.generateResponseMessage(generator);
    loggerFactory(error.name).error(message);

    return this.responseHandler.responseError(res, exception.stack, {
      error: error.name,
      statusCode: error.status,
      message,
    });
  }

  public jwtExceptionMessageGeneratorFactory(error: JwtError) {
    const key = `${error.message}:${error.whatToken}`;
    const ExceptionClass = this.jwtExceptionMap[key] || InvalidJwtPayload;
    return new ExceptionClass();
  }

  public generateResponseMessage(generator: JwtExceptionMessageGenerator): string {
    return generator.generate();
  }
}
