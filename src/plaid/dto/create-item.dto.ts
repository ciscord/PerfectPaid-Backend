import { User } from '../../users/entities/user.entity';

export class CreateItemDto {
  plaidAccessToken: string;
  plaidItemId: string;
  plaidInstitutionId: string;
  status: string;
  user: User;
}
