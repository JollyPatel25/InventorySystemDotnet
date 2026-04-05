import psycopg2
import uuid
import random
from datetime import datetime, UTC
import bcrypt

# ----------------------------
# CONFIG
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

def hash_password(password="12345678"):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def rand_phone():
    return "9" + str(random.randint(100000000, 999999999))

hash_value = hash_password()

# ----------------------------
# FETCH EXISTING ORGS
# ----------------------------
cur.execute('SELECT "Id" FROM "Organizations"')
org_ids = [row[0] for row in cur.fetchall()]

# ----------------------------
# CREATE USERS
# ----------------------------
NUM_USERS = 200   # you can increase

for i in range(NUM_USERS):
    uid = str(uuid.uuid4())

    email = f"multiuser{i}@test.com"

    # Insert user
    cur.execute("""
    INSERT INTO "Users"
    ("Id","Email","PasswordHash","FirstName","LastName","ContactNumber",
     "Address_Line1","Address_Line2","Address_City","Address_State","Address_Country","Address_PostalCode",
     "IsPlatformAdmin","IsActive","LastLoginAt",
     "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        uid,
        email,
        hash_value,
        f"Multi{i}",
        "User",
        rand_phone(),
        "Street", "", "Ahmedabad", "Gujarat", "India", "380001",
        False, True, None,
        now, None, None, None, False
    ))

    # ----------------------------
    # ASSIGN 2–3 ORGS
    # ----------------------------
    org_count = random.randint(2, 3)
    selected_orgs = random.sample(org_ids, k=org_count)

    default_org = random.choice(selected_orgs)

    for org_id in selected_orgs:
        role = random.randint(1, 3)  # different role per org

        cur.execute("""
        INSERT INTO "UserOrganizations"
        ("Id","UserId","OrganizationId","Role","IsDefault","IsActive","AssignedAt",
         "CreatedAt","UpdatedAt","CreatedBy","UpdatedBy","IsDeleted")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            str(uuid.uuid4()),
            uid,
            org_id,
            role,
            True if org_id == default_org else False,  # only one default
            True,
            now,
            now, None, None, None, False
        ))

# ----------------------------
# COMMIT
# ----------------------------
conn.commit()
cur.close()
conn.close()

print("✅ Multi-org users inserted successfully (2–3 orgs per user)")