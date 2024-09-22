import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

@Injectable()
export class PostGresqlConfigProvider implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('DB_TYPE'),
      username: this.configService.get('PG_USER'),
      password: this.configService.get('PG_PASSWORD'),
      database: this.configService.get('PG_DB'),
      port: this.configService.get<number>('PG_PORT'),
      host: this.configService.get('PG_HOST'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    } as any // TODO 수정 필요 타입 여기 왜 타입 에러가 생기는거지?
  }
}
