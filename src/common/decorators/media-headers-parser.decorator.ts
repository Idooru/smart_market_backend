import { createParamDecorator, ArgumentsHost } from "@nestjs/common";
import { Request } from "express";

export const MediaHeadersParser = createParamDecorator((data: string, context: ArgumentsHost): string[] => {
  const req = context.switchToHttp().getRequest() as Request;
  const headers = req.headers[data] as string;
  return headers.split(", ");

  // return Object.entries(req.header)
  //   .filter((MediaHeader: MediaHeaders) => MediaHeader[0].includes(data))
  //   .map((MediaHeader: MediaHeaders) => ({
  //     id: MediaHeader[1].id,
  //     whatHeader: MediaHeader[0],
  //     url: MediaHeader[1].url,
  //     fileName: MediaHeader[1].fileName,
  //   }));
});
