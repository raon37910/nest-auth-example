import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { Role, User } from 'src/users/user.entity'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken)

    const user = await this.authenticate(email, password)

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    }
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    })

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!')
    }

    return user
  }

  async issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    )
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    )

    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    )
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
