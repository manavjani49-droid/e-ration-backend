const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// --- 🔐 TWILIO CONFIGURATION ---
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKENmeet
// const verifySid = "VAdefde5c7e3abace053a3db6346e7162e";
// const client = require('twilio')(accountSid, authToken);

// 📱 TARGET PHONE NUMBER
const MY_NUMBER = "+919930784468"; 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,))); 

const db = new sqlite3.Database('./ration.db');

// --- 🗺️ LOCATIONS & SHOP GENERATOR ---
const indiaLocations = {
    "Maharashtra": { "Mumbai": [19.0760, 72.8777], "Pune": [18.5204, 73.8567], "Nagpur": [21.1458, 79.0882], "Nashik": [19.9975, 73.7898], "Aurangabad": [19.8762, 75.3433], "Solapur": [17.6599, 75.9064], "Amravati": [20.9374, 77.7796], "Latur": [18.4088, 76.5604] },
    "Delhi": { "New Delhi": [28.6139, 77.2090] },
    "Karnataka": { "Bangalore": [12.9716, 77.5946], "Mysore": [12.2958, 76.6394], "Hubli": [15.3647, 75.1240], "Mangalore": [12.9141, 74.8560] },
    "Tamil Nadu": { "Chennai": [13.0827, 80.2707], "Coimbatore": [11.0168, 76.9558], "Madurai": [9.9252, 78.1198] },
    "Uttar Pradesh": { "Lucknow": [26.8467, 80.9462], "Kanpur": [26.4499, 80.3319], "Varanasi": [25.3176, 82.9739], "Agra": [27.1767, 78.0081] },
    "Gujarat": { "Ahmedabad": [23.0225, 72.5714], "Surat": [21.1702, 72.8311], "Vadodara": [22.3072, 73.1812], "Rajkot": [22.3039, 70.8022] },
    "West Bengal": { "Kolkata": [22.5726, 88.3639], "Darjeeling": [27.0410, 88.2663] },
    "Rajasthan": { "Jaipur": [26.9124, 75.7873], "Udaipur": [24.5854, 73.7125], "Jodhpur": [26.2389, 73.0243] },
    "Telangana": { "Hyderabad": [17.3850, 78.4867] },
    "Kerala": { "Kochi": [9.9312, 76.2673], "Thiruvananthapuram": [8.5241, 76.9366] },
    "Madhya Pradesh": { "Bhopal": [23.2599, 77.4126], "Indore": [22.7196, 75.8577] },
    "Bihar": { "Patna": [25.5941, 85.1376] },
    "Punjab": { "Ludhiana": [30.9010, 75.8573], "Amritsar": [31.6340, 74.8723] },
    "Haryana": { "Gurgaon": [28.4595, 77.0266] },
    "Assam": { "Guwahati": [26.1445, 91.7362] },
    "Odisha": { "Bhubaneswar": [20.2961, 85.8245] },
    "Andhra Pradesh": { "Visakhapatnam": [17.6868, 83.2185] },
    "Jammu and Kashmir": { "Srinagar": [34.0837, 74.7973] },
    "Goa": { "Panaji": [15.4909, 73.8278] },
    "Chhattisgarh": { "Raipur": [21.2514, 81.6296] },
    "Jharkhand": { "Ranchi": [23.3441, 85.3096] },
    "Uttarakhand": { "Dehradun": [30.3165, 78.0322] },
    "Himachal Pradesh": { "Shimla": [31.1048, 77.1734] }
};

