import {Request, Response, Router} from "express";
import {DeviceViewModelType} from "../models/DeviceViewModel";
import {securityQueryRepo} from "../repositories/security-queryRepo";
import {HTTP_Status} from "../types/enums";
import {securityService} from "../domain/security-service";
import {RequestWithParam} from "../types/types";
import {refreshTokenValidationMiddleware} from "../middlewares/refreshToken-validation-middleware";

export const securityRouter = Router({})

class SecurityController {
    async getDevices(req: Request, res: Response<DeviceViewModelType[]>) {
        const foundActiveDevices = await securityQueryRepo.findUserSessions(req.refreshTokenData.userId)
        if (!foundActiveDevices) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
        return res.status(HTTP_Status.OK_200).json(foundActiveDevices)
    }
    async deleteDevices(req: Request, res: Response) {
        const isDeletedSessions = await securityService.deleteSessions(req.refreshTokenData.userId, req.refreshTokenData.deviceId)
        if (!isDeletedSessions) return res.sendStatus(HTTP_Status.UNAUTHORIZED_401)
        return res.sendStatus(HTTP_Status.NO_CONTENT_204)
    }
    async deleteDevice(req: RequestWithParam, res: Response) {
        const result = await securityService.deleteSessionByDeviceId(req.refreshTokenData.userId, req.params.id)
        res.sendStatus(result as HTTP_Status)
        return
    }
}

const securityController = new SecurityController()

securityRouter.get('/devices', refreshTokenValidationMiddleware, securityController.getDevices)
securityRouter.delete('/devices', refreshTokenValidationMiddleware, securityController.deleteDevices)
securityRouter.delete('/devices/:id', refreshTokenValidationMiddleware, securityController.deleteDevice)