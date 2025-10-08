import { ICommand } from "@nestjs/cqrs";
import { PaymentEntity } from "../../../../../../entities/payment.entity";

export class ConstructResourceCommand implements ICommand {
  constructor(public readonly payments: PaymentEntity[]) {}
}
