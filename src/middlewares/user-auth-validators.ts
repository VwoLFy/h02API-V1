import {body, CustomValidator, query} from "express-validator";
import {checkIdValidForMongodb} from "./check-id-valid-for-mongodb";
import {checkAuthorizationMiddleware} from "./check-authorization-middleware";
import {inputValidationMiddleware} from "./input-validation-middleware";
import {SortDirection} from "../types/enums";
import {usersRepository} from "../repositories/users-repository";
import {attemptsValidationMiddleware} from "./attempts-validation-middleware";

//user
const userQueryValidation = [
    query('pageNumber').toInt().default("1").customSanitizer(value => {
        return Number(value) < 1 ? "1" : value
    }),
    query('pageSize').toInt().default("10").customSanitizer(value => {
        return Number(value) < 1 ? "10" : value
    }),
    query('sortBy').customSanitizer(value => {
        const fields = ['id', 'login', 'email', 'createdAt'];
        if (!value || !fields.includes(value)) return 'createdAt'
        return value
    }),
    query('sortDirection').customSanitizer(value => {
        if (!value || value !== SortDirection.asc) return SortDirection.desc
        return SortDirection.asc
    }),
]
const userLoginValidation = body("login", "'login' must be a string in range from 3 to 10 symbols")
    .isString().trim().matches("^[a-zA-Z0-9_-]*$").isLength({min: 3, max: 10});
const userPasswordValidation = body("password", "'password' must be a string in range from 6 to 20 symbols")
    .isString().trim().isLength({min: 6, max: 20});
const userEmailValidation = body("email", "'email' must be a email")
    .isString().trim().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

//auth
const authLoginOrEmailValidation = body("loginOrEmail", "'loginOrEmail' must be a string")
    .isString().trim().isLength({min: 3})
const authPasswordValidation = body("password", "'password' must be a string")
    .isString().trim().isLength({min: 6, max: 20})
const freeLoginOrEmail: CustomValidator = async (value) => {
    const loginExist =  await usersRepository.findUserByLoginOrEmail(value)
    if (loginExist) throw new Error()
    return true
}
const authLoginRegValidation = body("login", "'login' must be a string or already exists")
    .isString().trim().matches("^[a-zA-Z0-9_-]*$").isLength({min: 3, max: 10}).custom(freeLoginOrEmail);
const authEmailRegValidation = body("email", "'email' must be a email or already exists")
    .isString().trim().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").custom(freeLoginOrEmail);

const codeValid: CustomValidator = async (value) => {
    const emailConfirmation = await usersRepository.findEmailConfirmationByCode(value)
    if (!emailConfirmation) throw new Error()
    if (emailConfirmation.isConfirmed) throw new Error()
    if (emailConfirmation.expirationDate! < new Date()) throw new Error()
    if (emailConfirmation.confirmationCode !== value) throw new Error()
    return true
}
const authCodeValidation = body("code", "'code' confirmation code is incorrect, expired or already been applied")
    .custom(codeValid)
const emailValid: CustomValidator = async (value) => {
    const foundUser = await usersRepository.findUserByLoginOrEmail(value)
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) throw new Error()
    return true
}
const authEmailResendValidation = body("email", "'email' has incorrect values or is already confirmed")
    .isString().trim().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").custom(emailValid);
const authEmailPasswordRecoveryValidation = body("email").trim().customSanitizer((value) => {
    if (!value || typeof value !== "string" || !value.match("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) return ''
    return value
})
const authNewPasswordValidation = body('newPassword').trim().customSanitizer((value) => {
    if (!value || typeof value !== "string" || value.length < 6 || value.length > 20) return ''
    return value
})
const authRecoveryCodeValidation = body('recoveryCode').trim().customSanitizer((value) => {
    if (!value || typeof value !== "string") return ''
    return value
})

//list for user
export const getUsersValidation = userQueryValidation
export const createUserValidation = [
    checkAuthorizationMiddleware,
    userLoginValidation,
    userPasswordValidation,
    userEmailValidation,
    inputValidationMiddleware
]
export const deleteUserValidation = [
    checkAuthorizationMiddleware,
    checkIdValidForMongodb
]

// list for auth
export const loginAuthValidation = [
    attemptsValidationMiddleware,
    authLoginOrEmailValidation,
    authPasswordValidation,
    inputValidationMiddleware
]
export const registrationAuthValidation = [
    attemptsValidationMiddleware,
    authLoginRegValidation,
    authPasswordValidation,
    authEmailRegValidation,
    inputValidationMiddleware
]
export const emailConfirmationAuthValidation = [
    attemptsValidationMiddleware,
    authCodeValidation,
    inputValidationMiddleware
]
export const emailResendingAuthValidation = [
    attemptsValidationMiddleware,
    authEmailResendValidation,
    inputValidationMiddleware
]
export const getUserInfoAuthValidation = [
    checkAuthorizationMiddleware
]
export const passwordRecoveryAuthValidation = [
    attemptsValidationMiddleware,
    authEmailPasswordRecoveryValidation
]
export const newPasswordAuthValidation = [
    attemptsValidationMiddleware,
    authNewPasswordValidation,
    authRecoveryCodeValidation
]