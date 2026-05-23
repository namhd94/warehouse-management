/* global process */
import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// In production, DATA_DIR points to the database directory if local.
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = path.join(DATA_DIR, 'warehouse.db');

app.use(cors());
app.use(express.json());

// Serve React build in production
const DIST_PATH = path.join(__dirname, 'dist');
app.use(express.static(DIST_PATH));

// Helper to normalize strings for ID generation
function slugify(text) {
  if (!text) return Math.random().toString(36).substring(2, 9);
  return text.toString().toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
}

// PreparedStatement compatibility wrapper for libSQL
class PreparedStatement {
  constructor(wrapper, sql) {
    this.wrapper = wrapper;
    this.sql = sql;
    this.paramsList = [];
  }

  async run(...params) {
    const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    this.paramsList.push(args);
  }

  async finalize() {
    if (this.paramsList.length === 0) return;
    if (this.wrapper.activeTx) {
      for (const args of this.paramsList) {
        await this.wrapper.activeTx.execute({ sql: this.sql, args });
      }
    } else {
      const batchQueries = this.paramsList.map(args => ({
        sql: this.sql,
        args
      }));
      await this.wrapper.client.batch(batchQueries, "write");
    }
    this.paramsList = [];
  }
}

// LibSqlWrapper maps sqlite3 API (all, get, run, prepare, exec) to @libsql/client
class LibSqlWrapper {
  constructor(client) {
    this.client = client;
    this.activeTx = null;
  }

  get executor() {
    return this.activeTx || this.client;
  }

  async exec(sql) {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (statements.length > 0) {
      if (this.activeTx) {
        for (const stmt of statements) {
          await this.activeTx.execute(stmt);
        }
      } else {
        await this.client.batch(statements, "write");
      }
    }
  }

  async run(sql, params) {
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith('BEGIN')) {
      this.activeTx = await this.client.transaction('write');
      return { lastID: undefined, changes: 0 };
    }
    if (sqlUpper === 'COMMIT' || sqlUpper === 'END TRANSACTION') {
      if (this.activeTx) {
        await this.activeTx.commit();
        this.activeTx = null;
      }
      return { lastID: undefined, changes: 0 };
    }
    if (sqlUpper === 'ROLLBACK' || sqlUpper === 'ROLLBACK TRANSACTION') {
      if (this.activeTx) {
        try {
          await this.activeTx.rollback();
        } catch (e) {
          // Ignore rollback errors if transaction was aborted/closed
        }
        this.activeTx = null;
      }
      return { lastID: undefined, changes: 0 };
    }

    const result = await this.executor.execute({ sql, args: params || [] });
    return {
      lastID: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : undefined,
      changes: result.rowsAffected
    };
  }

  async all(sql, params) {
    const result = await this.executor.execute({ sql, args: params || [] });
    return result.rows;
  }

  async get(sql, params) {
    const result = await this.executor.execute({ sql, args: params || [] });
    return result.rows[0];
  }

  async prepare(sql) {
    return new PreparedStatement(this, sql);
  }
}

// Database Connection
let db;
async function initDb() {
  const url = process.env.TURSO_DATABASE_URL || `file:${DB_PATH}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`Connecting database: ${url.startsWith('libsql://') ? 'Turso Cloud' : 'Local SQLite (' + url + ')'}`);

  const client = createClient({
    url,
    authToken
  });

  db = new LibSqlWrapper(client);

  // Ensure tables exist in case the file doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      plate TEXT,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      unit TEXT,
      location TEXT,
      initial_quantity REAL DEFAULT 0,
      check_month TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'NHAP' or 'XUAT'
      material_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      driver_id TEXT, -- nullable
      odometer REAL, -- nullable
      notes TEXT,
      FOREIGN KEY (material_id) REFERENCES materials (id),
      FOREIGN KEY (driver_id) REFERENCES drivers (id)
    );
  `);
  console.log(`Connected to SQLite database at ${DB_PATH}`);
}

// --- API DRIVERS ---

