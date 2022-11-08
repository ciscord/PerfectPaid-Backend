import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WPUser } from 'src/common/decorators/wp-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { FindConnectionsDto } from './dto/find-connections.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @UseGuards(AuthGuard())
  @Get()
  find(
    @WPUser() user: User,
    @Query()
    findConnectionsDto: FindConnectionsDto,
  ) {
    return this.connectionsService.find(user, findConnectionsDto);
  }

  @UseGuards(AuthGuard())
  @Post()
  create(
    @WPUser() user: User,
    @Body() createConnectionDto: CreateConnectionDto,
  ) {
    return this.connectionsService.create(user, createConnectionDto);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  updateConnection(
    @WPUser() user: User,
    @Param('id') connectionId: number,
    @Body() updateConnectionDto: UpdateConnectionDto,
  ) {
    return this.connectionsService.updateConnection(
      user,
      connectionId,
      updateConnectionDto,
    );
  }
}
