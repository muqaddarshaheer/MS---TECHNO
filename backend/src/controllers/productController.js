import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { StockMovement } from '../models/StockMovement.js';
import { getShopId } from '../middleware/auth.js';
import { isProductLimitReached } from '../config/plans.js';
import { writeAudit } from '../services/auditService.js';

function normalizeBarcode(value) {
  return String(value || '').trim();
}

function normalizeName(value) {
  return String(value || '').trim();
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

const EXTRA_FIELDS = [
  'brand',
  'model',
  'category',
  'subcategory',
  'sku',
  'desc',
  'imageUrl',
  'batchNumber',
  'expiryDate',
];

const NUMBER_FIELDS = [
  'qty',
  'buyPrice',
  'sellPrice',
  'wholesalePrice',
  'dealerPrice',
  'vipPrice',
  'offerPrice',
  'minPrice',
  'reorderLevel',
  'maxStock',
];

export async function listProducts(req, res, next) {
  try {
    const shopId = getShopId(req);
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const filter = { shop: shopId };
    if (req.query.active === '1') filter.isActive = true;
    if (req.query.low === '1') {
      // handled after query for older docs without reorderLevel
    } else if (req.query.out === '1') {
      filter.qty = 0;
    }
    if (req.query.expiring === '1') {
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      const soonStr = soon.toISOString().split('T')[0];
      filter.expiryDate = { $gte: todayStr(), $lte: soonStr };
    }
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
        { barcode: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
        { subcategory: new RegExp(q, 'i') },
        { sku: new RegExp(q, 'i') },
        { model: new RegExp(q, 'i') },
      ];
    }
    let products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.low === '1' ? 0 : (page - 1) * limit)
      .limit(req.query.low === '1' ? 500 : limit)
      .lean();
    let total = await Product.countDocuments(filter);

    if (req.query.low === '1') {
      products = products.filter((p) => p.qty > 0 && p.qty <= (p.reorderLevel ?? 5));
      total = products.length;
      products = products.slice((page - 1) * limit, page * limit);
    }

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

    const name = normalizeName(req.body.name) || 'New Product';
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

    const data = {
      shop: shopId,
      name,
      barcode,
      isActive: req.body.isActive !== false,
    };
    for (const key of EXTRA_FIELDS) {
      if (req.body[key] !== undefined) data[key] = req.body[key] || '';
    }
    for (const key of NUMBER_FIELDS) {
      if (req.body[key] !== undefined) data[key] = Math.max(0, Number(req.body[key]) || 0);
    }
    if (data.reorderLevel === undefined) data.reorderLevel = 5;

    const product = await Product.create(data);
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

    for (const key of EXTRA_FIELDS) {
      if (req.body[key] !== undefined) product[key] = req.body[key] || '';
    }
    for (const key of NUMBER_FIELDS) {
      if (req.body[key] !== undefined) product[key] = Math.max(0, Number(req.body[key]) || 0);
    }
    if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);

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
    const reason = req.body.reason || 'adjustment';
    const allowed = ['adjustment', 'damage', 'lost', 'receive'];
    if (!allowed.includes(reason)) {
      return res.status(400).json({ message: 'Invalid stock reason' });
    }
    if (['damage', 'lost', 'adjustment'].includes(reason) && !String(req.body.note || '').trim()) {
      // note optional for +receive; encourage for reductions via UI
    }

    const product = await Product.findOne({ _id: req.params.id, shop: shopId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const nextQty = product.qty + delta;
    if (nextQty < 0) {
      return res.status(400).json({ message: 'Stock cannot go negative', code: 'NEGATIVE_STOCK' });
    }
    const beforeQty = product.qty;
    product.qty = nextQty;
    await product.save();

    await StockMovement.create({
      shop: shopId,
      product: product._id,
      productName: product.name,
      delta,
      qtyAfter: nextQty,
      reason,
      note: req.body.note || '',
      user: req.user?._id || null,
      date: todayStr(),
    });

    await writeAudit({
      shopId,
      user: req.user,
      action: 'stock_adjust',
      entity: 'Product',
      entityId: product._id,
      reason: req.body.note || reason,
      before: { qty: beforeQty },
      after: { qty: nextQty, reason },
    });

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function duplicateProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const limits = shop.getPlanLimits();
    const count = await Product.countDocuments({ shop: shopId });
    if (isProductLimitReached(count, limits.maxProducts)) {
      return res.status(403).json({ message: 'Product limit reached', code: 'PRODUCT_LIMIT' });
    }

    const source = await Product.findOne({ _id: req.params.id, shop: shopId });
    if (!source) return res.status(404).json({ message: 'Product not found' });

    const copy = source.toObject();
    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;
    copy.name = `${source.name} (copy)`;
    copy.barcode = `SKU${Date.now()}`;
    copy.sku = source.sku ? `${source.sku}-COPY` : '';
    copy.qty = 0;

    const product = await Product.create(copy);
    await writeAudit({
      shopId,
      user: req.user,
      action: 'product_duplicate',
      entity: 'Product',
      entityId: product._id,
      reason: `Duplicated from ${source.name}`,
      after: { name: product.name, barcode: product.barcode },
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function listStockMovements(req, res, next) {
  try {
    const shopId = getShopId(req);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const filter = { shop: shopId };
    if (req.query.productId) filter.product = req.query.productId;
    const movements = await StockMovement.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ movements });
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
