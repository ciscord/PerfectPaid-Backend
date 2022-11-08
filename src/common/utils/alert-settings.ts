import { AlertSettingsDto } from 'src/alerts/dto/alert-settings.dto';

// Default values
export const DefaultAlertSettings: AlertSettingsDto = {
  requestsAndInvitations: {
    newRequestsForBillSplitsOrTransfers: {
      name: 'New requests for bill splits or transfers',
      email: true,
      text: true,
      alerts: true,
    },
  },
};
