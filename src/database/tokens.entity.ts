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
