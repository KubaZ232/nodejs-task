import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ length: 300 }) title!: string;

  @Column('int') width!: number;

  @Column('int') height!: number;

  @Column('text') url!: string;

  @CreateDateColumn() createdAt!: Date;
}
