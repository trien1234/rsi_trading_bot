import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'calendars' })
export class Calendars {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @Column()
  currency: string;

  @Column()
  title: string;

  @Column()
  importance: number;

  @Column()
  timeNoti: number;
}

// xuống dưới 35 và rsi < ema < wma lưu vào DB và lưu time sẽ check lại lần tới
// check nếu có rồi thì k lưu nữa
// nếu đi qua 12 nến mà rsi < 50 thì ok
