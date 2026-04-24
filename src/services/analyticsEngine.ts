import Sale from '../models/Sale.js';
import Repair from '../models/Repair.js';
import Product from '../models/Product.js';

export const getSalesHeatmap = async () => {
  const sales = await Sale.find({ status: 'completed' });
  // Mock heatmap data based on sales locations (if we had them)
  // For now, we'll return mock data for Kuwait City areas
  return [
    { lat: 29.3759, lng: 47.9774, count: 120, area: "Kuwait City" },
    { lat: 29.3375, lng: 48.0233, count: 85, area: "Salmiya" },
    { lat: 29.2891, lng: 47.9138, count: 45, area: "Farwaniya" },
    { lat: 29.0667, lng: 48.1167, count: 30, area: "Ahmadi" },
    { lat: 29.3500, lng: 47.9000, count: 60, area: "Shuwaikh" }
  ];
};

export const getInventoryForecast = async () => {
  const products = await Product.find();
  // Mock forecasting logic: if stock < 5, suggest reorder
  return products.map(p => ({
    productId: p._id,
    name: p.name,
    currentStock: p.stock,
    forecastedDemand: Math.floor(Math.random() * 20) + 5,
    suggestedReorder: p.stock < 10 ? 20 : 0
  }));
};

export const getRepairPredictive = async () => {
  const repairs = await Repair.find();
  // Mock predictive: avg repair time per model
  const models = [...new Set(repairs.map(r => r.deviceModel))];
  return models.map(model => ({
    model,
    avgTime: Math.floor(Math.random() * 48) + 2, // 2-50 hours
    successRate: Math.floor(Math.random() * 20) + 80 // 80-100%
  }));
};

export const getProductAffinity = async () => {
  const sales = await Sale.find({ status: 'completed' }).populate('items.productId');
  const pairs: Record<string, { count: number; revenue: number; names: [string, string] }> = {};

  sales.forEach(sale => {
    const products = sale.items.map(item => ({
      id: item.productId._id.toString(),
      name: (item.productId as any).name,
      price: item.price * item.quantity
    }));

    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const key = [products[i].id, products[j].id].sort().join('_');
        if (!pairs[key]) {
          pairs[key] = { 
            count: 0, 
            revenue: 0, 
            names: [products[i].name, products[j].name].sort() as [string, string] 
          };
        }
        pairs[key].count++;
        pairs[key].revenue += products[i].price + products[j].price;
      }
    }
  });

  const totalSales = sales.length;
  return Object.values(pairs)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(p => ({
      main: p.names[0],
      companion: p.names[1],
      strength: totalSales > 0 ? Math.round((p.count / totalSales) * 100) : 0,
      revenue: p.revenue
    }));
};

export const getAnalyticsSummary = async () => {
  const [sales, repairs, products] = await Promise.all([
    Sale.find({ status: 'completed' }),
    Repair.find(),
    Product.find()
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalRepairs = repairs.length;
  const activeRepairs = repairs.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
  const lowStockCount = products.filter(p => p.stock < 5).length;

  return {
    revenue: totalRevenue,
    salesCount: sales.length,
    repairStats: {
      total: totalRepairs,
      active: activeRepairs
    },
    inventoryStats: {
      lowStock: lowStockCount,
      totalAssets: products.length
    },
    systemHealth: '100%',
    activeSessions: Math.floor(Math.random() * 10) + 1
  };
};
