import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class Auth0Service {
  signUp(email, password) {
    return axios.post(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        password,
        connection: 'Username-Password-Authentication',
      },
    );
  }
}
