import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { describe } from 'node:test';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookMarkDto } from 'src/bookmark/dto';


describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(); // Use the outer-scoped variable
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );
    
    await app.init();
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => { 
    const dto: AuthDto = {
      email:'vlad@gmail.com',
      password:'123'
    }
    describe('signUp', () => { 
      it('should throw if email empty',  () => {
        return pactum
        .spec()
        .post('/auth/signup',
        ).withBody({
          password: dto.password
        })
        .expectStatus(400)
        // .inspect();
      })
      it('should throw if password empty',  () => {
        return pactum
        .spec()
        .post('/auth/signup',
        ).withBody({
          email: dto.email 
        })
        .expectStatus(400)
      })
      it('should throw if no body provided',  () => {
        return pactum
        .spec()
        .post('/auth/signup',
        )
        .expectStatus(400)
      })
      it("should signup", () => {
        return pactum
        .spec()
        .post('/auth/signup',
        ).withBody(dto)
        .expectStatus(201)
      })
    })
    ;

    describe('signIn', () => { 
      it('should throw if email empty',  () => {
        return pactum
        .spec()
        .post('/auth/signin',
        ).withBody({
          password: dto.password
        })
        .expectStatus(400)
      })
      it('should throw if password empty',  () => {
        return pactum
        .spec()
        .post('/auth/sigin',
        ).withBody({
          email: dto.email 
        })
        .expectStatus(404)
      })
      it('should throw if no body provided',  () => {
        return pactum
        .spec()
        .post('/auth/signin',
        )
        .expectStatus(400)
      })
      it("should sign in",  () => {
        return pactum
        .spec()
        .post('/auth/signin',
        ).withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', () => { 
    describe('Get me', () => { 
      it('should get current user', () => {
        return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        })
      })

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Vladimir',
          email: 'vlad@codewithvlad.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      });
    });


  })

  describe('Bookmarks', () => { 
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => { 
      const dto: CreateBookmarkDto = {
        title:"First Bookmark",
        link: "http://www.youtube.com",
      }
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId','id' )
          .inspect()
      });
    })

    describe('Get Bookmarks', () => { 
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
      });
    })

    describe('Get bookmarks by id', () => { 
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')

      });
    })

    describe('Edit bookmark by id', () => { 
      const dto: EditBookMarkDto = {
        title: "THIS IS IT",
        description: "Here we are again",
      }
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)

      });
    })

    describe('delete bookmarks', () => { 
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })

});
