import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.render('products', {user: req.session.user})
})
router.get("/addproducts", async (req, res) => {
    try {

        res.render('addproducts', {user:req.session.user})

    } catch (error) {
        console.error('Error:', error);
    }

})

router.get('/update', (req, res) => {
    try {
        res.render('update', {})
    } catch (error) {
        console.log(error);
    }

})



export default router;