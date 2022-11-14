import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { UserRolesEnum } from '@app/user/types/userRoles.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: UserRolesEnum, default: UserRolesEnum.USER })
  role: UserRolesEnum;

  @OneToMany(() => UserEntity, (user) => user.inviter)
  invitees: UserEntity[];

  @ManyToOne(() => UserEntity, (user) => user.invitees)
  inviter: UserEntity;
}
