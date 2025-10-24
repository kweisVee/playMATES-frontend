# Backend Guide: Implementing httpOnly Cookie Authentication

## 🎯 Overview

Your frontend has been updated to use **httpOnly cookies** for authentication instead of localStorage. This is a **security best practice** that protects against XSS attacks.

## 🔒 Why httpOnly Cookies Are Better

### ❌ localStorage (Old Way)
- JavaScript can access the token
- Vulnerable to XSS (Cross-Site Scripting) attacks
- Must manually attach token to requests

### ✅ httpOnly Cookies (New Way)
- JavaScript **cannot** access the cookie
- Protected from XSS attacks
- Automatically sent with requests
- Additional security flags available

---

## 🛠️ Backend Changes Required

### 1. Update CORS Configuration

**File:** Your backend server configuration (e.g., `server.js`, `app.js`)

```javascript
// Enable CORS with credentials
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // IMPORTANT: Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// For production, use your actual domain:
// origin: 'https://playmates.com'
```

**Why this matters:**
- `credentials: true` allows cookies to be sent cross-origin
- Without this, cookies won't work between frontend (port 3000) and backend (port 3001)

---

### 2. Update Sign In Endpoint

**Endpoint:** `POST /api/user/signin`

**OLD CODE** (Don't do this):
```javascript
// ❌ BAD: Returns token in response body
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials...
  const user = await findUserByEmail(email);
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, SECRET_KEY);
  
  // ❌ Sending token in body - client stores in localStorage
  res.json({
    token: token,
    user: { id: user.id, firstName: user.firstName, email: user.email }
  });
});
```

**NEW CODE** (Do this):
```javascript
// ✅ GOOD: Sets token as httpOnly cookie
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials...
  const user = await findUserByEmail(email);
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { 
    expiresIn: '7d' // Token expires in 7 days
  });
  
  // ✅ Set token as httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,      // JavaScript cannot access this cookie
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',           // Cookie available on all routes
  });
  
  // Return user data (but NOT the token)
  res.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
    }
  });
});
```

**Cookie Options Explained:**
- **`httpOnly: true`** - Prevents JavaScript from accessing the cookie (XSS protection)
- **`secure: true`** - Only send cookie over HTTPS (set to `false` for local development)
- **`sameSite: 'strict'`** - Prevents CSRF attacks
- **`maxAge`** - How long the cookie lasts (in milliseconds)
- **`path: '/'`** - Cookie is sent on all routes

---

### 3. Update Sign Up Endpoint

**Endpoint:** `POST /api/user`

```javascript
router.post('/', async (req, res) => {
  const { firstName, lastName, username, email, password, city, state, country } = req.body;
  
  // Create user...
  const hashedPassword = await hashPassword(password);
  const user = await createUser({ 
    firstName, lastName, username, email, 
    password: hashedPassword, city, state, country 
  });
  
  // Create JWT token
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { 
    expiresIn: '7d' 
  });
  
  // ✅ Set token as httpOnly cookie (same as sign in)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  
  // Return user data
  res.status(201).json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
    }
  });
});
```

---

### 4. Create Sign Out Endpoint

**Endpoint:** `POST /api/user/signout` (NEW)

```javascript
router.post('/signout', (req, res) => {
  // Clear the cookie by setting it to empty with immediate expiration
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Expire immediately
    path: '/',
  });
  
  res.json({ message: 'Signed out successfully' });
});
```

---

### 5. Create Authentication Middleware

**File:** `middleware/auth.js` (NEW)

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Read token from cookie (NOT from Authorization header anymore)
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Attach user info to request
    req.userId = decoded.userId;
    
    next(); // Continue to the route handler
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
```

---

### 6. Update Protected Routes

**OLD CODE** (Don't do this):
```javascript
// ❌ Reading from Authorization header
router.get('/profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // Verify token...
});
```

**NEW CODE** (Do this):
```javascript
const authenticateToken = require('./middleware/auth');

