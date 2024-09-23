import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  password: string

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role
}
