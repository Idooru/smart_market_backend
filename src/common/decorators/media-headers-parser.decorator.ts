import { createParamDecorator, ArgumentsHost } from "@nestjs/common";
import { Request } from "express";
import { MediaHeader, MediaHeaders } from "../types/media-headers";

export const MediaHeadersParser = createParamDecorator((data: string, context: ArgumentsHost): Array<MediaHeader> => {
  const req = context.switchToHttp().getRequest() as Request;

  return Object.entries(req.header)
    .filter((MediaHeader: MediaHeaders) => MediaHeader[0].includes(data))
    .map((MediaHeader: MediaHeaders) => ({
      id: MediaHeader[1].id,
      whatHeader: MediaHeader[0],
      url: MediaHeader[1].url,
      fileName: MediaHeader[1].fileName,
    }));
});
