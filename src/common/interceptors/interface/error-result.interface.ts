export class ErrorResultInterface<T> {
  error: string;
  statusCode: number;
  message: string;
  reason?: T;
}
