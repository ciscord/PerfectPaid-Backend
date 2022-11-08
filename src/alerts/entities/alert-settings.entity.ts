import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AlertSettingsDto } from '../dto/alert-settings.dto';

@Entity()
export class AlertSettings extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'jsonb',
  })
  settings: AlertSettingsDto;
}