// ✅ Use authentication middleware
router.get('/profile', authenticateToken, async (req, res) => {
  // req.userId is already set by middleware
  const user = await findUserById(req.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    state: user.state,
    country: user.country,
  });
});

// Apply to all protected routes
router.put('/profile', authenticateToken, async (req, res) => { /* ... */ });
router.get('/meetups', authenticateToken, async (req, res) => { /* ... */ });
router.post('/meetup', authenticateToken, async (req, res) => { /* ... */ });
```

---

### 7. Install cookie-parser

You need to install a package to parse cookies:

```bash
npm install cookie-parser
```

**Then in your main server file:**

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// IMPORTANT: Add these BEFORE your routes
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // MUST be true for cookies
}));

// Your routes...
app.use('/api/user', userRoutes);
app.use('/api/meetup', meetupRoutes);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

---

## 📋 Complete Example: Express Backend

```javascript
// server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoutes = require('./routes/user');
const meetupRoutes = require('./routes/meetup');

const app = express();

// Middleware (ORDER MATTERS!)
app.use(cookieParser()); // 1. Parse cookies first
app.use(express.json()); // 2. Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
}));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/meetup', meetupRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 🧪 Testing the Changes

### 1. Test Sign In
```bash
curl -X POST http://localhost:3001/api/user/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Check cookies.txt - you should see the 'token' cookie
```

### 2. Test Protected Route
```bash
curl http://localhost:3001/api/user/profile \
  -b cookies.txt

# Should return user profile
```

### 3. Test Sign Out
```bash
curl -X POST http://localhost:3001/api/user/signout \
  -b cookies.txt \
  -c cookies.txt

# Cookie should be cleared
```

---

## 🔍 Troubleshooting

### Problem: Cookies not being sent/received

**Check:**
1. ✅ `credentials: true` in CORS config
2. ✅ `credentials: 'include'` in frontend fetch calls (already done)
3. ✅ Same domain for frontend and backend (localhost for both)

### Problem: CORS errors

**Solution:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Exact origin
  credentials: true,
  allowedHeaders: ['Content-Type'],
}));
```

### Problem: Cookie not visible in browser

**Remember:**
- httpOnly cookies are **intentionally invisible** to JavaScript
- You can see them in browser DevTools → Application → Cookies
- But `document.cookie` won't show them (that's the security feature!)

---

## 🚀 Deployment Considerations

### For Production:

1. **Use HTTPS**: Set `secure: true` in cookie options
2. **Update origin**: Change from `localhost` to your actual domain
3. **Environment variables**: Use `.env` for secrets

```javascript
// Production config
res.cookie('token', token, {
  httpOnly: true,
  secure: true, // ✅ HTTPS only in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
  domain: '.yourdomain.com', // Allow subdomain access
});
```

---

## ✅ Summary of Backend Changes

1. ✅ Install `cookie-parser`
2. ✅ Enable CORS with `credentials: true`
3. ✅ Update `/signin` to set httpOnly cookie
4. ✅ Update `/signup` to set httpOnly cookie
5. ✅ Create `/signout` endpoint to clear cookie
6. ✅ Create authentication middleware to read from cookies
7. ✅ Update all protected routes to use middleware
8. ✅ Remove Authorization header logic

---

## 🎓 Key Takeaways

**Security Benefits:**
- ✅ XSS attacks can't steal the token
- ✅ CSRF protection with `sameSite`
- ✅ Automatic expiration with `maxAge`
- ✅ HTTPS-only with `secure` flag

**Developer Experience:**
- ✅ No manual token management in frontend
- ✅ Cookies sent automatically with requests
- ✅ Server-side control of authentication

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for CORS errors
2. Check browser DevTools → Network → Headers → Cookies
3. Check backend console logs
4. Verify `cookieParser()` is before your routes

Good luck with the implementation! 🚀

