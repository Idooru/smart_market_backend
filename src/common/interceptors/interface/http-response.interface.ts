import { ApiResultInterface } from "./api-result.interface";

export class HttpResponseInterface<T> extends ApiResultInterface<T> {
  success: boolean;
}
