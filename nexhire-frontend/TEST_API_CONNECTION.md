# كيفية اختبار ربط Frontend مع Backend

## الخطوات المطلوبة قبل الاختبار

### 1. تشغيل Backend Server
```bash
cd backend
npm start
# يجب أن يعمل على http://localhost:3000
```

### 2. تشغيل ML API (اختياري للتوصيات)
```bash
cd ml
python api/app.py
# يجب أن يعمل على http://localhost:8000
```

### 3. تشغيل Frontend
```bash
cd nexhire-frontend
npm run dev
# يجب أن يعمل على http://localhost:5173
```

---

## طرق الاختبار

### الطريقة 1: اختبار من خلال الواجهة (UI Testing)

#### اختبار التسجيل والدخول:
1. افتح المتصفح على `http://localhost:5173`
2. اذهب إلى صفحة Sign Up
3. سجل حساب جديد (User أو Company)
4. إذا نجح التسجيل، سيتم تحويلك تلقائياً للـ Dashboard
5. جرب تسجيل الخروج ثم الدخول مرة أخرى

#### اختبار الوظائف الأساسية:
- **للمستخدمين (Job Seekers)**:
  - عرض الوظائف: اذهب إلى `/jobs`
  - التقديم على وظيفة
  - حفظ وظيفة
  - عرض التوصيات: `/recommendations`
  - عرض طلباتي: `/applications`

- **للشركات (Companies)**:
  - إنشاء وظيفة جديدة: `/company/post-job`
  - عرض وظائفي: `/company/my-jobs`
  - عرض المتقدمين

---

### الطريقة 2: اختبار من خلال Console المتصفح

افتح Developer Tools (F12) واكتب في Console:

#### اختبار تسجيل الدخول:
```javascript
import { login } from './src/api/authApi.js';

// اختبار Login
login('test@example.com', 'password123')
  .then(data => console.log('Login Success:', data))
  .catch(error => console.error('Login Error:', error));
```

#### اختبار جلب الوظائف:
```javascript
import { getAllJobs } from './src/api/jobsApi.js';

getAllJobs({ page: 1, limit: 10 })
  .then(data => console.log('Jobs:', data))
  .catch(error => console.error('Error:', error));
```

---

### الطريقة 3: اختبار من خلال Network Tab

1. افتح Developer Tools (F12)
2. اذهب إلى تبويب **Network**
3. قم بأي عملية في الموقع (مثل تسجيل الدخول)
4. راقب الطلبات (Requests):
   - **Status 200**: نجح الطلب ✅
   - **Status 401**: مشكلة في التوثيق ❌
   - **Status 404**: الـ endpoint غير موجود ❌
   - **Status 500**: خطأ في السيرفر ❌

---

### الطريقة 4: إنشاء صفحة اختبار مؤقتة

أنشئ ملف `nexhire-frontend/src/pages/TestAPI.jsx`:

```jsx
import { useState } from 'react';
import { Container, Button, Typography, Box, Alert } from '@mui/material';
import * as authApi from '../api/authApi';
import * as jobsApi from '../api/jobsApi';
import * as usersApi from '../api/usersApi';

const TestAPI = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testLogin = async () => {
    try {
      setError(null);
      const data = await authApi.login('test@example.com', 'password123');
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const testGetJobs = async () => {
    try {
      setError(null);
      const data = await jobsApi.getAllJobs({ page: 1, limit: 5 });
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Get jobs failed');
    }
  };

  const testGetSkills = async () => {
    try {
      setError(null);
      const data = await usersApi.getAllSkills();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Get skills failed');
    }
  };

  const testGetLocations = async () => {
    try {
      setError(null);
      const data = await usersApi.getAllLocations();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Get locations failed');
    }
  };

  const testGetFields = async () => {
    try {
      setError(null);
      const data = await usersApi.getAllFields();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Get fields failed');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Connection Test
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button variant="contained" onClick={testLogin}>
          Test Login
        </Button>
        <Button variant="contained" onClick={testGetJobs}>
          Test Get Jobs
        </Button>
        <Button variant="contained" onClick={testGetSkills}>
          Test Get Skills
        </Button>
        <Button variant="contained" onClick={testGetLocations}>
          Test Get Locations
        </Button>
        <Button variant="contained" onClick={testGetFields}>
          Test Get Fields
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 400,
          }}
        >
          <pre>{result}</pre>
        </Box>
      )}
    </Container>
  );
};

export default TestAPI;
```

ثم أضف Route في `src/routes/AppRoutes.jsx`:
```jsx
import TestAPI from '../pages/TestAPI';

// في الـ routes
{ path: '/test-api', element: <TestAPI /> }
```

اذهب إلى `http://localhost:5173/test-api` واختبر الـ APIs.

---

## التحقق من نجاح الربط

### علامات النجاح ✅:
1. **تسجيل الدخول يعمل**: يتم حفظ Token في localStorage
2. **الـ Token يُرسل تلقائياً**: في كل طلب يوجد `Authorization: Bearer <token>`
3. **البيانات تُعرض بشكل صحيح**: الوظائف، المهارات، المواقع تظهر
4. **الأخطاء تُعالج بشكل صحيح**: رسائل خطأ واضحة عند فشل الطلب

### علامات الفشل ❌:
1. **CORS Error**: Backend لا يسمح بطلبات من Frontend
   - **الحل**: تأكد من إعدادات CORS في Backend
2. **Network Error**: Backend غير شغال
   - **الحل**: شغل Backend Server
3. **401 Unauthorized**: Token غير صحيح أو منتهي
   - **الحل**: سجل دخول مرة أخرى
4. **404 Not Found**: الـ endpoint غير موجود
   - **الحل**: تحقق من الـ URL في API file

---

## فحص localStorage

افتح Console واكتب:
```javascript
// عرض Token
console.log(localStorage.getItem('nexhire_token'));

// عرض User
console.log(JSON.parse(localStorage.getItem('nexhire_user')));
```

---

## اختبار سريع للـ Backend

في Terminal:
```bash
# اختبار Health Check
curl http://localhost:3000/health

# اختبار Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# اختبار Get Jobs
curl http://localhost:3000/api/jobs
```

---

## الخلاصة

إذا كانت جميع الاختبارات تعمل بنجاح، يكون الربط بين Frontend و Backend شغال 100% ✅
