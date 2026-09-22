#!/usr/bin/env python3
"""
Setup script لإنشاء جداول ML في قاعدة البيانات
Usage: python setup/setup_db.py
"""

import sys
from pathlib import Path

from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import get_connection  # noqa: E402


load_dotenv()


def create_ml_tables() -> bool:
  """إنشاء جداول ML في قاعدة البيانات."""

  print("=" * 60)
  print("Creating ML Tables in PostgreSQL")
  print("=" * 60)

  sql_file = Path(__file__).parent / "create_ml_tables.sql"

  if not sql_file.exists():
    print(f"❌ Error: {sql_file} not found!")
    return False

  sql = sql_file.read_text(encoding="utf-8")

  conn = None
  try:
    conn = get_connection()
    cursor = conn.cursor()

    print("\nExecuting SQL...")
    cursor.execute(sql)
    conn.commit()

    print("\n✅ ML tables created successfully!")

    cursor.execute(
      """
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%vector%' OR table_name LIKE '%factor%')
      ORDER BY table_name;
      """
    )
    tables = cursor.fetchall()

    if tables:
      print("\n📊 Created tables:")
      for (name,) in tables:
        print(f"   ✓ {name}")

    cursor.close()
    return True

  except Exception as e:
    print(f"\n❌ Error: {e}")
    if conn:
      conn.rollback()
    return False

  finally:
    if conn:
      conn.close()


def verify_tables() -> bool:
  """التحقق من وجود الجداول المطلوبة."""

  print("\n" + "=" * 60)
  print("Verifying ML Tables")
  print("=" * 60)

  required_tables = [
    "user_vectors",
    "job_vectors",
    "user_factors_uj",
    "job_factors_uj",
    "user_factors_ju",
    "job_factors_ju",
  ]

  conn = None
  try:
    conn = get_connection()
    cursor = conn.cursor()

    all_exist = True
    for table in required_tables:
      cursor.execute(
        f"""
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = %s
        );
        """,
        (table,),
      )
      exists = cursor.fetchone()[0]
      if exists:
        print(f"   ✅ {table}")
      else:
        print(f"   ❌ {table} - NOT FOUND")
        all_exist = False

    cursor.close()

    if all_exist:
      print("\n✅ All ML tables exist!")
    else:
      print("\n⚠️  Some tables are missing!")

    return all_exist

  except Exception as e:
    print(f"\n❌ Error: {e}")
    return False

  finally:
    if conn:
      conn.close()


def main() -> None:
  """Main function."""

  # التحقق من اتصال قاعدة البيانات
  try:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"\n✅ Connected to: {version}\n")
    cursor.close()
    conn.close()
  except Exception as e:
    print(f"\n❌ Database connection failed: {e}")
    print("\nPlease check your .env file and ensure PostgreSQL is running.")
    return

  # إنشاء الجداول
  success = create_ml_tables()
  if not success:
    print("\n❌ Failed to create tables!")
    return

  # التحقق من الجداول
  verify_tables()

  print("\n" + "=" * 60)
  print("Setup completed!")
  print("=" * 60)
  print("\nNext steps:")
  print("  1. Run: python scripts/run_pipeline.py")
  print("  2. Run: uvicorn api.app:app --reload")
  print()


if __name__ == "__main__":
  main()

