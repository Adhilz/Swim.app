const fs = require('fs');

let content = fs.readFileSync('./src/data/mockData.js', 'utf8');

// Strip out export statements
content = content.replace(/export const /g, 'const ');

// Strip out requires and replace with string 'local_img'
content = content.replace(/require\(['"].*?['"]\)/g, "'local_img'");

// Remove the `export { ... }` at the end by just wrapping everything in a function that returns the variables
const executable = `
${content.replace(/export \{[\s\S]*?\};/, '')}
return { SERVICE_CATEGORIES, STORES, PRODUCTS };
`;

const data = new Function(executable)();

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

let sql = '';
data.SERVICE_CATEGORIES.forEach(c => {
    sql += `INSERT INTO service_categories (id, name, icon, color, gradient_start, gradient_end) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.icon)}, ${escapeSql(c.color)}, ${escapeSql(c.gradient[0])}, ${escapeSql(c.gradient[1])}) ON CONFLICT DO NOTHING;\n`;
});

data.STORES.forEach(s => {
    sql += `INSERT INTO stores (id, name, location, cuisine, delivery_time, delivery_fee, rating, is_featured, is_open, offer, image, tags, operating_hours, phone, category_id) VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.location)}, ${escapeSql(s.cuisine)}, ${escapeSql(s.deliveryTime)}, ${escapeNum(s.deliveryFee)}, ${escapeNum(s.rating)}, ${escapeBool(s.isFeatured)}, ${escapeBool(s.isOpen)}, ${escapeSql(s.offer)}, ${escapeSql(String(s.image))}, ${escapeTags(s.tags)}, ${escapeSql(s.operatingHours)}, ${escapeSql(s.phone)}, ${escapeSql(s.category)}) ON CONFLICT DO NOTHING;\n`;
});

data.PRODUCTS.forEach(p => {
    sql += `INSERT INTO products (id, store_id, name, description, price, image, rating, is_bestseller, category) VALUES (${escapeSql(p.id)}, ${escapeSql(p.storeId)}, ${escapeSql(p.name)}, ${escapeSql(p.description)}, ${escapeNum(p.price)}, ${escapeSql(String(p.image))}, ${escapeNum(p.rating)}, ${escapeBool(p.isBestseller)}, ${escapeSql(p.category)}) ON CONFLICT DO NOTHING;\n`;
});

fs.writeFileSync('insert_data.sql', sql);
console.log('SQL generated!');
