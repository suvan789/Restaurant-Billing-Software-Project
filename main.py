from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import datetime
import csv
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = FastAPI(title="Restaurant Billing API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = 'data/restaurant.db'
MENU_PATH = 'data/sample_bills.json'

# Initialize database
def init_db():
    if not os.path.exists('data'):
        os.makedirs('data')
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT, price REAL, quantity INTEGER, total REAL, date TEXT, payment_method TEXT, order_type TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Models
class MenuItem(BaseModel):
    name: str
    category: str
    price: float
    gst: float

class OrderItem(BaseModel):
    name: str
    quantity: int
    price: float
    total: float

class OrderRequest(BaseModel):
    items: List[OrderItem]
    payment_method: str
    order_type: str

# Endpoints
@app.get("/menu")
def get_menu():
    try:
        with open(MENU_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        default_menu = {
            "items": [
                {"name": "Margherita Pizza", "category": "Main", "price": 12.50, "gst": 0.05},
                {"name": "Pepperoni Pizza", "category": "Main", "price": 15.00, "gst": 0.05},
                {"name": "Penne Alfredo", "category": "Main", "price": 14.00, "gst": 0.05},
                {"name": "Classic Burger", "category": "Main", "price": 11.00, "gst": 0.05},
                {"name": "Chicken Steak", "category": "Main", "price": 18.50, "gst": 0.05},
                {"name": "Caesar Salad", "category": "Side", "price": 8.00, "gst": 0.05},
                {"name": "French Fries", "category": "Side", "price": 4.50, "gst": 0.05},
                {"name": "Garlic Bread", "category": "Side", "price": 5.00, "gst": 0.05},
                {"name": "Coca Cola", "category": "Drink", "price": 2.50, "gst": 0.18},
                {"name": "Fresh Lime Soda", "category": "Drink", "price": 3.00, "gst": 0.18},
                {"name": "Iced Coffee", "category": "Drink", "price": 4.00, "gst": 0.18},
                {"name": "Chocolate Lava Cake", "category": "Dessert", "price": 7.50, "gst": 0.05},
                {"name": "Vanilla Ice Cream", "category": "Dessert", "price": 5.00, "gst": 0.05}
            ]
        }
        with open(MENU_PATH, 'w') as f:
            json.dump(default_menu, f)
        return default_menu

@app.post("/order")
def create_order(order: OrderRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    total_amount = 0
    for item in order.items:
        cursor.execute("INSERT INTO orders (item, price, quantity, total, date, payment_method, order_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (item.name, item.price, item.quantity, item.total, current_date, order.payment_method, order.order_type))
        total_amount += item.total
    
    conn.commit()
    order_id = cursor.lastrowid
    conn.close()
    
    # Generate PDF
    pdf_path = f"data/bill_{order_id}.pdf"
    generate_pdf(order_id, order.items, total_amount, order.payment_method, current_date, order.order_type, pdf_path)
    
    return {"status": "success", "order_id": order_id, "total": total_amount, "pdf_url": f"/bills/bill_{order_id}.pdf"}

def generate_pdf(order_id, items, grand_total, payment_method, current_date, order_type, pdf_path):
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "RESTAURANT BILL")
    c.setFont("Helvetica", 12)
    c.drawString(100, 730, f"Order ID: {order_id}")
    c.drawString(100, 715, f"Date: {current_date}")
    c.drawString(100, 700, f"Type: {order_type}")
    c.drawString(100, 685, f"Payment: {payment_method}")
    
    c.line(100, 675, 500, 675)
    y = 655
    c.drawString(100, y, "Item")
    c.drawString(300, y, "Qty")
    c.drawString(400, y, "Total")
    y -= 20
    
    c.setFont("Helvetica", 10)
    for item in items:
        c.drawString(100, y, f"{item.name}")
        c.drawString(300, y, f"{item.quantity}")
        c.drawString(400, y, f"${item.total:.2f}")
        y -= 15
        if y < 100:
            c.showPage()
            y = 750
            
    c.line(100, y, 500, y)
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(300, y, "Grand Total:")
    c.drawString(400, y, f"${grand_total:.2f}")
    c.save()

@app.get("/stats")
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Daily sales for chart
    cursor.execute("SELECT date(date), SUM(total) FROM orders GROUP BY date(date) ORDER BY date(date) DESC LIMIT 7")
    daily_sales = cursor.fetchall()
    
    # Top items
    cursor.execute("SELECT item, SUM(quantity) as qty FROM orders GROUP BY item ORDER BY qty DESC LIMIT 5")
    top_items = cursor.fetchall()
    
    conn.close()
    
    return {
        "daily_sales": [{"date": d, "amount": a} for d, a in daily_sales],
        "top_items": [{"name": n, "quantity": q} for n, q in top_items]
    }

@app.post("/menu")
def update_menu(menu_data: dict):
    with open(MENU_PATH, 'w') as f:
        json.dump(menu_data, f)
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
