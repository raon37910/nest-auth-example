import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { User } from 'src/users/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken)

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    })

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!')
    }

    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>('HASH_ROUNDS'),
    )

    await this.userRepository.save({
      email,
      password: hash,
    })

    return this.userRepository.findOne({
      where: {
        email,
      },
    })
  }

  parseBasicToken(rawToken: string) {
    /// 1) 토큰을 ' ' 기준으로 스플릿 한 후 토큰 값만 추출하기
    /// ['Basic', $token]
    const [basic, token] = rawToken.split(' ')

    if (!basic || !token || basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!')
    }

    /// 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
    const decoded = Buffer.from(token, 'base64').toString('utf-8')

    /// "email:password"
    /// [email, password]
    const [email, password] = decoded.split(':')

    if (!email || !password) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!')
    }

    return {
      email,
      password,
    }
  }
}
