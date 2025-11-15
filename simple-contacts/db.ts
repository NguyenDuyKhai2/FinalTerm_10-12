import * as SQLite from 'expo-sqlite';

export interface Contact {
  id?: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
  created_at?: number;
}

let db: SQLite.SQLiteDatabase | null = null;

// Khởi tạo database
const getDatabase = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('contacts.db');
  }
  return db;
};

// Khởi tạo database và tạo bảng
export const initDatabase = () => {
  try {
    const database = getDatabase();
    
    database.execSync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        favorite INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);
    
    // Seed dữ liệu mẫu nếu chưa có
    const result = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM contacts');
    if (result && result.count === 0) {
      seedSampleData();
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
};

// Seed dữ liệu mẫu
const seedSampleData = () => {
  try {
    const database = getDatabase();
    const sampleContacts = [
      { name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@email.com' },
      { name: 'Trần Thị B', phone: '0912345678', email: 'tranthib@email.com' },
      { name: 'Lê Văn C', phone: '0923456789', email: 'levanc@email.com' },
    ];

    sampleContacts.forEach(contact => {
      database.runSync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, 0, ?)',
        [contact.name, contact.phone, contact.email, Date.now()]
      );
    });
    
    console.log('✅ Sample data seeded');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Lấy tất cả contacts
export const getAllContacts = (): Contact[] => {
  try {
    const database = getDatabase();
    const contacts = database.getAllSync<Contact>('SELECT * FROM contacts ORDER BY name ASC');
    return contacts || [];
  } catch (error) {
    console.error('❌ Error getting contacts:', error);
    return [];
  }
};

// Thêm contact mới
export const addContact = (contact: Omit<Contact, 'id' | 'created_at'>): number => {
  try {
    const database = getDatabase();
    const result = database.runSync(
      'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
      [contact.name, contact.phone, contact.email, contact.favorite || 0, Date.now()]
    );
    console.log('✅ Contact added:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('❌ Error adding contact:', error);
    throw error;
  }
};

// Cập nhật contact
export const updateContact = (id: number, contact: Partial<Contact>): void => {
  try {
    const database = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (contact.name !== undefined) {
      updates.push('name = ?');
      values.push(contact.name);
    }
    if (contact.phone !== undefined) {
      updates.push('phone = ?');
      values.push(contact.phone);
    }
    if (contact.email !== undefined) {
      updates.push('email = ?');
      values.push(contact.email);
    }
    if (contact.favorite !== undefined) {
      updates.push('favorite = ?');
      values.push(contact.favorite);
    }

    if (updates.length > 0) {
      values.push(id);
      database.runSync(
        `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      console.log('✅ Contact updated:', id);
    }
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    throw error;
  }
};

// Xóa contact
export const deleteContact = (id: number): void => {
  try {
    const database = getDatabase();
    database.runSync('DELETE FROM contacts WHERE id = ?', [id]);
    console.log('✅ Contact deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    throw error;
  }
};

// Tìm kiếm contacts
export const searchContacts = (query: string): Contact[] => {
  try {
    const database = getDatabase();
    const searchQuery = `%${query}%`;
    const contacts = database.getAllSync<Contact>(
      'SELECT * FROM contacts WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC',
      [searchQuery, searchQuery]
    );
    return contacts || [];
  } catch (error) {
    console.error('❌ Error searching contacts:', error);
    return [];
  }
};

// Kiểm tra phone đã tồn tại
export const phoneExists = (phone: string): boolean => {
  try {
    const database = getDatabase();
    const result = database.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts WHERE phone = ?',
      [phone]
    );
    return result ? result.count > 0 : false;
  } catch (error) {
    console.error('❌ Error checking phone:', error);
    return false;
  }
};