import { Injectable, OnModuleDestroy } from '@nestjs/common';
import gremlin from 'gremlin';

const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const __ = gremlin.process.statics;

@Injectable()
export class GremlinService implements OnModuleDestroy {
  private readonly connection = new DriverRemoteConnection(
    process.env.GREMLIN_URL ?? 'ws://localhost:8182/gremlin',
  );

  readonly g = traversal().withRemote(this.connection);

  readonly statics = __;

  async healthCheck() {
    return this.g.inject('pong').next();
  }

  async onModuleDestroy() {
    await this.connection.close();
  }
}