function generateShops() {
    let shops = [];
    let shopCounter = 200; 
    const TOTAL_SHOPS = 1000;
    const TOTAL_ALERTS = 137;
    const TOTAL_HIGH = TOTAL_SHOPS - TOTAL_ALERTS;
    let statusDeck = [];
    for(let i=0; i < TOTAL_ALERTS; i++) statusDeck.push(Math.random() > 0.5 ? 'Low' : 'Empty');
    for(let i=0; i < TOTAL_HIGH; i++) statusDeck.push('High');
    statusDeck.sort(() => Math.random() - 0.5);
    const getStatus = () => statusDeck.pop() || 'High';

    shops.push({ id: 101, name: "FPS-101 (Goregaon East, Mumbai)", lat: 19.1688, lng: 72.8561, status: getStatus(), city: 'Mumbai', state: 'Maharashtra' });
    shops.push({ id: 102, name: "FPS-102 (Malad West, Mumbai)",    lat: 19.1874, lng: 72.8282, status: getStatus(), city: 'Mumbai', state: 'Maharashtra' });
    shops.push({ id: 103, name: "FPS-103 (Andheri West, Mumbai)",  lat: 19.1136, lng: 72.8697, status: getStatus(), city: 'Mumbai', state: 'Maharashtra' });
    shops.push({ id: 104, name: "FPS-104 (Dadar, Mumbai)",         lat: 19.0178, lng: 72.8478, status: getStatus(), city: 'Mumbai', state: 'Maharashtra' });
    shops.push({ id: 105, name: "FPS-105 (Colaba, Mumbai)",        lat: 18.9067, lng: 72.8147, status: getStatus(), city: 'Mumbai', state: 'Maharashtra' });

    let cityList = [];
    for (const [state, cities] of Object.entries(indiaLocations)) {
        for (const [city, coords] of Object.entries(cities)) {
            if (city === "Mumbai") continue; 
            shops.push({ id: shopCounter++, name: `FPS-${shopCounter} (${city}, ${state})`, lat: coords[0] + (Math.random() - 0.5) * 0.15, lng: coords[1] + (Math.random() - 0.5) * 0.15, status: getStatus(), city: city, state: state });
            cityList.push({ name: city, state: state, lat: coords[0], lng: coords[1] });
        }
    }

    while (shops.length < 1000) {
        const randomCity = cityList[Math.floor(Math.random() * cityList.length)];
        shops.push({ id: shopCounter++, name: `FPS-${shopCounter} (${randomCity.name}, ${randomCity.state})`, lat: randomCity.lat + (Math.random() - 0.5) * 0.8, lng: randomCity.lng + (Math.random() - 0.5) * 0.8, status: getStatus(), city: randomCity.name, state: randomCity.state });
    }
    return shops;
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, item_name TEXT, quantity REAL)`);
    
    // --- UPDATED: Added 'card_category' column ---
    db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, role TEXT, shop_id INTEGER, name TEXT, card_category TEXT, quota_rice REAL, quota_wheat REAL, quota_sugar REAL, quota_kerosene REAL, quota_dal REAL, quota_rajma REAL)`);
    
    db.run(`CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, card_id TEXT, item TEXT, qty REAL, date TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS shops (id INTEGER PRIMARY KEY, name TEXT, lat REAL, lng REAL, stock_status TEXT, city TEXT, state TEXT)`);

    db.run("DELETE FROM inventory");
    db.run(`INSERT INTO inventory (item_name, quantity) VALUES ('rice', 100), ('wheat', 100), ('sugar', 100), ('kerosene', 100), ('dal', 100), ('rajma', 100)`);

    db.get("SELECT count(*) as count FROM shops", (err, row) => {
        if (row.count < 100) { 
            console.log("[DB] Generating System Data...");
            db.run("DELETE FROM shops");
            db.run("DELETE FROM users");

            // --- UPDATED: Inserting Users with Card Categories ---
            const userStmt = db.prepare("INSERT INTO users (username, role, name, card_category, quota_rice, quota_wheat, quota_sugar, quota_kerosene, quota_dal, quota_rajma, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            // 🟡 Yellow Card (AAY - Poorest)
            userStmt.run('RC-101', 'user', 'Manav Jani', 'Yellow', 35, 35, 10, 10, 10, 10, null);
            
            // 🟠 Orange Card (BPL - Below Poverty Line)
            userStmt.run('RC-102', 'user', 'Ayush Kutre', 'Orange', 20, 20, 5, 5, 5, 5, null);
            
            // ⚪ White Card (APL - Above Poverty Line - New User)
            userStmt.run('RC-103', 'user', 'Meet Johari', 'White', 5, 5, 2, 0, 0, 0, null);
            
            userStmt.run('admin', 'admin', 'Govt Officer', 'Admin', 0,0,0,0,0,0, null);
            
            const shops = generateShops();
            const shopStmt = db.prepare("INSERT INTO shops (id, name, lat, lng, stock_status, city, state) VALUES (?, ?, ?, ?, ?, ?, ?)");
            
            userStmt.run('dealer_goregaon', 'dealer', 'Goregaon Ration Depot', 'Dealer', 0,0,0,0,0,0, 101);
            
            const createdDealers = new Set();
            shops.forEach(s => {
                shopStmt.run(s.id, s.name, s.lat, s.lng, s.status, s.city, s.state);
                const cityKey = s.city.toLowerCase().replace(/ /g, '_');
                if (!createdDealers.has(cityKey)) {
                    userStmt.run(`dealer_${cityKey}`, 'dealer', `Dealer ${s.city}`, 'Dealer', 0,0,0,0,0,0, s.id);
                    createdDealers.add(cityKey);
                }
            });

            shopStmt.finalize();
            userStmt.finalize();
            console.log(`[DB] System Ready: ${shops.length} Shops.`);
        }
    });
});

