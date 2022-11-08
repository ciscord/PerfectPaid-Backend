import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AlertsService } from './alerts.service';
import { AlertSettingsDto } from './dto/alert-settings.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(AuthGuard())
  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @UseGuards(AuthGuard())
  @Get('settings')
  getSettings(@UserId() userId: string) {
    return this.alertsService.getSettings(userId);
  }

  @UseGuards(AuthGuard())
  @Put('settings')
  updateSettings(
    @UserId() userId: string,
    @Body() alertSettingsDto: AlertSettingsDto,
  ) {
    return this.alertsService.updateSettings(userId, alertSettingsDto);
  }
}
