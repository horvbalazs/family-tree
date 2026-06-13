import { Injectable } from "@nestjs/common";
import { GremlinService } from "@org/graph";

@Injectable()
export class HealthService {
  constructor(private readonly gremlin: GremlinService) {
  }

  async healthCheck() {
    return this.gremlin.healthCheck();
  }
}