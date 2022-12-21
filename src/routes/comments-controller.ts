import {CommentsQueryRepo} from "../repositories/comments-queryRepo";
import {CommentsService} from "../domain/comments-service";
import {RequestWithParam, RequestWithParamAndBody} from "../types/types";
import {Response} from "express";
import {CommentViewModelType} from "../models/CommentViewModel";
import {HTTP_Status} from "../types/enums";
import {CommentInputModelType} from "../models/CommentInputModel";
import {LikeInputModelType} from "../models/LikeInputModel";

export class CommentsController {
    constructor(protected commentsQueryRepo: CommentsQueryRepo,
                protected commentsService: CommentsService) { }

    async getComment(req: RequestWithParam, res: Response<CommentViewModelType>) {
        const foundComment = await this.commentsQueryRepo.findCommentById(req.params.id);
        if (!foundComment) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.status(HTTP_Status.OK_200).json(foundComment)
        }
    }

    async updateComment(req: RequestWithParamAndBody<CommentInputModelType>, res: Response) {
        const updateStatus = await this.commentsService.updateComment(req.params.id, req.body.content, req.userId)
        if (!updateStatus) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(updateStatus as HTTP_Status)
        }
    }

    async likeComment(req: RequestWithParamAndBody<LikeInputModelType>, res: Response) {
        const result = await this.commentsService.likeComment(req.params.id, req.userId, req.body.likeStatus)
        if (!result) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(HTTP_Status.NO_CONTENT_204)
        }
    }

    async deleteComment(req: RequestWithParam, res: Response) {
        const deleteStatus = await this.commentsService.deleteComment(req.params.id, req.userId)
        if (!deleteStatus) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(deleteStatus as HTTP_Status)
        }
    }
}