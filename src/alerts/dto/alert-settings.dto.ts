import { Type } from 'class-transformer';
import { IsBoolean, IsObject, ValidateNested } from 'class-validator';

class Setting {
  name: string;

  @IsBoolean()
  email: boolean;

  @IsBoolean()
  text: boolean;

  @IsBoolean()
  alerts: boolean;
}

class RequestsAndInvitationSettings {
  @IsObject()
  @ValidateNested()
  @Type(() => Setting)
  newRequestsForBillSplitsOrTransfers: Setting;
}

export class AlertSettingsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => RequestsAndInvitationSettings)
  requestsAndInvitations: RequestsAndInvitationSettings;
}
