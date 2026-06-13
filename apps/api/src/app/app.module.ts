import { Module } from '@nestjs/common';
import { PersonModule } from './person/person.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PersonModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
