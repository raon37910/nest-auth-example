import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoggerMiddleware } from './common/logger.middleware'
import { UsersModule } from './users/users.module'
import { PostGresqlConfigProvider } from './common/configuration/db.configuration'
import { AuthModule } from './auth/auth.module'
import { CONFIGURATION } from './common/configuration/env.validation'
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
      validationSchema: CONFIGURATION,
    }),
    UsersModule,
    // TODO 이 부분이 개선 되어야 함
    TypeOrmModule.forRootAsync({ useClass: PostGresqlConfigProvider }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*')
  }
}
