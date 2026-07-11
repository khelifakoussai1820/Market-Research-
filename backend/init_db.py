from app.core.database import engine, Base
from app.models.user import User
from app.models.brand import Brand
from app.models.competitor import Competitor
from app.models.response import MarketReport

Base.metadata.create_all(bind=engine)

# Add the `name` column to an existing `users` table if it is missing
# (SQLite does not support ALTER COLUMN, but ADD COLUMN is safe & idempotent).
with engine.connect() as conn:
    try:
        inspector = __import__("sqlalchemy").inspect(engine)
        columns = [c["name"] for c in inspector.get_columns("users")]
        if "name" not in columns:
            conn.execute(__import__("sqlalchemy").text("ALTER TABLE users ADD COLUMN name VARCHAR"))
            conn.commit()
            print("Added 'name' column to users table.")
    except Exception as e:  # pragma: no cover - best effort migration
        print(f"Migration note (users.name): {e}")

print("Database initialized successfully.")
