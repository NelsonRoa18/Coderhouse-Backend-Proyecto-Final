import winston from "winston";

const customLevelsOptions = {
    levels: {          
        debug: 5,
        http:4,
        info: 3,
        warning: 2,
        error: 1,
        fatal: 0
    },
    colors: {
        fatal: 'red',
        error: 'orange',
        warning: 'yellow',
        info: 'blue',
        debug: 'white'
    }
}



const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [

        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        })

    ]
})


const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,

    transports: [

        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log', level: 'warning',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        })
    ]
})


const loggerMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        req.logger = prodLogger;

    } else {
        req.logger = devLogger
    }

    req.logger.info(`${req.method} en url ${req.url} - ${new Date().toLocaleString()}`);
    next()
}

export { devLogger, prodLogger, loggerMiddleware }