import { Module } from "@nestjs/common";
import { PersonService } from "./person.service";
import { PersonController } from "./person.controller";
import { GraphModule } from "@org/graph";

@Module({
  providers: [PersonService],
  controllers: [PersonController],
  imports: [GraphModule],
})
export class PersonModule { }