import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { AdminUserService } from './admin-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: AdminUserService,
    private jwtService: JwtService,
  ) {}

  async signUp(body) {
    try {
      const { dept, email, account, managerName, password, phone, position } =
        body;

      const isEmailExist = await this.userService.existsByEmail(email);

      if (isEmailExist) {
        console.log('isEmailExist', isEmailExist);
        throw new UnauthorizedException('해당하는 이메일은 이미 존재합니다.'); // httpexceptionfilter로 넘어감.
      }

      const isUserExist = await this.userService.existsByUserId(account);
      if (isUserExist) {
        console.log('isUserExist', isUserExist);
        throw new UnauthorizedException('해당하는 유저는 이미 존재합니다.'); // httpexceptionfilter로 넘어감.
      }

      // Hash the users password
      // Generate a salt
      const salt = randomBytes(8).toString('hex');
      console.log(1);

      // Hash the salt and the password together
      const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
      console.log(2);
      // Join the hashed result and the salt together
      const hashedPassword = salt + '.' + hash.toString('hex');

      // phone number parsing

      const cp1 = phone.slice(0, 3);
      const cp2 = phone.slice(3, 7);
      const cp3 = phone.slice(7, 11);
      console.log(cp1, cp2, cp3);
      const user = await this.userService.save({
        dept,
        email,
        account,
        managerName,
        cp1,
        cp2,
        cp3,
        position,
        password: hashedPassword,
      });
      console.log(4);
      console.log(user);

      return { data: user };
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  async jwtLogIn(data) {
    const { account, password } = data;
    console.log(account, password);

    const [user] = await this.userService.find({ account });
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    // * password가 일치하는지
    const [salt, storedHash] = user.password.split('.');

    const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    const payload = {
      uid: user._id,
      account: account,
      nickname: user.managerName,
    };

    return {
      message: 'login successful',
      token: this.jwtService.sign(payload),
    };
  }
}