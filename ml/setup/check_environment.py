#!/usr/bin/env python3
"""
التحقق من البيئة والمتطلبات قبل تشغيل ML Pipeline
Usage: python setup/check_environment.py
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


def check_python_version() -> bool:
  """التحقق من إصدار Python"""
  print("🐍 Python Version:")
  version = sys.version_info
  print(f"   {version.major}.{version.minor}.{version.micro}")

  if version.major < 3 or (version.major == 3 and version.minor < 8):
    print("   ⚠️  Python 3.8+ recommended")
    return False
  else:
    print("   ✅ OK")
    return True


def check_required_packages() -> bool:
  """التحقق من المكتبات المطلوبة"""
  print("\n📦 Required Packages:")

  required = [
    "numpy",
    "scipy",
    "pandas",
    "psycopg2",
    "sqlalchemy",
    "dotenv",
    "fastapi",
    "uvicorn",
  ]

  missing = []
  for package in required:
    try:
      __import__(package)
      print(f"   ✅ {package}")
    except ImportError:
      print(f"   ❌ {package} - NOT INSTALLED")
      missing.append(package)

  if missing:
    print(f"\n⚠️  Missing packages: {', '.join(missing)}")
    print("   Run: pip install -r requirements.txt")
    return False

  return True


def check_env_file() -> bool:
  """التحقق من ملف .env"""
  print("\n⚙️  Environment Variables:")

  env_file = Path(__file__).parent.parent / ".env"

  if not env_file.exists():
    print("   ❌ .env file not found!")
    print("   Create ml/.env with DATABASE_URL")
    return False

  print("   ✅ .env exists")

  from dotenv import load_dotenv

  load_dotenv()

  database_url = os.getenv("DATABASE_URL")
  if not database_url:
    print("   ❌ DATABASE_URL not set in .env")
    return False

  print("   ✅ DATABASE_URL configured")

  return True


def check_database_connection() -> bool:
  """التحقق من اتصال قاعدة البيانات"""
  print("\n🗄️  Database Connection:")

  try:
    from config.database import get_connection

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"   ✅ Connected: {version.split(',')[0]}")

    cursor.execute(
      """
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'jobs', 'interactions');
      """
    )
    count = cursor.fetchone()[0]

    if count == 3:
      print("   ✅ Core tables exist")
    else:
      print(f"   ⚠️  Some core tables missing ({count}/3)")

    cursor.close()
    conn.close()
    return True

  except Exception as e:
    print(f"   ❌ Connection failed: {e}")
    return False


def check_data() -> bool:
  """التحقق من وجود بيانات"""
  print("\n📊 Data Check:")

  try:
    from config.database import get_connection

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users;")
    users_count = cursor.fetchone()[0]
    print(f"   Users: {users_count}")

    cursor.execute("SELECT COUNT(*) FROM jobs;")
    jobs_count = cursor.fetchone()[0]
    print(f"   Jobs: {jobs_count}")

    cursor.execute("SELECT COUNT(*) FROM interactions;")
    interactions_count = cursor.fetchone()[0]
    print(f"   Interactions: {interactions_count}")

    cursor.close()
    conn.close()

    if users_count == 0 or jobs_count == 0:
      print("   ⚠️  No data found! Run seed first.")
      return False

    print("   ✅ Data exists")
    return True

  except Exception as e:
    print(f"   ❌ Error: {e}")
    return False


def main() -> None:
  """Main function"""

  print("=" * 60)
  print("ML Pipeline Environment Check")
  print("=" * 60)

  checks = [
    check_python_version(),
    check_required_packages(),
    check_env_file(),
    check_database_connection(),
    check_data(),
  ]

  print("\n" + "=" * 60)

  if all(checks):
    print("✅ All checks passed! Ready to run ML Pipeline.")
    print("\nNext steps:")
    print("  1. python setup/setup_db.py  (create ML tables)")
    print("  2. python scripts/run_pipeline.py  (train models)")
  else:
    print("❌ Some checks failed. Please fix the issues above.")

  print("=" * 60)


if __name__ == "__main__":
  main()

