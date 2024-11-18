import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  trend: string;

  @Column({ nullable: true })
  process: number;

  @Column({ nullable: true })
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
  'macdOld5m': string;

  @Column({ nullable: true })
  'macd5m': string;

  @Column({ nullable: true })
  'macdOld15m': string;

  @Column({ nullable: true })
  'macd15m': string;

  @Column({ nullable: true })
  'macdOld1h': string;

  @Column({ nullable: true })
  'macd1h': string;

  @Column({ nullable: true })
  'macdOld4h': string;

  @Column({ nullable: true })
  'macd4h': string;

  @Column({ nullable: true })
  'macdOld1d': string;

  @Column({ nullable: true })
  'macd1d': string;

  @Column({ nullable: true })
  'macdOld1w': string;

  @Column({ nullable: true })
  'macd1w': string;

  @Column()
  type: string;
}

// xuống dưới 35 và rsi < ema < wma lưu vào DB và lưu time sẽ check lại lần tới
// check nếu có rồi thì k lưu nữa
// nếu đi qua 12 nến mà rsi < 50 thì ok