// --- OTP & LOGIN LOGIC ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { username, role } = req.body;

    console.log(`Dummy OTP requested for ${role}: ${username}`);

    // Instantly bypass Twilio and tell the frontend to use 123456
    return res.json({ 
        success: true, 
        message: "✨ Twilio bypassed. Use Dummy OTP: 123456" 
    });
});
app.post('/api/auth/login', async (req, res) => {
    const { username, role, otp } = req.body;

    // Check if they entered the master code
    if (otp === "123456") {
        console.log(`Master login successful for ${role}: ${username}`);

        // 1. Citizen -> user.html
        if (role === 'user') {
            return res.json({ success: true, redirect: '/user.html' });
        } 
        
        // 2. Dealer -> dealer.html
        else if (role === 'dealer') {
            return res.json({ 
                success: true, 
                redirect: '/dealer.html',
                shopId: username, 
                shopName: 'Goregaon Ration Center' 
            });
        } 
        
        // 3. Admin -> admin.html
        else if (role === 'admin') {
            return res.json({ success: true, redirect: '/admin.html' });
        }
    } 
    
    // Reject any other OTP
    else {
        return res.json({ success: false, error: "Invalid OTP Code. Use 123456." });
    }
});

// --- APIS ---
app.get('/api/shops', (req, res) => db.all("SELECT * FROM shops", [], (err, rows) => res.json(rows)));
app.get('/api/inventory', (req, res) => db.all("SELECT * FROM inventory", [], (err, rows) => { let s={}; rows.forEach(r=>s[r.item_name]=r.quantity); res.json(s); }));

app.post('/api/distribute', (req, res) => {
    const { cardId, commodity, qty } = req.body;
    const quotaColumn = `quota_${commodity}`; 
    db.get("SELECT * FROM users WHERE username = ?", [cardId], (err, user) => {
        if (!user) return res.status(404).json({ error: "Invalid ID" });
        if (user[quotaColumn] < qty) return res.status(400).json({ error: `Quota Exceeded for ${commodity}!` });
        
        db.serialize(() => {
            db.run("UPDATE inventory SET quantity = quantity - ? WHERE item_name = ?", [qty, commodity]);
            db.run(`UPDATE users SET ${quotaColumn} = ${quotaColumn} - ? WHERE username = ?`, [qty, cardId]);
            db.run("INSERT INTO transactions (card_id, item, qty, date) VALUES (?, ?, ?, ?)", [cardId, commodity, qty, new Date().toISOString()]);
        });
        res.json({ message: "Success!", user: user.name });
    });
});

app.get('/api/user/details/:cardId', (req, res) => db.get("SELECT * FROM users WHERE username = ?", [req.params.cardId], (err, row) => res.json(row)));
app.get('/api/user/history/:cardId', (req, res) => db.all("SELECT * FROM transactions WHERE card_id = ? ORDER BY date DESC", [req.params.cardId], (err, rows) => res.json(rows)));
app.get('/api/dealer/history', (req, res) => db.all("SELECT * FROM transactions ORDER BY id DESC", [], (err, rows) => res.json(rows)));

app.post('/api/dealer/alert', (req, res) => {
    const { shopId } = req.body;
    if (!shopId) return res.status(400).json({ error: "Shop ID missing" });
    db.run("UPDATE shops SET stock_status = 'Low' WHERE id = ?", [shopId], function(err) {
        if(this.changes > 0) res.json({ success: true });
        else res.status(404).json({ error: "Shop not found" });
    });
});

app.get('/api/admin/stats', (req, res) => db.all("SELECT item, SUM(qty) as total FROM transactions GROUP BY item", [], (err, rows) => { 
    let s={rice:0, wheat:0, sugar:0, kerosene:0, dal:0, rajma:0}; rows.forEach(r=>s[r.item]=r.total); res.json(s); 
}));

app.post('/api/admin/restock', (req, res) => {
    const { shopId, status } = req.body;
    db.serialize(() => {
        db.run("UPDATE shops SET stock_status = ? WHERE id = ?", [status, shopId]);
        if(status === 'High') {
            ['rice','wheat','sugar','kerosene','dal','rajma'].forEach(i => db.run("UPDATE inventory SET quantity = 100 WHERE item_name = ?", [i]));
        }
    });
    res.json({ message: "Updated" });
});

app.post('/api/admin/restock-all', (req, res) => {
    db.run("UPDATE shops SET stock_status = 'High'", (err) => {
        ['rice','wheat','sugar','kerosene','dal','rajma'].forEach(i => db.run("UPDATE inventory SET quantity = 100 WHERE item_name = ?", [i]));
        res.json({ success: true });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
