import { BadRequestException, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Auth0SignUpResponse } from './interfaces/auth0-sign-up-response.interface';

const axiosClient = axios.create({
  baseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

@Injectable()
export class AuthService {
  async changePassword(changePasswordDto: ChangePasswordDto) {
    await this.auth0PostRequest(
      '/dbconnections/change_password',
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email: changePasswordDto.email,
        connection: process.env.AUTH0_CONNECTION,
      },
      'Bad change password request.',
    );
  }

  login(loginDto: LoginDto) {
    return this.auth0PostRequest(
      '/oauth/token',
      {
        grant_type: 'password',
        scope: 'openid profile email',
        username: loginDto.email,
        password: loginDto.password,
        audience: process.env.AUTH0_AUDIENCE,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
      },
      'Bad login.',
    );
  }

  signUp(email: string, password: string): Promise<Auth0SignUpResponse> {
    return this.auth0PostRequest(
      '/dbconnections/signup',
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        connection: 'Username-Password-Authentication',
        email,
        password,
      },
      'Bad sign up.',
    );
  }

  private async auth0PostRequest(
    url: string,
    body: any,
    generalExceptionMessage: string,
  ) {
    let response: AxiosResponse<any>;

    try {
      response = await axiosClient.post(url, body);
    } catch (e) {
      if (e.response) {
        let message = generalExceptionMessage;

        if (e.response.data?.description) {
          message = e.response.data.description;
        } else if (e.response.data?.error) {
          message = e.response.data.error_description;
        }

        throw new BadRequestException(message);
      } else {
        throw new BadRequestException(generalExceptionMessage);
      }
    }

    return response.data;
  }
}
