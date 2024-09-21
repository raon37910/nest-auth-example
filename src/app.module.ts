import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoggerMiddleware } from './common/logger.middleware'
import { UsersModule } from './users/users.module'
import {
  DATABASE_CONFIGURATION,
  PostGresqlConfigProvider,
} from './common/configuration/db.configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      ...DATABASE_CONFIGURATION,
    }),
    UsersModule,
    // TODO 이 부분이 개선 되어야 함
    TypeOrmModule.forRootAsync({ useClass: PostGresqlConfigProvider }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
