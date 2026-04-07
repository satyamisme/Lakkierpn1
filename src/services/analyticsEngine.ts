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