// Get all drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await db.all('SELECT * FROM drivers ORDER BY code ASC');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create driver
app.post('/api/drivers', async (req, res) => {
  const { code, plate, name } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Driver code is required' });
  }
  const id = `drv-${slugify(code)}`;
  try {
    await db.run(
      'INSERT INTO drivers (id, code, plate, name) VALUES (?, ?, ?, ?)',
      [id, code.trim(), plate ? plate.trim() : null, name ? name.trim() : null]
    );
    const newDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(newDriver);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: `Driver code '${code}' already exists` });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update driver
app.put('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  const { code, plate, name } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Driver code is required' });
  }
  try {
    await db.run(
      'UPDATE drivers SET code = ?, plate = ?, name = ? WHERE id = ?',
      [code.trim(), plate ? plate.trim() : null, name ? name.trim() : null, id]
    );
    const updated = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    if (!updated) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(updated);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: `Driver code '${code}' already exists` });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete driver
app.delete('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if referenced in transactions
    const ref = await db.get('SELECT id FROM transactions WHERE driver_id = ? LIMIT 1', [id]);
    if (ref) {
      return res.status(400).json({ error: 'Cannot delete driver because they have transactions logged' });
    }
    const result = await db.run('DELETE FROM drivers WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch insert/upsert drivers
app.post('/api/drivers/batch', async (req, res) => {
  const drivers = req.body;
  if (!Array.isArray(drivers)) {
    return res.status(400).json({ error: 'Expected an array of drivers' });
  }
  try {
    await db.run('BEGIN TRANSACTION');
    const stmt = await db.prepare(`
      INSERT INTO drivers (id, code, plate, name)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        plate=COALESCE(excluded.plate, plate),
        name=COALESCE(excluded.name, name)
    `);
    
    for (const d of drivers) {
      if (!d.code) continue;
      const code = d.code.toString().trim();
      const id = d.id || `drv-${slugify(code)}`;
      const plate = d.plate ? d.plate.toString().trim() : null;
      const name = d.name ? d.name.toString().trim() : null;
      await stmt.run(id, code, plate, name);
    }
    
    await stmt.finalize();
    await db.run('COMMIT');
    
    const allDrivers = await db.all('SELECT * FROM drivers ORDER BY code ASC');
    res.json({ message: 'Drivers imported successfully', count: drivers.length, data: allDrivers });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// --- API MATERIALS ---

// Get all materials (with dynamic stock calculation)
app.get('/api/materials', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(CASE WHEN t.type = 'NHAP' THEN t.quantity ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN t.type = 'XUAT' THEN t.quantity ELSE 0 END), 0) as total_out,
        (m.initial_quantity + 
         COALESCE(SUM(CASE WHEN t.type = 'NHAP' THEN t.quantity ELSE 0 END), 0) - 
         COALESCE(SUM(CASE WHEN t.type = 'XUAT' THEN t.quantity ELSE 0 END), 0)
        ) as current_quantity
      FROM materials m
      LEFT JOIN transactions t ON m.id = t.material_id
      GROUP BY m.id
      ORDER BY m.code ASC
    `;
    const materials = await db.all(query);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create material
app.post('/api/materials', async (req, res) => {
  const { code, name, unit, location, initial_quantity, check_month } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Material name is required' });
  }
  
  const slug = slugify(name);
  const finalCode = code ? code.trim() : `VT-${slug.substring(0, 5).toUpperCase()}`;
  const id = `mat-${slug}`;
  const initQty = initial_quantity ? parseFloat(initial_quantity) : 0;
  
  try {
    // Generate unique code if code conflicts
    let codeCheck = await db.get('SELECT id FROM materials WHERE code = ?', [finalCode]);
    let codeToInsert = finalCode;
    let codeCounter = 1;
    while (codeCheck) {
      codeToInsert = `${finalCode}-${codeCounter}`;
      codeCheck = await db.get('SELECT id FROM materials WHERE code = ?', [codeToInsert]);
      codeCounter++;
    }

    // Generate unique ID if ID conflicts
    let idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [id]);
    let idToInsert = id;
    let idCounter = 1;
    while (idCheck) {
      idToInsert = `${id}-${idCounter}`;
      idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [idToInsert]);
      idCounter++;
    }

    await db.run(
      'INSERT INTO materials (id, code, name, unit, location, initial_quantity, check_month) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        idToInsert,
        codeToInsert,
        name.trim(),
        unit ? unit.trim() : 'Cái',
        location ? location.trim() : 'Kho chung',
        initQty,
        check_month ? check_month.trim() : new Date().toISOString().substring(0, 7)
      ]
    );
    const newMat = await db.get('SELECT * FROM materials WHERE id = ?', [idToInsert]);
    res.status(201).json(newMat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update material
app.put('/api/materials/:id', async (req, res) => {
  const { id } = req.params;
  const { code, name, unit, location, initial_quantity, check_month } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Material name is required' });
  }
  if (!code) {
    return res.status(400).json({ error: 'Material code is required' });
  }
  const initQty = initial_quantity ? parseFloat(initial_quantity) : 0;
  try {
    await db.run(
      'UPDATE materials SET code = ?, name = ?, unit = ?, location = ?, initial_quantity = ?, check_month = ? WHERE id = ?',
      [
        code.trim(),
        name.trim(),
        unit ? unit.trim() : 'Cái',
        location ? location.trim() : 'Kho chung',
        initQty,
        check_month ? check_month.trim() : new Date().toISOString().substring(0, 7),
        id
      ]
    );
    const updated = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(updated);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: `Material code '${code}' already exists` });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete material
app.delete('/api/materials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if referenced in transactions
    const ref = await db.get('SELECT id FROM transactions WHERE material_id = ? LIMIT 1', [id]);
    if (ref) {
      return res.status(400).json({ error: 'Cannot delete material because it has transaction history' });
    }
    const result = await db.run('DELETE FROM materials WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch insert/upsert materials
app.post('/api/materials/batch', async (req, res) => {
  const materials = req.body;
  if (!Array.isArray(materials)) {
    return res.status(400).json({ error: 'Expected an array of materials' });
  }
  try {
    await db.run('BEGIN TRANSACTION');
    
    // We will do a loop to handle optional codes and ID generation
    for (const m of materials) {
      if (!m.name) continue;
      
      const name = m.name.toString().trim();
      const slug = slugify(name);
      let code = m.code ? m.code.toString().trim() : `VT-${slug.substring(0, 5).toUpperCase()}`;
      
      // Let's check if code exists. If not, insert. If yes, update.
      const existing = await db.get('SELECT id FROM materials WHERE code = ?', [code]);
      
      const unit = m.unit ? m.unit.toString().trim() : 'Cái';
      const location = m.location ? m.location.toString().trim() : 'Kho chung';
      const initial_quantity = m.initial_quantity !== undefined ? parseFloat(m.initial_quantity) : 0;
      const check_month = m.check_month ? m.check_month.toString().trim() : new Date().toISOString().substring(0, 7);

      if (existing) {
        // Update
        await db.run(
          'UPDATE materials SET name = ?, unit = ?, location = ?, initial_quantity = ?, check_month = ? WHERE id = ?',
          [name, unit, location, initial_quantity, check_month, existing.id]
        );
      } else {
        // Insert
        let id = m.id || `mat-${slug}`;
        let idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [id]);
        let idCounter = 1;
        const baseId = id;
        while (idCheck) {
          id = `${baseId}-${idCounter}`;
          idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [id]);
          idCounter++;
        }
        
        await db.run(
          'INSERT INTO materials (id, code, name, unit, location, initial_quantity, check_month) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, code, name, unit, location, initial_quantity, check_month]
        );
      }
    }
    
    await db.run('COMMIT');
    
    // Fetch all materials with dynamic current_quantity to return
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(CASE WHEN t.type = 'NHAP' THEN t.quantity ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN t.type = 'XUAT' THEN t.quantity ELSE 0 END), 0) as total_out,
        (m.initial_quantity + 
         COALESCE(SUM(CASE WHEN t.type = 'NHAP' THEN t.quantity ELSE 0 END), 0) - 
         COALESCE(SUM(CASE WHEN t.type = 'XUAT' THEN t.quantity ELSE 0 END), 0)
        ) as current_quantity
      FROM materials m
      LEFT JOIN transactions t ON m.id = t.material_id
      GROUP BY m.id
      ORDER BY m.code ASC
    `;
    const allMaterials = await db.all(query);
    res.json({ message: 'Materials imported successfully', count: materials.length, data: allMaterials });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// --- API TRANSACTIONS ---

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        m.code as material_code,
        m.name as material_name,
        m.unit as material_unit,
        m.location as material_location,
        d.code as driver_code,
        d.plate as driver_plate,
        d.name as driver_name
      FROM transactions t
      LEFT JOIN materials m ON t.material_id = m.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.date DESC, t.id DESC
    `;
    const transactions = await db.all(query);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  const { date, type, material_id, quantity, driver_id, odometer, notes } = req.body;
  
  if (!date) return res.status(400).json({ error: 'Date is required' });
  if (!type || (type !== 'NHAP' && type !== 'XUAT')) return res.status(400).json({ error: 'Type must be NHAP or XUAT' });
  if (!material_id) return res.status(400).json({ error: 'Material ID is required' });
  if (quantity === undefined || parseFloat(quantity) <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });

  const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const parsedQty = parseFloat(quantity);
  const parsedOdom = odometer ? parseFloat(odometer) : null;
  
  try {
    // Verify material exists
    const mat = await db.get('SELECT id FROM materials WHERE id = ?', [material_id]);
    if (!mat) {
      return res.status(400).json({ error: 'Material does not exist' });
    }
    
    // Verify driver exists if driver_id is provided
    if (driver_id) {
      const drv = await db.get('SELECT id FROM drivers WHERE id = ?', [driver_id]);
      if (!drv) {
        return res.status(400).json({ error: 'Driver does not exist' });
      }
    }

    await db.run(
      'INSERT INTO transactions (id, date, type, material_id, quantity, driver_id, odometer, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, date, type, material_id, parsedQty, driver_id || null, parsedOdom, notes ? notes.trim() : '']
    );

    // Return the inserted transaction with all details joined
    const newTx = await db.get(`
      SELECT 
        t.*,
        m.code as material_code,
        m.name as material_name,
        m.unit as material_unit,
        d.code as driver_code,
        d.plate as driver_plate,
        d.name as driver_name
      FROM transactions t
      LEFT JOIN materials m ON t.material_id = m.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = ?
    `, [id]);
    
    res.status(201).json(newTx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { date, type, material_id, quantity, driver_id, odometer, notes } = req.body;
  
  if (!date) return res.status(400).json({ error: 'Date is required' });
  if (!type || (type !== 'NHAP' && type !== 'XUAT')) return res.status(400).json({ error: 'Type must be NHAP or XUAT' });
  if (!material_id) return res.status(400).json({ error: 'Material ID is required' });
  if (quantity === undefined || parseFloat(quantity) <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });

  const parsedQty = parseFloat(quantity);
  const parsedOdom = odometer ? parseFloat(odometer) : null;

  try {
    const existing = await db.get('SELECT id FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.run(
      'UPDATE transactions SET date = ?, type = ?, material_id = ?, quantity = ?, driver_id = ?, odometer = ?, notes = ? WHERE id = ?',
      [date, type, material_id, parsedQty, driver_id || null, parsedOdom, notes ? notes.trim() : '', id]
    );

    const updated = await db.get(`
      SELECT 
        t.*,
        m.code as material_code,
        m.name as material_name,
        m.unit as material_unit,
        d.code as driver_code,
        d.plate as driver_plate,
        d.name as driver_name
      FROM transactions t
      LEFT JOIN materials m ON t.material_id = m.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = ?
    `, [id]);
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM transactions WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch insert transactions (Excel Import)
app.post('/api/transactions/batch', async (req, res) => {
  const transactions = req.body;
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Expected an array of transactions' });
  }
  
  try {
    await db.run('BEGIN TRANSACTION');
    
    const stmt = await db.prepare(`
      INSERT INTO transactions (id, date, type, material_id, quantity, driver_id, odometer, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // We need to resolve codes/names to database IDs
    const allMaterials = await db.all('SELECT id, code, LOWER(name) as norm_name FROM materials');
    const allDrivers = await db.all('SELECT id, code, plate, LOWER(name) as norm_name FROM drivers');

    const batchTs = Date.now();  // Shared timestamp for this batch
    let rowCounter = 0;          // Counter ensures unique IDs even in the same millisecond

    for (const t of transactions) {
      if (!t.date || !t.material_code_or_name) continue;
      
      const date = t.date.toString().substring(0, 10);
      const type = t.type === 'NHAP' || t.type === 'NHẬP' || t.type === 'IN' ? 'NHAP' : 'XUAT';
      const qty = parseFloat(t.quantity);
      if (isNaN(qty) || qty <= 0) continue;

      // Find material ID
      const matSearch = t.material_code_or_name.toString().trim().toLowerCase();
      let material_id = null;
      
      // Match by code first
      let mat = allMaterials.find(m => m.code && m.code.toLowerCase() === matSearch);
      // Match by name if no code match
      if (!mat) mat = allMaterials.find(m => m.norm_name === matSearch);
      
      if (mat) {
        material_id = mat.id;
      } else {
        // Create new material if it doesn't exist
        const name = t.material_code_or_name.toString().trim();
        const slug = slugify(name);
        const code = `VT-${slug.substring(0, 5).toUpperCase()}`;
        const unit = t.unit || 'Cái';
        const location = 'Kho chung';
        material_id = `mat-${slug}`;
        
        let idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [material_id]);
        let idCounter = 1;
        const baseId = material_id;
        while (idCheck) {
          material_id = `${baseId}-${idCounter}`;
          idCheck = await db.get('SELECT id FROM materials WHERE id = ?', [material_id]);
          idCounter++;
        }
        
        // Generate unique code if code conflicts
        let codeCheck = await db.get('SELECT id FROM materials WHERE code = ?', [code]);
        let codeToInsert = code;
        let codeCounter = 1;
        while (codeCheck) {
          codeToInsert = `${code}-${codeCounter}`;
          codeCheck = await db.get('SELECT id FROM materials WHERE code = ?', [codeToInsert]);
          codeCounter++;
        }

        await db.run(
          'INSERT INTO materials (id, code, name, unit, location, initial_quantity, check_month) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [material_id, codeToInsert, name, unit, location, 0, new Date().toISOString().substring(0, 7)]
        );
        // Add to local list to prevent re-creation in same batch
        allMaterials.push({ id: material_id, code: codeToInsert, norm_name: name.toLowerCase() });
      }

      // Find driver ID
      let driver_id = null;
      if (t.driver_code_or_name) {
        const drvSearch = t.driver_code_or_name.toString().trim().toLowerCase();
        let drv = allDrivers.find(d => d.code && d.code.toLowerCase() === drvSearch);
        if (!drv) drv = allDrivers.find(d => d.norm_name === drvSearch);
        // Match by plate
        if (!drv && t.plate) {
          const plateClean = t.plate.toString().replace(/\s+/g, '').toLowerCase();
          drv = allDrivers.find(d => d.plate && d.plate.replace(/\s+/g, '').toLowerCase() === plateClean);
        }

        if (drv) {
          driver_id = drv.id;
        } else {
          // Create new driver
          const code = `TX-${slugify(t.driver_code_or_name).substring(0, 4).toUpperCase()}`;
          const plate = t.plate ? t.plate.toString().trim() : null;
          const name = t.driver_code_or_name.toString().trim();
          driver_id = `drv-${slugify(code)}`;
          
          await db.run(
            'INSERT INTO drivers (id, code, plate, name) VALUES (?, ?, ?, ?)',
            [driver_id, code, plate, name]
          );
          allDrivers.push({ id: driver_id, code, plate, norm_name: name.toLowerCase() });
        }
      }

      // Use batchTs + rowCounter to guarantee uniqueness across the entire batch
      const txId = `tx-imp-${batchTs}-${String(rowCounter).padStart(5, '0')}`;
      rowCounter++;
      const odom = t.odometer ? parseFloat(t.odometer) : null;
      const notes = t.notes ? t.notes.toString().trim() : '';

      await stmt.run(txId, date, type, material_id, qty, driver_id, odom, notes);
    }


    await stmt.finalize();
    await db.run('COMMIT');

    // Fetch and return updated list
    const query = `
      SELECT 
        t.*,
        m.code as material_code,
        m.name as material_name,
        m.unit as material_unit,
        m.location as material_location,
        d.code as driver_code,
        d.plate as driver_plate,
        d.name as driver_name
      FROM transactions t
      LEFT JOIN materials m ON t.material_id = m.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.date DESC, t.id DESC
    `;
    const allTxs = await db.all(query);
    res.json({ message: 'Transactions imported successfully', count: transactions.length, data: allTxs });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// ─── BACKUP / RESTORE ────────────────────────────────────────────────────────

// GET /api/backup — Full database export with exact IDs (safe for restore)
app.get('/api/backup', async (req, res) => {
  try {
    const drivers      = await db.all('SELECT * FROM drivers ORDER BY code ASC');
    const materials    = await db.all('SELECT * FROM materials ORDER BY code ASC');
    const transactions = await db.all('SELECT * FROM transactions ORDER BY date ASC, id ASC');

    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      counts: { drivers: drivers.length, materials: materials.length, transactions: transactions.length },
      drivers,
      materials,
      transactions,
    };

    // Set headers so the browser triggers a file download
    const filename = `warehouse_backup_${new Date().toISOString().substring(0, 10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/restore — Full database restore from a backup JSON
// Clears all data then re-inserts in correct dependency order:
//   drivers → materials → transactions
app.post('/api/restore', async (req, res) => {
  const { version, drivers = [], materials = [], transactions = [] } = req.body;

  if (version !== 1) {
    return res.status(400).json({ error: 'Unsupported backup version. Only version 1 is supported.' });
  }

  try {
    await db.run('BEGIN TRANSACTION');

    // Clear all tables in reverse-dependency order to avoid FK issues
    await db.run('DELETE FROM transactions');
    await db.run('DELETE FROM materials');
    await db.run('DELETE FROM drivers');

    // 1. Restore drivers
    for (const d of drivers) {
      if (!d.id || !d.code) continue;
      await db.run(
        'INSERT INTO drivers (id, code, plate, name) VALUES (?, ?, ?, ?)',
        [d.id, d.code.trim(), d.plate || null, d.name || null]
      );
    }

    // 2. Restore materials
    for (const m of materials) {
      if (!m.id || !m.name) continue;
      await db.run(
        'INSERT INTO materials (id, code, name, unit, location, initial_quantity, check_month) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          m.id,
          m.code   || null,
          m.name.trim(),
          m.unit   || 'Cái',
          m.location || 'Kho chung',
          m.initial_quantity || 0,
          m.check_month || new Date().toISOString().substring(0, 7),
        ]
      );
    }

    // 3. Restore transactions (IDs and foreign keys are preserved exactly)
    for (const t of transactions) {
      if (!t.id || !t.material_id || !t.date) continue;
      await db.run(
        'INSERT INTO transactions (id, date, type, material_id, quantity, driver_id, odometer, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          t.id,
          t.date,
          t.type === 'NHAP' ? 'NHAP' : 'XUAT',
          t.material_id,
          parseFloat(t.quantity) || 0,
          t.driver_id || null,
          t.odometer  ? parseFloat(t.odometer) : null,
          t.notes || '',
        ]
      );
    }

    await db.run('COMMIT');

    res.json({
      message: 'Database restored successfully',
      counts: { drivers: drivers.length, materials: materials.length, transactions: transactions.length },
    });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// SPA fallback — serve React app for any non-API route (React Router handles it client-side)
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback for development when dist/ doesn't exist yet
    res.status(404).json({ error: 'Frontend not built. Run: npm run build' });
  }
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
