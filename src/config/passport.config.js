import passport from "passport";
import local from 'passport-local'
import userManager from '../dao/models/user.model.js'
import { createHash, isValidPassword } from '../utils.js';
import GitHubStrategy from 'passport-github2'

import CustomError from "../services/Customerror.js";
import EErrors from "../services/enum.js";
import { generateUserErrorInfo } from "../services/info.js";

const LocalStrategy = local.Strategy

const initializePassport = () => {

    //estrategias
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body
            try {
                if (!first_name || !last_name || !email || !age) {
                    CustomError.createError({
                        name: "Creacion de usuario",
                        cause: generateUserErrorInfo({ first_name, last_name, email, age }),
                        message: "Error al intentar crear un usuario",
                        code: EErrors.INVALID_TYPES_ERROR
                    })
                }
                else {
                    let user = await userManager.findOne({ email: username })
                    let cart = []
                    if (user) {
                        console.log("El usuario ya existe")
                        return done(null, false)
                    }
                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),
                        cart,
                        documents,
                        last_connection
                    }
                    let result = await userManager.create(newUser)
                    return done(null, result)
                }

            } catch (error) {
                return done(error)
            }
        }
    ))



    passport.serializeUser((user, done) => {
        console.log(user);
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userManager.findById(id)
        done(null, user)
    })


    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await userManager.findOne({ email: username })
            if (!user) {
                console.log("El usuario no existe")
                return done(null, user)
            }
            if (!isValidPassword(user, password)) return done(null, false)
            const datelogin = new Date()
            const last_connection = datelogin.toString()
            await userManager.updateOne({email: username}, { last_connection: last_connection })
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    /*     passport.use('restorepass', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
            try {
                console.log(password);
                const user = await userService.findOne({ email: username })
                if (!user) {
                    console.log("El usuario no existe")
                    return done(null, false)
                }
    
                const newPassword = createHash(password)
                console.log(newPassword);
                const result = await userService.updateOne({ email: username }, { password: newPassword })
                return done(null, user)
            } catch (error) {
                return done(error)
            }
        })) */

    passport.use('github', new GitHubStrategy({
        clientID: "Iv23liBcPNc1h8AWysa0",
        clientSecret: "180b7f1e2b88ac0c5474f1eb05dc632f515158c5",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userManager.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 20,
                    email: profile._json.email,
                    password: "",
                    cart: []
                }
                let result = await userManager.create(newUser)
                done(null, result)
            }
            else {
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }))


}


export default initializePassport