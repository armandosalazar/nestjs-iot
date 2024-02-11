import { Controller, Get } from '@nestjs/common';

@Controller('iot')
export class IotController {
  @Get()
  getHello(): string {
    return 'Hello IoT!';
  }
}
