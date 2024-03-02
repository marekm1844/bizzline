import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const port = process.env.PORT || 3000;

  app.use(helmet());
  app.use(compression());
  app.enableCors();

  // Swagger setup for API documentation in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Bizzline API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  }

  app.setGlobalPrefix(globalPrefix);

  const server = await app.listen(port, () => {
    Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
  });

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      Logger.log(`Received ${signal}, closing the application.`);
      await server.close();
      await mongoose.disconnect();
      Logger.log('HTTP server closed.');
      process.exit(0);
    });
  });
}
bootstrap();
