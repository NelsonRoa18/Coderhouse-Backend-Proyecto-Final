import Router from "express"

const router = Router()

router.get('/', async (req, res) => {
    try {
        req.logger.debug('Esta es una petición en modo desarrollo');
        req.logger.warning('Esta es una advertencia en modo producción');
        res.send('Probando logger');

    } catch (error) {
        console.error(error);
    }
});


export default router