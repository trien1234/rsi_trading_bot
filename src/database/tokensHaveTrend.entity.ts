import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'token_have_trend' })
export class TokenHaveTrend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  trend: string;

  @Column()
  process: number;

  @Column()
  time: string;
}
