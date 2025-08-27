import { BaseEntity, SelectQueryBuilder } from "typeorm";
import { loggerFactory } from "../../functions/logger.factory";
import { InternalServerErrorException } from "@nestjs/common";
import { FindOptionalEntityArgs, FindPureEntityArgs } from "../../interfaces/search/search.repository";

export abstract class CommonFindEntity<T> {
  public joinEntity(entities: (typeof BaseEntity)[], query: SelectQueryBuilder<T>, select: string): void {
    const targetEntity = `${select.charAt(0).toUpperCase() + select.slice(1)}Entity`;
    entities.forEach((entity) => {
      const entityName = entity.name.replace("Entity", "");
      try {
        query.leftJoinAndSelect(`${select}.${entityName}`, entityName);
      } catch (err) {
        if (err.message.includes("entity was not found")) {
          const message = `${entityName}Entity는 ${targetEntity}와 연간관계가 없습니다.`;
          loggerFactory(`None Relation With ${targetEntity}`).error(message);
          throw new InternalServerErrorException(message);
        } else {
          const message = err.message;
          loggerFactory("Unexpected Exception").error(message);
          throw new InternalServerErrorException(message);
        }
      }
    });
  }

  public getEntity(getOne: boolean, query: SelectQueryBuilder<T>): Promise<T | T[]> {
    return getOne ? query.getOne() : query.getMany();
  }

  public abstract findPureEntity(args: FindPureEntityArgs): Promise<T | T[]>;
  public abstract findOptionalEntity(args: FindOptionalEntityArgs): Promise<T | T[]>;
}
