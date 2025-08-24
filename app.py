import tkinter as tk
print("Starting script...")
from tkinter import messagebox, Toplevel, ttk
print("Imported Tkinter modules...")
import sqlite3
print("Imported sqlite3...")
import json
print("Imported json...")
import datetime
print("Imported datetime...")
import csv
print("Imported csv...")
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
print("Imported reportlab...")

# Initialize database
conn = sqlite3.connect('data/restaurant.db')
print("Connected to database...")
cursor = conn.cursor()
print("Created cursor...")
cursor.execute('''CREATE TABLE IF NOT EXISTS orders 
                  (id INTEGER PRIMARY KEY, item TEXT, price REAL, quantity INTEGER, total REAL, date TEXT, payment_method TEXT, order_type TEXT)''')
print("Created table...")
conn.commit()
print("Database initialized...")

# Load menu from sample_bills.json
try:
    with open('data/sample_bills.json', 'r') as f:
        menu_data = json.load(f)
    print("Loaded menu from file...")
except FileNotFoundError:
    menu_data = {
        "items": [
            {"name": "Pizza", "category": "Main", "price": 10.0, "gst": 0.05},
            {"name": "Pasta", "category": "Main", "price": 8.0, "gst": 0.05},
            {"name": "Salad", "category": "Side", "price": 4.0, "gst": 0.05}
        ]
    }
    with open('data/sample_bills.json', 'w') as f:
        json.dump(menu_data, f)
    print("Created default menu file...")
print("Menu loaded...")

def login_screen():
    print("Opening login screen...")
    login_window = Toplevel()
    print("Created login window...")
    login_window.title("Login")
    login_window.geometry("300x200")

    tk.Label(login_window, text="Username:").pack(pady=5)
    username = tk.Entry(login_window)
    username.pack(pady=5)
    tk.Label(login_window, text="Password:").pack(pady=5)
    password = tk.Entry(login_window, show="*")
    password.pack(pady=5)

    def check_login():
        print("Checking login...")
        if username.get() == "admin" and password.get() == "pass123":
            print("Login successful...")
            login_window.destroy()
            main_app()
        else:
            messagebox.showerror("Error", "Invalid credentials!")

    tk.Button(login_window, text="Login", command=check_login).pack(pady=10)
    print("Login screen setup complete...")

def generate_pdf_bill(order_id, current_order, grand_total, payment_method, current_date, order_type):
    print(f"Generating PDF bill for order {order_id}...")
    pdf_name = f"data/bill_{order_id}.pdf"
    c = canvas.Canvas(pdf_name, pagesize=letter)
    c.drawString(100, 750, "Restaurant Bill")
    c.drawString(100, 730, f"Date: {current_date}")
    c.drawString(100, 710, f"Type: {order_type}")
    c.drawString(100, 690, f"Payment: {payment_method}")
    y = 660
    for item in current_order:
        c.drawString(100, y, f"{item['quantity']} x {item['name']} - ${item['total']:.2f}")
        y -= 20
    c.drawString(100, y - 20, f"Total: ${grand_total:.2f}")
    c.save()
    return pdf_name

def generate_sales_report():
    print("Generating sales report...")
    cursor.execute("SELECT date, SUM(total) FROM orders GROUP BY date")
    daily_sales = cursor.fetchall()
    cursor.execute("SELECT item, SUM(quantity) AS total_qty FROM orders GROUP BY item ORDER BY total_qty DESC LIMIT 5")
    most_sold = cursor.fetchall()
    
    if not daily_sales and not most_sold:
        messagebox.showinfo("Report", "No sales data available.")
        return
    
    csv_name = "data/sales_report.csv"
    with open(csv_name, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["Daily Sales"])
        writer.writerow(["Date", "Total Sales"])
        writer.writerows(daily_sales)
        writer.writerow([])
        writer.writerow(["Most Sold Items"])
        writer.writerow(["Item", "Total Quantity"])
        writer.writerows(most_sold)
    
    report_window = Toplevel()
    report_window.title("Sales Report")
    report_text = tk.Text(report_window, height=15, width=50)
    report_text.pack()
    report_text.insert(tk.END, "Daily Sales:\n")
    for date, total in daily_sales:
        report_text.insert(tk.END, f"{date}: ${total:.2f}\n")
    report_text.insert(tk.END, "\nMost Sold Items:\n")
    for item, qty in most_sold:
        report_text.insert(tk.END, f"{item}: {qty}\n")
    report_text.config(state=tk.DISABLED)
    messagebox.showinfo("Report Generated", f"Sales report saved as {csv_name}")

