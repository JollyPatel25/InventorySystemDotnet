import psycopg2
import uuid
import random
from datetime import datetime, timedelta, UTC

import bcrypt

def hash_password(password="12345678"):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

hash_value = hash_password()

# DB CONFIG
conn = psycopg2.connect(
    dbname="InventoryDb",
    user="postgres",
    password="Jolly",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

now = datetime.now(UTC)

def rand_phone():
    return "9" + str(random.randint(100000000, 999999999))

def rand_price():
    return round(random.uniform(100, 10000), 2)

# STORAGE
org_ids = []
org_users = {}
org_warehouses = {}
org_products = {}
org_inventories = {}
org_sales = {}

# ----------------------------
# ORGANIZATIONS
# ----------------------------
for i in range(100):
    oid = str(uuid.uuid4())
    org_ids.append(oid)

    org_users[oid] = []
    org_warehouses[oid] = []
    org_products[oid] = []
    org_inventories[oid] = []
    org_sales[oid] = []

    cur.execute("""
    INSERT INTO "Organizations"
    ("Id","Name","RegistrationNumber","TaxIdentificationNumber",
     "Address_Line1","Address_Line2","Address_City","Address_State","Address_Country","Address_PostalCode",
     "ContactEmail","ContactPhone","IsActive","SubscriptionEndDate","PlanType",
     "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        oid,
        f"Org-{i}",
        f"REG-{i}",
        f"GSTIN{i}",
        f"Street {i}",
        "",
        "Ahmedabad",
        "Gujarat",
        "India",
        "380001",
        f"org{i}@mail.com",
        rand_phone(),
        True,
        now + timedelta(days=random.randint(-30, 180)),
        random.randint(1,4),
        now, None, None, None, False
    ))

# ----------------------------
# USERS
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        uid = str(uuid.uuid4())
        org_users[org_id].append(uid)

        cur.execute("""
        INSERT INTO "Users"
        ("Id","Email","PasswordHash","FirstName","LastName","ContactNumber",
         "Address_Line1","Address_Line2","Address_City","Address_State","Address_Country","Address_PostalCode",
         "IsPlatformAdmin","IsActive","LastLoginAt",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            uid,
            f"user{i}_{org_id[:4]}@test.com",
            hash_value,
            f"First{i}",
            f"Last{i}",
            rand_phone(),
            "Street", "", "Ahmedabad", "Gujarat", "India", "380001",
            False, True, None,
            now, None, None, None, False
        ))

        # USER ORG
        cur.execute("""
        INSERT INTO "UserOrganizations"
        ("Id","UserId","OrganizationId","Role","IsDefault","IsActive","AssignedAt",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            uid,
            org_id,
            random.randint(1,3),
            True,
            True,
            now,
            now, None, None, None, False
        ))

# ----------------------------
# WAREHOUSES
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        wid = str(uuid.uuid4())
        org_warehouses[org_id].append(wid)

        cur.execute("""
        INSERT INTO "Warehouses"
        ("Id","OrganizationId","Name","Code","Location",
         "Address_Line1","Address_Line2","Address_City","Address_State","Address_Country","Address_PostalCode",
         "IsActive","CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            wid,
            org_id,
            f"Warehouse-{i}",
            f"WH-{i}",
            f"City-{i}",
            "Street", "", "Ahmedabad", "Gujarat", "India", "380001",
            True,
            now, None, None, None, False
        ))

# ----------------------------
# PRODUCTS
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        pid = str(uuid.uuid4())
        org_products[org_id].append(pid)

        cur.execute("""
        INSERT INTO "Products"
        ("Id","OrganizationId","Name","SKU","Category","Price","IsActive",
         "Barcode","Description","UnitOfMeasure",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            pid,
            org_id,
            f"Product-{i}",
            f"SKU-{i}",
            random.choice(["Electronics","Accessories","Food"]),
            rand_price(),
            True,
            f"BAR-{i}",
            "Description",
            "Piece",
            now, None, None, None, False
        ))

# ----------------------------
# INVENTORY
# ----------------------------
for org_id in org_ids:
    inventory_pairs = set()   # ✅ reset per org

    products = org_products[org_id]
    warehouses = org_warehouses[org_id]

    for p in products:
        for w in warehouses:

            pair = (p, w)
            if pair in inventory_pairs:
                continue

            inventory_pairs.add(pair)

            iid = str(uuid.uuid4())
            org_inventories[org_id].append(iid)  # ✅ VERY IMPORTANT

            cur.execute("""
            INSERT INTO "Inventories"
            ("Id","ProductId","WarehouseId","Quantity","LowStockThreshold",
             "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                iid,
                p,
                w,
                random.randint(50,500),
                random.randint(10,50),
                now, None, None, None, False
            ))

# ----------------------------
# SALES
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        sid = str(uuid.uuid4())
        org_sales[org_id].append(sid)

        subtotal = rand_price()
        tax = subtotal * 0.1
        discount = subtotal * 0.05

        cur.execute("""
        INSERT INTO "Sales"
        ("Id","OrganizationId","InvoiceNumber","SubTotal","TaxAmount","DiscountAmount",
         "TotalAmount","PaymentMethod","WarehouseId","CreatedByUserId",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            sid,
            org_id,
            f"INV-{i}",
            subtotal,
            tax,
            discount,
            subtotal + tax - discount,
            random.randint(1,4),
            random.choice(org_warehouses[org_id]),
            random.choice(org_users[org_id]),
            now, None, None, None, False
        ))

# ----------------------------
# SALE ITEMS
# ----------------------------
sale_product_pairs = set()

for org_id in org_ids:
    for sale_id in org_sales[org_id]:
        
        # choose 1–5 unique products per sale
        products = random.sample(org_products[org_id], k=random.randint(1,5))
        
        for p in products:
            pair = (sale_id, p)

            if pair in sale_product_pairs:
                continue

            sale_product_pairs.add(pair)

            qty = random.randint(1,5)
            price = rand_price()

            cur.execute("""
            INSERT INTO "SaleItems"
            ("Id","SaleId","ProductId","Quantity","UnitPrice","TotalPrice",
             "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                str(uuid.uuid4()),
                sale_id,
                p,
                qty,
                price,
                qty * price,
                now, None, None, None, False
            ))

# ----------------------------
# STOCK ADJUSTMENTS
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        cur.execute("""
        INSERT INTO "StockAdjustments"
        ("Id","InventoryId","AdjustmentType","QuantityChanged","NewQuantity","Reason","CreatedByUserId",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            random.choice(org_inventories[org_id]),
            random.randint(1,9),
            random.randint(-20,50),
            random.randint(10,500),
            "Adjustment",
            random.choice(org_users[org_id]),
            now, None, None, None, False
        ))

# ----------------------------
# PREDICTIONS
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        cur.execute("""
        INSERT INTO "Predictions"
        ("Id","ProductId","WarehouseId","PredictedQuantity","ConfidenceScore","PredictionForDate",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            random.choice(org_products[org_id]),
            random.choice(org_warehouses[org_id]),
            random.randint(50,500),
            random.random(),
            now + timedelta(days=random.randint(1,30)),
            now, None, None, None, False
        ))

# ----------------------------
# TAX CONFIG
# ----------------------------
for org_id in org_ids:
    for i in range(20):
        cur.execute("""
        INSERT INTO "TaxConfigurations"
        ("Id","OrganizationId","TaxName","TaxPercentage","IsActive",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            org_id,
            random.choice(["GST","VAT"]),
            round(random.uniform(5,18),2),
            True,
            now, None, None, None, False
        ))

conn.commit()
cur.close()
conn.close()

print("✅ PERFECT DATA INSERTED (ALL REQUIRED FIELDS COVERED)")