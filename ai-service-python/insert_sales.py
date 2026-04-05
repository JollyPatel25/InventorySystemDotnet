import psycopg2
import uuid
import random
from datetime import datetime, timedelta, UTC

# ----------------------------
# DB CONFIG
# ----------------------------
conn = psycopg2.connect(
    dbname="InventoryDb",
    user="postgres",
    password="Jolly",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

now = datetime.now(UTC)

# ✅ UNIQUE TAG
unique_tag = str(uuid.uuid4())[:8]

# ----------------------------
# GET ORG + WAREHOUSE + USER
# ----------------------------
cur.execute('SELECT "Id" FROM "Organizations" LIMIT 1')
org_id = cur.fetchone()[0]

cur.execute('SELECT "Id","Name" FROM "Warehouses" WHERE "OrganizationId"=%s LIMIT 1', (org_id,))
warehouse_id, warehouse_name = cur.fetchone()

cur.execute("""
SELECT u."Id"
FROM "Users" u
JOIN "UserOrganizations" uo ON u."Id" = uo."UserId"
WHERE uo."OrganizationId" = %s
LIMIT 1
""", (org_id,))
user_id = cur.fetchone()[0]

print("Using Org:", org_id)
print("Using Warehouse:", warehouse_name, warehouse_id)
print("Using User:", user_id)

# ----------------------------
# CREATE PRODUCTS
# ----------------------------
products_info = []

for i in range(10):
    pid = str(uuid.uuid4())
    pname = f"Product {i}-{unique_tag}"

    products_info.append({
        "id": pid,
        "name": pname,
        "sales": []
    })

    cur.execute("""
    INSERT INTO "Products"
    ("Id","OrganizationId","Name","SKU","Category","Price","IsActive",
     "Barcode","Description","UnitOfMeasure",
     "ReorderPoint","LeadTimeDays",
     "CreatedAt","IsDeleted")
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        pid,
        org_id,
        pname,
        f"SKU-{i}-{unique_tag}",
        "Electronics",
        random.randint(100, 500),
        True,
        f"BAR-{i}-{unique_tag}",
        "Test product",
        "Piece",
        20,
        5,
        now,
        False
    ))

# ----------------------------
# INVENTORY
# ----------------------------
for p in products_info:
    cur.execute("""
    INSERT INTO "Inventories"
    ("Id","ProductId","WarehouseId","Quantity","LowStockThreshold",
     "CreatedAt","IsDeleted")
    VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (
        str(uuid.uuid4()),
        p["id"],
        warehouse_id,
        100,
        20,
        now,
        False
    ))

# ----------------------------
# SALES DATA (30 DAYS)
# ----------------------------
days = 30

for i, p in enumerate(products_info):
    base_demand = random.randint(8, 15)

    for d in range(days):
        date = now - timedelta(days=days - d)

        trend = d * random.uniform(0.05, 0.15)
        seasonal = 3 if date.weekday() >= 5 else 0
        noise = random.uniform(-2, 2)

        qty = int(base_demand + trend + seasonal + noise)
        qty = max(0, qty)

        if random.random() < 0.1:
            qty = 0

        if random.random() < 0.05:
            qty += random.randint(10, 25)

        sale_id = str(uuid.uuid4())

        subtotal = qty * random.randint(100, 300)
        tax = round(subtotal * 0.1, 2)
        discount = round(subtotal * 0.05, 2)
        total = subtotal + tax - discount

        cur.execute("""
        INSERT INTO "Sales"
        ("Id","OrganizationId","InvoiceNumber",
         "SubTotal","TaxAmount","DiscountAmount","TotalAmount",
         "PaymentMethod","WarehouseId","CreatedByUserId",
         "CreatedAt","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            sale_id,
            org_id,
            f"INV-{i}-{d}-{unique_tag}",
            subtotal,
            tax,
            discount,
            total,
            random.randint(1, 4),
            warehouse_id,
            user_id,
            date,
            False
        ))

        cur.execute("""
        INSERT INTO "SaleItems"
        ("Id","SaleId","ProductId","Quantity","UnitPrice","TotalPrice",
         "CreatedAt","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            sale_id,
            p["id"],
            qty,
            subtotal // max(qty, 1),
            subtotal,
            date,
            False
        ))

        p["sales"].append(sale_id)

# ----------------------------
# SAVE
# ----------------------------
conn.commit()
cur.close()
conn.close()

# ----------------------------
# SUMMARY
# ----------------------------
print("\n===== DATA SUMMARY =====")

print(f"\nWarehouse: {warehouse_name}")
print(f"Id: {warehouse_id}")

for p in products_info:
    print(f"\n{p['name']}")
    print(f"ProductId: {p['id']}")
    print("Sample Sales:")
    for sid in p["sales"][:3]:
        print(f" - {sid}")

print("\n✅ Done!")