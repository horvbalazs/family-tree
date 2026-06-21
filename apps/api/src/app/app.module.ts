import { Module } from '@nestjs/common';
import { PersonModule } from './person/person.module';
import { HealthModule } from './health/health.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [PersonModule, FileModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
