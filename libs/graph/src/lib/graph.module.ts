// libs/graph/src/lib/graph.module.ts
import { Module } from '@nestjs/common';
import { GremlinService } from './gremlin.service';

@Module({
  providers: [GremlinService],
  exports: [GremlinService],
})
export class GraphModule { }