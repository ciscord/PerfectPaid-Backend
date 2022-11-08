import * as faker from 'faker';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

const userSeed = [];
faker.setLocale('en_US');

export const generatorUserSeed = (count: number): Array<UpdateUserDto> => {
  for (let i = 0; i < count; i++) {
    const userData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: `+1${faker.phone.phoneNumberFormat().replace(/-/gi, '')}`,
      address1: faker.address.streetAddress(),
      address2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      ssn: '9999',
      postalCode: faker.address.zipCode().split('-')[0],
      dob: '1970-09-09',
    };
    userSeed.push(userData);
  }
  return userSeed;
};
