import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isEmpty } from 'lodash';
import { ConnectionsQueryTypes } from 'src/common/utils/connections';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Brackets, FindConditions, In, ObjectLiteral } from 'typeorm';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { FindConnectionsDto } from './dto/find-connections.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { Connection, Status } from './entities/connection.entity';

const NoConnectioStatus = 'no_connection';

@Injectable()
export class ConnectionsService {
  constructor(private readonly usersService: UsersService) {}

  async create(currentUser: User, createConnectionDto: CreateConnectionDto) {
    let connection: Connection;
    let existingConnection: Connection;

    if (createConnectionDto.userId) {
      const invitedUser = await this.usersService.findOneOrFail({
        where: {
          id: createConnectionDto.userId,
        },
      });

      existingConnection = await this.findConnection({
        ...this.internalUserIdFindOptions(currentUser, invitedUser),
      });

      if (!existingConnection) {
        connection = await Connection.create({
          ...this.internalUserIdFindOptions(currentUser, invitedUser),
          senderUser: currentUser,
          invitedUser,
          status: Status.Pending,
        }).save();
      }
    } else {
      const receiver = createConnectionDto.email || createConnectionDto.phone;
      existingConnection = await this.findConnection({
        senderUser: currentUser,
        receiver,
      });

      if (!existingConnection) {
        const connections = await this.find(currentUser, {
          search: receiver,
        });

        // For the case where they create a connection to a user which matches
        // a phoneNumber or email
        if (
          connections.length === 1 &&
          connections[0].user &&
          connections[0].status === NoConnectioStatus
        ) {
          return this.create(currentUser, {
            preferredName: createConnectionDto.preferredName,
            userId: connections[0].user.id,
          });
        }

        connection = await Connection.create({
          senderUser: currentUser,
          preferredName: createConnectionDto.preferredName,
          receiver,
        }).save();
      }
    }

    if (existingConnection) {
      const { status } = existingConnection;

      switch (status) {
        case Status.Accepted:
          throw new BadRequestException(
            `You are already connected to this user.`,
          );
          break;

        case Status.Blocked:
          throw new BadRequestException(
            `This user has blocked connections attempts for you.`,
          );
          break;

        case Status.Pending:
          throw new BadRequestException(
            `There is already a pending connection request for this user.`,
          );
          break;

        default:
          break;
      }
    }

    // We want to returned the mapped connection and we remove the sender
    // user so it does not get assigned to the user prop in the mapped object
    const { senderUser, ...remainingConnectionProps } = connection;
    return this.mapConnectionsToCustomObject([
      remainingConnectionProps as Connection,
    ])[0];
  }

  findConnectionOrFail(user1: User, user2: User, status: Status) {
    return this.findConnection(
      {
        ...this.internalUserIdFindOptions(user1, user2),
        status,
      },
      true,
    );
  }

  findConnection(
    findConditions: FindConditions<Connection> = {},
    failIfNotFound = false,
  ) {
    return failIfNotFound
      ? Connection.findOneOrFail(findConditions)
      : Connection.findOne(findConditions);
  }

  internalUserIdFindOptions(user1: User, user2: User) {
    return {
      userOneId:
        user1.internalId < user2.internalId
          ? user1.internalId
          : user2.internalId,
      userTwoId:
        user1.internalId < user2.internalId
          ? user2.internalId
          : user1.internalId,
    };
  }

  findOneAcceptedOrPendingConnectionWithUser(
    connectionId: number,
    user: User,
  ): Promise<Connection> {
    const status = In([Status.Accepted, Status.Pending]);

    return Connection.findOne({
      where: [
        {
          id: connectionId,
          userOneId: user.internalId,
          status,
        },
        {
          id: connectionId,
          userTwoId: user.internalId,
          status,
        },
      ],
      relations: ['senderUser', 'invitedUser'],
    });
  }

  async find(user: User, findConnectionsDto: FindConnectionsDto) {
    const { search, type, ...remainingQuery } = findConnectionsDto;
    let connections = [];

    if (!type || type === ConnectionsQueryTypes.Sent) {
      const sentConnections = await this.searchConnections(
        user,
        { search, ...remainingQuery },
        'senderUser',
        'invitedUser',
      );
      connections = [...sentConnections];
    }

    if (!type || type === ConnectionsQueryTypes.Received) {
      const receivedConnections = await this.searchConnections(
        user,
        { search, ...remainingQuery },
        'invitedUser',
        'senderUser',
      );
      connections = [...connections, ...receivedConnections];
    }

    const mappedConnections = this.mapConnectionsToCustomObject(connections);

    if (mappedConnections.length === 0 && isEmpty(remainingQuery)) {
      const user = await User.createQueryBuilder('user')
        .select([
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.username',
          'user.picture',
        ])
        .where('email = :search')
        .orWhere('username = :search')
        .orWhere('phone = :phone')
        .setParameters({
          search,
          phone: `+1${search}`,
        })
        .getOne();

      return user
        ? [
            {
              status: NoConnectioStatus,
              user,
            },
          ]
        : [];
    }

    return mappedConnections;
  }

  searchConnections(
    user: User,
    findConnectionsDto: FindConnectionsDto,
    userColumn: 'invitedUser' | 'senderUser',
    joinColumn: 'invitedUser' | 'senderUser',
  ) {
    const { search, status, ...remainingQuery } = findConnectionsDto;
    const findConditions: ObjectLiteral = {
      ...remainingQuery,
    };
    findConditions[userColumn] = user;

    if (status) {
      findConditions.status = In(findConnectionsDto.status.split(','));
    }

    let connectionQueryBuilder = Connection.createQueryBuilder('connection')
      .select([
        'connection.id',
        'connection.preferredName',
        'connection.receiver',
        'connection.status',
      ])
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.picture',
      ])
      .leftJoin(`connection.${joinColumn}`, 'user')
      .where(findConditions);

    if (search) {
      connectionQueryBuilder = connectionQueryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email like :search')
            .orWhere('user.username like :search')
            .orWhere('user.phone like :phone')
            .orWhere('user.firstName like :search')
            .orWhere('user.lastName like :search')
            .orWhere('connection.receiver like :search');
        }),
      );
    }

    return connectionQueryBuilder
      .setParameter('phone', `+1${search}`)
      .setParameter('search', `${search}%`)
      .getMany();
  }

  mapConnectionsToCustomObject(connections: Connection[]) {
    return connections.map((connection) => ({
      id: connection.id,
      preferredName: connection.preferredName,
      receiver: connection.receiver,
      status: connection.status,
      user: connection.invitedUser || connection.senderUser,
    }));
  }

  async updateConnection(
    user: User,
    connectionId: number,
    updateConnectionDto: UpdateConnectionDto,
  ) {
    const connection = await Connection.findOneOrFail({
      id: connectionId,
      invitedUser: user,
    }).catch(() => {
      throw new NotFoundException('Connection not found.');
    });

    connection.status = updateConnectionDto.status;
    await connection.save();

    return connection;
  }
}
