import {UsersQueryRepo} from "../infrastructure/users-queryRepo";
import {UsersService} from "../domain/user-service";
import {RequestWithBody, RequestWithParam, RequestWithQuery} from "../../main/types/types";
import {UserQueryModel} from "./models/UserQueryModel";
import {Response} from "express";
import {UserViewModelPage} from "./models/UserViewModelPage";
import {UserInputModel} from "./models/UserInputModel";
import {UserViewModel} from "./models/UserViewModel";
import {HTTP_Status} from "../../main/types/enums";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(@inject(UsersQueryRepo) protected usersQueryRepo: UsersQueryRepo,
                @inject(UsersService) protected usersService: UsersService) {
    }

    async getUsers(req: RequestWithQuery<UserQueryModel>, res: Response<UserViewModelPage>) {
        const {pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm} = req.query
        res.json(await this.usersQueryRepo.findUsers({
            pageNumber: +pageNumber,
            pageSize: +pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        }))
    }

    async createUser(req: RequestWithBody<UserInputModel>, res: Response<UserViewModel>) {
        const createdUserId = await this.usersService.createUser({
            login: req.body.login,
            password: req.body.password,
            email: req.body.email})
        if (!createdUserId) return res.sendStatus(HTTP_Status.BAD_REQUEST_400)
        const createdUser = await this.usersQueryRepo.findUserById(createdUserId)
        if (createdUser) res.status(HTTP_Status.CREATED_201).json(createdUser)
    }

    async deleteUser(req: RequestWithParam, res: Response) {
        const isDeletedUser = await this.usersService.deleteUser(req.params.id)
        if (!isDeletedUser) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(HTTP_Status.NO_CONTENT_204)
        }
    }
}