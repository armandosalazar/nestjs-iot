import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('NestJS API IoT Documentation')
    .setDescription('The NestJS API IoT Documentation for the IoT project.')
    .setVersion('1.0')
    .addTag('IoT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
