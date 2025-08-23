import { IQuery } from "@nestjs/cqrs";

export class FindProductAutocompleteQuery implements IQuery {
  constructor(public readonly keyword: string) {}
}
