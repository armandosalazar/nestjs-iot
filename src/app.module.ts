import { Module } from '@nestjs/common';
import { IotModule } from './iot/iot.module';

@Module({
  imports: [IotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
