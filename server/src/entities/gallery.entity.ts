import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./category.entity";
import { Tag } from "./tag.entity";

@Entity()
export class GalleryEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    dir: string

    @Column()
    zipFilename: string

    @UpdateDateColumn()
    updatedDate?: Date

    @Column({ unique: true })
    gid: number

    @Column()
    token: string

    @Column()
    title: string

    @Column()
    titleJpn: string

    @ManyToOne(() => Category, { nullable: false, eager: true })
    category: Category

    @Column()
    uploader: string

    @Column()
    postedDate: Date

    @Column()
    fileCount: number

    @Column()
    fileSize: number

    @Column()
    expunged: boolean

    @Column()
    rating: number

    @Column()
    torrentCount: number

    @ManyToMany(() => Tag, (tag) => tag.galleries, { eager: true })
    @JoinTable()
    tags: Tag[]
}
