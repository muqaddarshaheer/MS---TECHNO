import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { getShopId } from '../middleware/auth.js';

export async function listProducts(req, res, next) {
  try {
    const shopId = getShopId(req);
    const products = await Product.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ products });
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
    if (count >= limits.maxProducts) {
      return res.status(403).json({
        message: `Product limit reached for ${shop.package} plan (${limits.maxProducts}). Upgrade plan to add more.`,
        code: 'PLAN_LIMIT',
        plan: limits,
      });
    }

    const product = await Product.create({
      shop: shopId,
      name: req.body.name || 'New Perfume',
      brand: req.body.brand || 'MS Techno',
      category: req.body.category || 'General',
      qty: Number(req.body.qty) || 0,
      buyPrice: Number(req.body.buyPrice) || 0,
      sellPrice: Number(req.body.sellPrice) || 0,
      barcode: req.body.barcode || `SKU${Date.now()}`,
      desc: req.body.desc || '',
    });
    res.status(201).json({ product, planUsage: { products: count + 1, maxProducts: limits.maxProducts } });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    const product = await Product.findOne({ _id: req.params.id, shop: shopId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = ['name', 'brand', 'category', 'qty', 'buyPrice', 'sellPrice', 'barcode', 'desc'];
    for (const key of fields) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }
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
