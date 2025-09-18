import { BaseEntity, EntityTarget, Repository, SelectQueryBuilder } from "typeorm";
import { loggerFactory } from "../../functions/logger.factory";
import { InternalServerErrorException } from "@nestjs/common";

export abstract class CommonFindEntityHelper<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  protected joinEntity(entities: (typeof BaseEntity)[], qb: SelectQueryBuilder<T>, aliasName: string): void {
    const targetEntity = `${aliasName.charAt(0).toUpperCase() + aliasName.slice(1)}Entity`;

    entities.forEach((entity) => {
      const entityName = entity.name.replace("Entity", "");
      try {
        qb.leftJoinAndSelect(`${aliasName}.${entityName}`, entityName);
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

  protected findEntity(getOne: boolean, qb: SelectQueryBuilder<T>): Promise<T | T[]> {
    return getOne ? qb.getOne() : qb.getMany();
  }

  protected select(entity: EntityTarget<T>, aliasName: string, selects?: string[]): SelectQueryBuilder<T> {
    const queryBuilder = this.repository.createQueryBuilder();
    if (selects && selects.length) {
      return queryBuilder.select(selects).from(entity, aliasName);
    }
    return queryBuilder.select(aliasName).from(entity, aliasName);
  }
}
