# ML Pipeline Setup Guide

## الخطوات بالترتيب

### 1. التحقق من البيئة

```bash
cd ml
python setup/check_environment.py
```

### 2. تثبيت المكتبات (إذا لزم)

```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### 3. إنشاء جداول ML

```bash
python setup/setup_db.py
```

### 4. تشغيل التدريب

```bash
python scripts/run_pipeline.py
```

### 5. تشغيل ML API

```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### 6. اختبار

افتح المتصفح:

```text
http://localhost:8000/recommendations/jobs/1?limit=5
```

## الأوامر السريعة

```bash
# التحقق من كل شيء
python setup/check_environment.py

# إعداد DB
python setup/setup_db.py

# تدريب
python scripts/run_pipeline.py

# تشغيل API
uvicorn api.app:app --reload
```

## الأخطاء الشائعة

| الخطأ                       | الحل                              |
|----------------------------|-----------------------------------|
| `ModuleNotFoundError`      | `pip install -r requirements.txt` |
| `Database connection failed` | تأكد من ملف `.env` وتشغيل PostgreSQL |
| `Table does not exist`     | `python setup/setup_db.py`        |

