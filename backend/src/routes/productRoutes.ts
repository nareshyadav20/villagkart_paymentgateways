import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

router.get('/categories', ProductController.getCategories);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

export default router;