def main_app():
    print("Launching main application...")
    root = tk.Tk()
    print("Created main window...")
    root.title("Restaurant Billing Software")
    root.geometry("700x800")

    # Live Clock
    def update_clock():
        current_time = datetime.datetime.now().strftime("%H:%M:%S")
        clock_label.config(text=f"Time: {current_time}")
        root.after(1000, update_clock)

    clock_label = tk.Label(root, text="", font=("Arial", 10))
    clock_label.pack(pady=5)
    update_clock()

    # Menu Display
    tk.Label(root, text="Menu", font=("Arial", 14)).pack(pady=10)
    menu_frame = ttk.Frame(root)
    menu_frame.pack(fill=tk.BOTH, expand=True)
    menu_list = tk.Listbox(menu_frame, height=5, width=50)
    for item in menu_data["items"]:
        menu_list.insert(tk.END, f"{item['name']} ({item['category']}) - ${item['price']} + {item['gst']*100}% GST")
    menu_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    scrollbar = ttk.Scrollbar(menu_frame, orient=tk.VERTICAL, command=menu_list.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    menu_list.config(yscrollcommand=scrollbar.set)

    # Order Type
    order_type_frame = tk.Frame(root)
    order_type_frame.pack(pady=5)
    tk.Label(order_type_frame, text="Order Type:").pack(side=tk.LEFT)
    order_type_var = tk.StringVar(value="Dine-in")
    order_type_menu = tk.OptionMenu(order_type_frame, order_type_var, "Dine-in", "Takeaway")
    order_type_menu.pack(side=tk.LEFT, padx=5)

    # Order Entry
    order_frame = tk.Frame(root)
    order_frame.pack(pady=10)
    tk.Label(order_frame, text="Select Item:").pack(side=tk.LEFT)
    item_var = tk.StringVar()
    item_menu = tk.OptionMenu(order_frame, item_var, *[item["name"] for item in menu_data["items"]])
    item_menu.pack(side=tk.LEFT, padx=5)
    tk.Label(order_frame, text="Quantity:").pack(side=tk.LEFT)
    qty_var = tk.Entry(order_frame, width=5)
    qty_var.pack(side=tk.LEFT, padx=5)

    # Current Order
    tk.Label(root, text="Current Order", font=("Arial", 12)).pack(pady=10)
    order_list = tk.Listbox(root, height=5, width=50)
    order_list.pack()
    current_order = []

    def add_to_order():
        item_name = item_var.get()
        if not item_name:
            messagebox.showerror("Error", "Select an item!")
            return
        try:
            quantity = int(qty_var.get())
            if quantity <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Enter a valid quantity!")
            return
        
        item = next(i for i in menu_data["items"] if i["name"] == item_name)
        subtotal = item["price"] * quantity
        gst_rate = item["gst"] if order_type_var.get() == "Dine-in" else 0.0
        gst_amount = subtotal * gst_rate
        total = subtotal + gst_amount
        order_item = {"name": item_name, "quantity": quantity, "subtotal": subtotal, "gst": gst_amount, "total": total}
        current_order.append(order_item)
        order_list.insert(tk.END, f"{quantity} x {item_name} - Subtotal: ${subtotal:.2f}, GST: ${gst_amount:.2f}, Total: ${total:.2f}")
        qty_var.delete(0, tk.END)
        update_total()

    tk.Button(root, text="Add to Order", command=add_to_order).pack(pady=5)

    # Remove Item
    def remove_item():
        selected = order_list.curselection()
        if not selected:
            messagebox.showerror("Error", "Select an item to remove!")
            return
        del current_order[selected[0]]
        order_list.delete(selected[0])
        update_total()

    tk.Button(root, text="Remove Selected Item", command=remove_item).pack(pady=5)

    # Total Display
    total_label = tk.Label(root, text="Total: $0.00", font=("Arial", 12))
    total_label.pack(pady=5)

    def update_total():
        grand_total = sum(item["total"] for item in current_order)
        total_label.config(text=f"Total: ${grand_total:.2f}")

    # Payment Section
    payment_frame = tk.Frame(root)
    payment_frame.pack(pady=10)
    tk.Label(payment_frame, text="Payment Method:").pack(side=tk.LEFT)
    payment_var = tk.StringVar(value="Cash")
    payment_menu = tk.OptionMenu(payment_frame, payment_var, "Cash", "Card", "UPI")
    payment_menu.pack(side=tk.LEFT, padx=5)

    # Complete Order
    def complete_order():
        if not current_order:
            messagebox.showerror("Error", "No items in order!")
            return
        grand_total = sum(item["total"] for item in current_order)
        payment_method = payment_var.get()
        order_type = order_type_var.get()
        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        order_id = cursor.lastrowid + 1 if cursor.lastrowid else 1
        for item in current_order:
            cursor.execute("INSERT INTO orders (item, price, quantity, total, date, payment_method, order_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                           (item["name"], item["subtotal"] / item["quantity"], item["quantity"], item["total"], current_date, payment_method, order_type))
        conn.commit()
        
        pdf_path = generate_pdf_bill(order_id, current_order, grand_total, payment_method, current_date, order_type)
        messagebox.showinfo("Success", f"Order completed! Total: ${grand_total:.2f} via {payment_method} ({order_type}). Bill saved as {pdf_path}")
        order_list.delete(0, tk.END)
        current_order.clear()
        update_total()

    tk.Button(root, text="Complete Order", command=complete_order).pack(pady=5)

    # Quick Order
    def quick_order():
        item_var.set("Pizza")
        qty_var.delete(0, tk.END)
        qty_var.insert(0, "1")
        add_to_order()

    tk.Button(root, text="Quick Order: 1 Pizza", command=quick_order).pack(pady=5)

    # Sales Report
    tk.Button(root, text="View Sales Report", command=generate_sales_report).pack(pady=10)

    print("Starting main loop...")
    root.mainloop()

if __name__ == "__main__":
    login_screen()