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
}