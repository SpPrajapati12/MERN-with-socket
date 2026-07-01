import { Router } from "express";
import * as c from "../controllers/productController";
import { authenticate, authorize } from "../middleware/auth";
import { productRules, handleValidation } from "../middleware/validate";
import upload from "../middleware/upload";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: "-createdAt" }
 *     responses:
 *       200: { description: List of products }
 */
router.get("/", c.getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product details }
 */
router.get("/:id", c.getProduct);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product with images (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Product created }
 */
router.post("/", authenticate, authorize("admin"), upload.array("images", 5), productRules, handleValidation, c.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product with images (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200: { description: Product updated }
 */
router.put("/:id", authenticate, authorize("admin"), upload.array("images", 5), c.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 */
router.delete("/:id", authenticate, authorize("admin"), c.deleteProduct);

export default router;
