import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookMarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(
        private prisma:PrismaService
    ){}

    getBookmarks(userId: number){
        return this.prisma.bookMark.findMany({
            where: {
                userId
            }
        })
    }

    getBookmarkById(
        userId: number, 
        bookmarkId:number){
            return this.prisma.bookMark.findFirst({
                where: {
                    id: bookmarkId,
                    userId
                }
            })
        
    }

    async createBookmark(
        userId:number, 
        dto:CreateBookmarkDto){
        const bookMark = await this.prisma.bookMark.create({
            data:{userId,
            ...dto
            }
        })
        return bookMark
    }

    async editBookmarkbyId(
        userId: number, 
        bookmarkId: number,
        dto: EditBookMarkDto){
        const bookmark = await this.prisma.bookMark.findUnique({
            where:{
                id: bookmarkId
            }
        })
        if(!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Access to resouces denied')
        
            return this.prisma.bookMark.update({
                where: {
                    id: bookmarkId,
                },
                data: {
                    ...dto
                }
            })
    }

    async deleteBookmarkbyId(
        userId:number, 
        bookmarkId: number){
        const bookmark = await this.prisma.bookMark.findUnique({
            where:{
                id: bookmarkId
            }
        })
        if(!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Access to resouces denied')
        
            await this.prisma.bookMark.delete({
                where: {
                    id: bookmarkId
                }
            })
    }
}
