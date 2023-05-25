import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { GalleryEntity } from "./gallery.entity";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    name!: string

    @ManyToMany(() => GalleryEntity, (gallery) => gallery.tags)
    galleries: GalleryEntity[]
}
