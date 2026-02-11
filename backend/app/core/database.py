import os
import sqlite3
from contextlib import contextmanager


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.environ.get("LIVESURGERY_DB_PATH", os.path.join(DATA_DIR, "livesurgery.db"))


def _ensure_data_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)


def init_db() -> None:
    _ensure_data_dir()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            create table if not exists users (
              id text primary key,
              email text unique,
              display_name text,
              role text not null check (role in ('SURGEON','OBSERVER','ADMIN')),
              created_at text not null
            )
            """
        )
        conn.execute(
            """
            create table if not exists sessions (
              id text primary key,
              title text not null,
              visibility text not null check (visibility in ('PRIVATE','PUBLIC')),
              status text not null check (status in ('DRAFT','LIVE','ENDED','ARCHIVED')),
              created_by text not null references users(id),
              created_at text not null,
              updated_at text not null
            )
            """
        )
        conn.execute(
            """
            create table if not exists session_participants (
              session_id text not null references sessions(id),
              user_id text not null references users(id),
              role text not null check (role in ('SURGEON','OBSERVER','ADMIN')),
              joined_at text,
              left_at text,
              primary key (session_id, user_id)
            )
            """
        )
        conn.commit()


@contextmanager
def get_conn():
    _ensure_data_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
