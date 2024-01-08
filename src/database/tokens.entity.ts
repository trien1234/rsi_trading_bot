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
}

// xuống dưới 35 và rsi < ema < wma lưu vào DB và lưu time sẽ check lại lần tới
// check nếu có rồi thì k lưu nữa
// nếu đi qua 12 nến mà rsi < 50 thì ok
