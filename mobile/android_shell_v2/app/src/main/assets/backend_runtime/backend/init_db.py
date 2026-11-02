from contextlib import closing
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "restaurant.db"
SCHEMA_PATH = ROOT / "db" / "schema.sql"


def init_db(db_path: Path = DB_PATH, schema_path: Path = SCHEMA_PATH) -> Path:
    # Keep existing database data; initialize only when missing.
    if db_path.exists():
        return db_path

    db_path.parent.mkdir(parents=True, exist_ok=True)
    schema = schema_path.read_text(encoding="utf-8")
    with closing(sqlite3.connect(db_path)) as conn:
        conn.executescript(schema)
        conn.execute("INSERT INTO restaurants(name) VALUES (?)", ("Voice BBQ",))
        conn.commit()
    return db_path


if __name__ == "__main__":
    path = init_db()
    print(f"Database initialized at: {path}")
