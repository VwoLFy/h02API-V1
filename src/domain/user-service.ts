import {usersRepository} from "../repositories/users-repository";
import bcrypt from "bcrypt"

export type TypeNewUser = {
    login: string
    password: string
    email: string
    createdAt: string
}

export const usersService = {
    async createUser(login: string, password: string, email: string): Promise<string> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, passwordSalt)

        const newUser: TypeNewUser = {
            login,
            password: passwordHash,
            email,
            createdAt: (new Date()).toISOString()
        }
        return await usersRepository.createUser(newUser)
},
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },
    async deleteAll() {
        await usersRepository.deleteAll()
    }
}