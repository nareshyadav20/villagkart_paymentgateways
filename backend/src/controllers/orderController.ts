import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const {
        customerName,
        customerEmail,
        customerMobile,
        shippingAddress,
        city,
        state,
        pincode,
        items
      } = req.body;

      if (!customerName || !customerEmail || !customerMobile || !shippingAddress || !items || !items.length) {
        return res.status(400).json({
          success: false,
          message: 'Missing required order fields or empty cart items'
        });
      }

      // Fetch products from database to calculate server-verified prices
      const productIds = items.map((i: any) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found in inventory`
          });
        }

        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        const itemPrice = product.price;
        const itemTotal = itemPrice * quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl,
          price: itemPrice,
          quantity,
          totalPrice: itemTotal
        });
      }

      // Delivery charges: Free for orders >= ₹499, else ₹40 standard delivery
      const deliveryCharge = subtotal >= 499 ? 0 : 40;
      const discount = 0; // standard promotional discounts if applied
      const totalAmount = subtotal + deliveryCharge - discount;

      const orderNumber = `PB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Upsert/Create Customer record
      const customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          mobile: customerMobile,
          address: shippingAddress,
          city: city || 'Mumbai',
          state: state || 'Maharashtra',
          pincode: pincode || '400001'
        }
      });

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName,
          customerEmail,
          customerMobile,
          shippingAddress,
          city: city || 'Mumbai',
          state: state || 'Maharashtra',
          pincode: pincode || '400001',
          subtotal,
          discount,
          deliveryCharge,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true
        }
      });

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('[CREATE_ORDER_ERROR]', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id },
            { orderNumber: id }
          ]
        },
        include: {
          items: true,
          transactions: {
            orderBy: { createdAt: 'desc' }
          },
          refunds: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('[GET_ORDER_ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve order details' });
    }
  }
}
