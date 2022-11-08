import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  NestFactory.createApplicationContext(SeedModule)
    .then(async (appContext) => {
      const seeder = appContext.get(SeedService);
      try {
        await seeder.createUser();
        await seeder.createCategory();
        await seeder.createTransactionSerious();
        await seeder.createTransaction();
        appContext.close();
      } catch (e) {
        console.error('Seeding failed!');
        throw e;
      }
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
