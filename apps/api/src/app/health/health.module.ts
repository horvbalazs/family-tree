import { Module } from "@nestjs/common";
import { GraphModule } from "@org/graph";
import { HealthService } from "./health.service";
import { HealthController } from "./health.controller";

@Module({
  imports: [GraphModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule { }