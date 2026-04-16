import express from 'express';
import { productController } from '../controllers/productController.js';
import { skuController } from '../controllers/skuController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET / (all products)
router.get('/', requirePermission(121), productController.getAllProducts);

// GET /low-stock?threshold=5 - requires permission 125
router.get('/low-stock', requirePermission(125), productController.getLowStock);

// GET /search?q=...
router.get('/search', productController.searchProducts);

// GET /validate-sku?sku=...
router.get('/validate-sku', productController.validateSku);

// SKU Generation
router.post('/sku/generate', requirePermission(122), skuController.generateSku);
router.post('/sku/validate', requirePermission(122), skuController.validateSku);

// GET /:id (single product)
router.get('/:id', requirePermission(121), productController.getProductById);

// Variants
router.get('/:id/variants', requirePermission(121), productController.getVariants);
router.put('/variants/:id', requirePermission(122), productController.updateVariant);
router.delete('/variants/:id', requirePermission(122), productController.deleteVariant);
router.get('/variants/:variantId/serials', requirePermission(121), productController.getAvailableSerials);

// POST / (create product) - requires permission 122
router.post('/', requirePermission(122), productController.createProduct);

// PUT /:id (update product) - requires permission 122
router.put('/:id', requirePermission(122), productController.updateProduct);

// DELETE /:id (delete product) - requires permission 122
router.delete('/:id', requirePermission(122), productController.deleteProduct);

// PATCH /:id/stock (update stock) - requires permission 132
router.patch('/:id/stock', requirePermission(132), productController.updateStock);

export default router;
