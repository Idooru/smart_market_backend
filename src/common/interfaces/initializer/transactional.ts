export abstract class Transactional<T> {
  abstract initRepository(): void;
  abstract getRepository(): T;
}
