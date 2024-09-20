import { Injectable, NestMiddleware } from '@nestjs/common'
import { LoggerService } from './winston.logger'

import { Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: () => void) {
    const loggerService = new LoggerService(
      req.url.slice(1).split('/')[req.url.slice(1).split('/').length - 1], // TODO 요것은 무슨 코드인고
    )
    // TODO 로깅 데이터 형식은 조금 더 고민 후 수정 필요
    const tempUrl = req.method + ' ' + req.url.split('?')[0]
    const _headers = req.headers ? req.headers : {}
    const _query = req.query ? req.query : {}
    const _body = req.body ? req.body : {}
    const _url = tempUrl ? tempUrl : {}

    loggerService.log(
      JSON.stringify({
        url: _url,
        headers: _headers,
        query: _query,
        body: _body,
      }),
    )

    next()
  }
}
