import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET / (all products)
router.get('/', requirePermission(121), productController.getAllProducts);

// POST / (create product) - requires permission 1
router.post('/', requirePermission(1), productController.createProduct);

// PUT /:id (update product) - requires permission 1
router.put('/:id', requirePermission(1), productController.updateProduct);

// DELETE /:id (delete product) - requires permission 1
router.delete('/:id', requirePermission(1), productController.deleteProduct);

// PATCH /:id/stock (update stock) - requires permission 132
router.patch('/:id/stock', requirePermission(132), productController.updateStock);

// GET /low-stock?threshold=5 - requires permission 125
router.get('/low-stock', requirePermission(125), productController.getLowStock);

// GET /search?q=...
router.get('/search', productController.searchProducts);

export default router;
