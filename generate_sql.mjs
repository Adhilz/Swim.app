import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.require = (src) => `local:${src.split('/').pop()}`;

import { SERVICE_CATEGORIES, STORES, PRODUCTS } from './src/data/mockData.js';

const escapeSql = (str) => {
    if (typeof str !== 'string') return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
};

const escapeNum = (num) => num === undefined || num === null ? 'NULL' : num;
const escapeBool = (b) => b ? 'true' : 'false';
const escapeTags = (tags) => {
    if (!tags || !tags.length) return 'NULL';
    return `ARRAY[${tags.map(t => escapeSql(t)).join(',')}]`;
};

let sql = '-- Service Categories\n';
SERVICE_CATEGORIES.forEach(c => {
    sql += `INSERT INTO service_categories (id, name, icon, color, gradient_start, gradient_end) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.icon)}, ${escapeSql(c.color)}, ${escapeSql(c.gradient[0])}, ${escapeSql(c.gradient[1])}) ON CONFLICT DO NOTHING;\n`;
});

sql += '\n-- Stores\n';
STORES.forEach(s => {
    const imgStr = typeof s.image === 'object' && s.image !== null ? String(s.image) : String(s.image || '');
    sql += `INSERT INTO stores (id, name, location, cuisine, delivery_time, delivery_fee, rating, is_featured, is_open, offer, image, tags, operating_hours, phone, category_id) VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.location)}, ${escapeSql(s.cuisine)}, ${escapeSql(s.deliveryTime)}, ${escapeNum(s.deliveryFee)}, ${escapeNum(s.rating)}, ${escapeBool(s.isFeatured)}, ${escapeBool(s.isOpen)}, ${escapeSql(s.offer)}, ${escapeSql(imgStr)}, ${escapeTags(s.tags)}, ${escapeSql(s.operatingHours)}, ${escapeSql(s.phone)}, ${escapeSql(s.category)}) ON CONFLICT DO NOTHING;\n`;
});

sql += '\n-- Products\n';
PRODUCTS.forEach(p => {
    const imgStr = typeof p.image === 'object' && p.image !== null ? String(p.image) : String(p.image || '');
    sql += `INSERT INTO products (id, store_id, name, description, price, image, rating, is_bestseller, category) VALUES (${escapeSql(p.id)}, ${escapeSql(p.storeId)}, ${escapeSql(p.name)}, ${escapeSql(p.description)}, ${escapeNum(p.price)}, ${escapeSql(imgStr)}, ${escapeNum(p.rating)}, ${escapeBool(p.isBestseller)}, ${escapeSql(p.category)}) ON CONFLICT DO NOTHING;\n`;
});

fs.writeFileSync('insert_data.sql', sql);
console.log('SQL generated to insert_data.sql successfully.');
