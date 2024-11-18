import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  trend: string;

  @Column()
  process: number;

  @Column()
  nextTime: string;

  @Column({ nullable: true })
  '5m': string;

  @Column({ nullable: true })
  '15m': string;

  @Column({ nullable: true })
  '1h': string;

  @Column({ nullable: true })
  '4h': string;

  @Column({ nullable: true })
  '1d': string;

  @Column({ nullable: true })
  '1w': string;

  @Column({ nullable: true })
  'macdOld': string;

  @Column({ nullable: true })
  'macd': string;

  @Column()
  type: string;
}

// xuống dưới 35 và rsi < ema < wma lưu vào DB và lưu time sẽ check lại lần tới
// check nếu có rồi thì k lưu nữa
// nếu đi qua 12 nến mà rsi < 50 thì ok
