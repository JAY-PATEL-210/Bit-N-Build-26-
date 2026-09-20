import sqlite3
import json
import datetime

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        val = row[idx]
        if isinstance(val, bytes):
            val = val.decode('utf-8', errors='ignore')
        d[col[0]] = val
    return d

conn = sqlite3.connect('concierge.db')
conn.row_factory = dict_factory
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r['name'] for r in cursor.fetchall()]

data = {}
for table in tables:
    try:
        cursor.execute(f"SELECT * FROM {table}")
        data[table] = cursor.fetchall()
    except Exception as e:
        data[table] = str(e)

print(json.dumps(data, indent=2, default=str))
