const fs = require('fs');

let content = fs.readFileSync('./src/data/mockData.js', 'utf8');

// Replace export statement and require calls so it works as a plain object declaration
content = content.replace(/export const/g, 'const');
// Turn require(...) into 'local/filename'
content = content.replace(/require\(['"]\.\.\/\.\.\/assets\/images\/([^'"]+)['"]\)/g, "'local:$1'");

// Add an export at the end that node can understand
content += `\nmodule.exports = { SERVICE_CATEGORIES, BANNERS, STORES, PRODUCTS, ADDRESSES, ORDERS, NOTIFICATIONS, SEARCH_TERMS, PAYMENT_METHODS, ORDER_STATUS_STEPS, DELIVERY_PARTNER, PROFILE_MENU_SECTIONS, NOTIFICATION_ICONS, BANNER_ICONS, APP_CONFIG, RECENT_SEARCHES, TRENDING_SEARCHES, SORT_OPTIONS, PROMO_CODES };`;

fs.writeFileSync('./tmp_mockData.js', content);
const d = require('./tmp_mockData.js');

function escapeSql(str) {
    if (typeof str !== 'string') return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
}

function escapeNum(num) {
    return num === undefined || num === null ? 'NULL' : num;
}

function escapeBool(b) {
    return b ? 'true' : 'false';
}

function escapeTags(tags) {
    if (!tags || !tags.length) return 'NULL';
    const escaped = tags.map(t => escapeSql(t)).join(',');
    return `ARRAY[${escaped}]`;
}

let sql = '';

sql += '-- Service Categories\n';
d.SERVICE_CATEGORIES.forEach(c => {
    sql += `INSERT INTO service_categories (id, name, icon, color, gradient_start, gradient_end) VALUES (` +
        `${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.icon)}, ${escapeSql(c.color)}, ` +
        `${escapeSql(c.gradient[0])}, ${escapeSql(c.gradient[1])}) ON CONFLICT DO NOTHING;\n`;
});

sql += '\n-- Stores\n';
d.STORES.forEach(s => {
    sql += `INSERT INTO stores (id, name, location, cuisine, delivery_time, delivery_fee, rating, is_featured, is_open, offer, image, tags, operating_hours, phone, category_id) VALUES (` +
        `${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.location)}, ${escapeSql(s.cuisine)}, ` +
        `${escapeSql(s.deliveryTime)}, ${escapeNum(s.deliveryFee)}, ${escapeNum(s.rating)}, ` +
        `${escapeBool(s.isFeatured)}, ${escapeBool(s.isOpen)}, ${escapeSql(s.offer)}, ` +
        `${escapeSql(s.image)}, ${escapeTags(s.tags)}, ${escapeSql(s.operatingHours)}, ${escapeSql(s.phone)}, ${escapeSql(s.category)}) ON CONFLICT DO NOTHING;\n`;
});

sql += '\n-- Products\n';
d.PRODUCTS.forEach(p => {
    sql += `INSERT INTO products (id, store_id, name, description, price, image, rating, is_bestseller, category) VALUES (` +
        `${escapeSql(p.id)}, ${escapeSql(p.storeId)}, ${escapeSql(p.name)}, ${escapeSql(p.description)}, ` +
        `${escapeNum(p.price)}, ${escapeSql(p.image)}, ${escapeNum(p.rating)}, ${escapeBool(p.isBestseller)}, ${escapeSql(p.category)}) ON CONFLICT DO NOTHING;\n`;
});

fs.writeFileSync('insert.sql', sql);
console.log('SQL Generated. (Length: ' + sql.length + ')');
