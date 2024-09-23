import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader) {
      next()
      return
    }

    const token = this.validateBearerToken(authorizationHeader)

    try {
      const decodedPayload = this.jwtService.decode(token)

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new UnauthorizedException('잘못된 토큰입니다!')
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? 'REFRESH_TOKEN_SECRET'
          : 'ACCESS_TOKEN_SECRET'

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>(secretKey),
      })

      // 참고: https://day-to-day.tistory.com/10
      req.user = payload
      next()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료 되었습니다!')
    }
  }

  validateBearerToken(rawToken: string) {
    const [bearer, token] = rawToken.split(' ')

    if (bearer.toLowerCase() !== 'bearer' || !token) {
      throw new BadRequestException('토큰 포맷이 잘못 됐습니다!')
    }

    return token
  }
}
