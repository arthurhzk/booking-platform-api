import { randomUUID } from 'crypto';
import { BaseEntity, BaseEntityProps } from '@src/core/entity/base.entity';

export interface UserEntityProps extends BaseEntityProps {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string | null
    avatar: string | null
}

export class UserEntity extends BaseEntity {

    private email: UserEntityProps['email']; 
    private password: UserEntityProps['password'];
    private firstName: UserEntityProps['firstName'];
    private lastName: UserEntityProps['lastName'];
    private phone: UserEntityProps['phone'];
    private avatar: UserEntityProps['avatar'];

    public constructor(data: UserEntityProps) {
        super(data);
      }

    static createNew(data: Omit<UserEntityProps, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
        return new UserEntity({
            ...data,
            id: randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }   
    
    static create(data: UserEntityProps): UserEntity {
       return new UserEntity({
            ...data,
            id: data.id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });       
    }

      serialize(): Record<string, unknown> {
      return {
        id: this.id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        avatar: this.avatar,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      }
    }
    getEmail(): UserEntityProps['email'] {
        return this.email;
    }
    getPassword(): UserEntityProps['password'] {
        return this.password;
    }
    getFirstName(): UserEntityProps['firstName'] {
        return this.firstName;
    }
    getLastName(): UserEntityProps['lastName'] {
        return this.lastName;
    }
    getPhone(): UserEntityProps['phone'] | null {
        return this.phone;
    }
    getAvatar(): UserEntityProps['avatar'] | null  {
        return this.avatar;
    }
}