import sqlite3

def migrate():
    conn = sqlite3.connect('data/restaurant.db')
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(orders)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Existing columns: {columns}")
    
    if 'order_type' not in columns:
        print("Adding order_type column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN order_type TEXT DEFAULT 'Dine-in'")
        
    if 'payment_method' not in columns:
        print("Adding payment_method column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'Cash'")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
