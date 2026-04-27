import os
import sqlite3
# Note: For MySQL/MongoDB, you would use 'mysql-connector-python' or 'pymongo'
# from pymongo import MongoClient
# import mysql.connector

class Database:
    def __init__(self, db_type='sqlite'):
        self.db_type = db_type
        self.conn = None
        
    def connect(self):
        if self.db_type == 'sqlite':
            db_path = 'data/restaurant.db'
            if not os.path.exists('data'):
                os.makedirs('data')
            self.conn = sqlite3.connect(db_path)
            print("Connected to SQLite.")
            return self.conn
        
        elif self.db_type == 'mysql':
            # Example MySQL connection configuration
            config = {
                'user': 'root',
                'password': 'password123',
                'host': '127.0.0.1',
                'database': 'restaurant_db',
                'raise_on_warnings': True
            }
            print("MySQL Configuration ready. Install 'mysql-connector-python' to connect.")
            return config
            
        elif self.db_type == 'mongodb':
            # Example MongoDB connection string
            connection_string = "mongodb://localhost:27017/restaurant_db"
            print(f"MongoDB URI ready: {connection_string}. Install 'pymongo' to connect.")
            return connection_string

def init_mongodb():
    """Initializes MongoDB collection with sample data."""
    print("Initializing MongoDB collections...")
    # client = MongoClient("mongodb://localhost:27017/")
    # db = client["restaurant_db"]
    # menu = db["menu"]
    pass

def init_mysql():
    """Initializes MySQL tables."""
    print("Generating MySQL table schemas...")
    schema = """
    CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255),
        price DECIMAL(10, 2),
        quantity INT,
        total DECIMAL(10, 2),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    return schema
