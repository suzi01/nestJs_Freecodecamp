import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()// makes service available to all modules in app
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
