import { Injectable } from '@nestjs/common';
import { UserRepository } from '@src/persistence/repository/user.repository';
import {UserEntityProps} from '@src/core/entity/user.entity';

@Injectable()
export class UserService {
    constructor (private readonly userRepository: UserRepository) {}
    async findById(id: string) {
        return this.userRepository.findById(id);
    }
    async findByEmail(email: string) {
        return this.userRepository.findByEmail(email);
    }
    async createUser(data: UserEntityProps){
        return this.userRepository.createUser(data)
    }
    async authUser(email: string, password: string) {
        return this.userRepository.authUser(email, password);
    }
    async passwordRecover(email: string) {
        return this.userRepository.passwordRecover(email);
    }
    async resetPassword(id: string, token: string, newPassword: string) {
        return this.userRepository.resetPassword(id, token, newPassword);
    }
}