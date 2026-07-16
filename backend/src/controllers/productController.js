import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { getShopId } from '../middleware/auth.js';
import { isProductLimitReached } from '../config/plans.js';

function normalizeBarcode(value) {
  return String(value || '').trim();
}

function normalizeName(value) {
  return String(value || '').trim();
}

export async function listProducts(req, res, next) {
  try {
    const shopId = getShopId(req);
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const filter = { shop: shopId };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
        { barcode: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
      ];
    }
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const limits = shop.getPlanLimits();
    const count = await Product.countDocuments({ shop: shopId });
    if (isProductLimitReached(count, limits.maxProducts)) {
      return res.status(403).json({
        message: `Product limit reached for ${shop.package} plan (${limits.maxProducts}). Upgrade to Premium for unlimited products.`,
        code: 'PRODUCT_LIMIT',
        plan: limits,
      });
    }

    const name = normalizeName(req.body.name) || 'New Perfume';
    const barcode = normalizeBarcode(req.body.barcode) || `SKU${Date.now()}`;

    const dupName = await Product.findOne({
      shop: shopId,
      name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (dupName) {
      return res.status(409).json({
        message: 'A product with this name already exists in your shop.',
        code: 'DUPLICATE_PRODUCT',
      });
    }

    if (barcode) {
      const dupBarcode = await Product.findOne({ shop: shopId, barcode });
      if (dupBarcode) {
        return res.status(409).json({
          message: 'A product with this barcode already exists.',
          code: 'DUPLICATE_BARCODE',
        });
      }
    }

    const product = await Product.create({
      shop: shopId,
      name,
      brand: req.body.brand || '',
      category: req.body.category || 'General',
      qty: Math.max(0, Number(req.body.qty) || 0),
      buyPrice: Math.max(0, Number(req.body.buyPrice) || 0),
      sellPrice: Math.max(0, Number(req.body.sellPrice) || 0),
      barcode,
      desc: req.body.desc || '',
    });
    res.status(201).json({
      product,
      planUsage: {
        products: count + 1,
        maxProducts: limits.maxProducts,
        unlimitedProducts: limits.maxProducts == null,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate product barcode for this shop.',
        code: 'DUPLICATE_BARCODE',
      });
    }
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    const product = await Product.findOne({ _id: req.params.id, shop: shopId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.name !== undefined) {
      const name = normalizeName(req.body.name);
      const dupName = await Product.findOne({
        shop: shopId,
        _id: { $ne: product._id },
        name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });
      if (dupName) {
        return res.status(409).json({
          message: 'A product with this name already exists in your shop.',
          code: 'DUPLICATE_PRODUCT',
        });
      }
      product.name = name;
    }

    if (req.body.barcode !== undefined) {
      const barcode = normalizeBarcode(req.body.barcode);
      if (barcode) {
        const dupBarcode = await Product.findOne({
          shop: shopId,
          barcode,
          _id: { $ne: product._id },
        });
        if (dupBarcode) {
          return res.status(409).json({
            message: 'A product with this barcode already exists.',
            code: 'DUPLICATE_BARCODE',
          });
        }
      }
      product.barcode = barcode;
    }

    const fields = ['brand', 'category', 'desc'];
    for (const key of fields) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }
    if (req.body.qty !== undefined) product.qty = Math.max(0, Number(req.body.qty) || 0);
    if (req.body.buyPrice !== undefined) product.buyPrice = Math.max(0, Number(req.body.buyPrice) || 0);
    if (req.body.sellPrice !== undefined) product.sellPrice = Math.max(0, Number(req.body.sellPrice) || 0);

    await product.save();
    res.json({ product });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate product barcode for this shop.',
        code: 'DUPLICATE_BARCODE',
      });
    }
    next(err);
  }
}

export async function adjustStock(req, res, next) {
  try {
    const shopId = getShopId(req);
    const delta = Number(req.body.delta);
    if (!Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ message: 'delta must be a non-zero number' });
    }
    const product = await Product.findOne({ _id: req.params.id, shop: shopId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const nextQty = product.qty + delta;
    if (nextQty < 0) {
      return res.status(400).json({ message: 'Stock cannot go negative', code: 'NEGATIVE_STOCK' });
    }
    product.qty = nextQty;
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    const product = await Product.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
