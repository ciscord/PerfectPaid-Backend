import { Injectable } from '@nestjs/common';
import { DefaultAlertSettings } from 'src/common/utils/alert-settings';
import { SplitBillsService } from 'src/split-bills/split-bills.service';
import { TransfersService } from 'src/transfers/transfers.service';
import { AlertSettingsDto } from './dto/alert-settings.dto';
import { AlertSettings } from './entities/alert-settings.entity';
import { Alert, Type } from './entities/alert.entity';
import { merge } from 'lodash';

@Injectable()
export class AlertsService {
  constructor(
    private splitBillService: SplitBillsService,
    private transfersService: TransfersService,
  ) {}

  async getSettings(userId: string) {
    let settings = {};
    const alertSettings = await AlertSettings.findOne({
      user: { id: userId },
    });

    if (alertSettings) {
      for (const key in DefaultAlertSettings) {
        settings[key] = {};
        for (const _key in DefaultAlertSettings[key]) {
          settings[key][_key] = merge(
            DefaultAlertSettings[key][_key],
            alertSettings.settings[key]
              ? alertSettings.settings[key][_key]
              : {},
          );
        }
      }
    } else {
      settings = DefaultAlertSettings;
    }

    return settings;
  }

  async updateSettings(userId: string, alertSettingsDto: AlertSettingsDto) {
    let alertSettings = await AlertSettings.findOne({
      user: { id: userId },
    });

    if (!alertSettings) {
      alertSettings = AlertSettings.create({
        user: {
          id: userId,
        },
        settings: alertSettingsDto,
      });
    }

    alertSettings.settings = alertSettingsDto;
    await alertSettings.save();
    const settings = await this.getSettings(userId);

    return settings;
  }

  async findAll() {
    const actionItems = await Alert.find();

    for (const actionItem of actionItems) {
      switch (actionItem.type) {
        case Type.BillSplitRequest:
        case Type.BillSplitReject:
          actionItem.splitBill = await this.splitBillService.findOne({
            where: {
              id: actionItem.resourceId,
            },
          });
          break;

        case Type.TransferRequest:
        case Type.TransferReject:
          actionItem.transfer = await this.transfersService.findOne({
            where: {
              id: actionItem.resourceId,
            },
            relations: ['to', 'from'],
          });
          break;

        default:
          break;
      }
    }

    return actionItems;
  }
}
