import { User } from './user';

export type LoginRequest = {
    email: string,
    password: string
}

export type LoginResponse = {
    user: User
}