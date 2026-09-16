import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        sort,
        featured,
        limit = '50',
        page = '1'
      } = req.query;

      const where: any = {};

      if (q && typeof q === 'string') {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } }
        ];
      }

      if (category && typeof category === 'string' && category !== 'all') {
        where.categorySlug = category;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      if (featured === 'true') {
        where.featured = true;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'price_asc') orderBy = { price: 'asc' };
      else if (sort === 'price_desc') orderBy = { price: 'desc' };
      else if (sort === 'rating') orderBy = { rating: 'desc' };
      else if (sort === 'discount') orderBy = { discountPercent: 'desc' };

      const take = parseInt(limit as string, 10);
      const skip = (parseInt(page as string, 10) - 1) * take;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy,
          take,
          skip
        }),
        prisma.product.count({ where })
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page as string, 10),
          limit: take,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error: any) {
      console.error('[GET_PRODUCTS_ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }]
        },
        include: { category: true }
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Related products in same category
      const related = await prisma.product.findMany({
        where: {
          categorySlug: product.categorySlug,
          id: { not: product.id }
        },
        take: 4
      });

      res.json({
        success: true,
        data: {
          ...product,
          related
        }
      });
    } catch (error: any) {
      console.error('[GET_PRODUCT_BY_ID_ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to fetch product details' });
    }
  }

  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      res.json({
        success: true,
        data: categories.map(c => ({
          ...c,
          productCount: c._count.products
        }))
      });
    } catch (error: any) {
      console.error('[GET_CATEGORIES_ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  }
}
