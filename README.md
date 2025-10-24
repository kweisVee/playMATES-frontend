This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## tailwind
`npm install -D tailwindcss@latest @tailwindcss/postcss postcss`

## Shadcn ui
`npm list @shadcn/ui`

## Install all shadcn components
- this is to install all components in `@/components/ui` 
`npx shadcn@latest add card`
`npx shadcn@latest add button`
`npm install next-themes`
`npx shadcn@latest add dialog`
`npx shadcn@latest add input`
`npx shadcn@latest add label`
`npx shadcn@latest add checkbox`


## Install tailwindcss-animate
`npm install tailwindcss-animate`


## Creating an api call 
1. URL can be found in `src/lib/config/api.ts` where you add your API endpoint
2. Create the interface and call in `src/lib/services/user.ts`
3. Call the service in `src/hooks/useUser.ts`
4. Add the hooks to `src/components/auth-modal.tsx`

## Cookie Parser
`npm install cookie-parser @types/cookie-parser`
### Using Cookies: 
Take note that `credentials: include` both sends and receives cookies
```
User clicks "Sign In" button with email & password
fetch('http://localhost:3001/api/user/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  //This is KEY! Tells browser to send/receive cookies
  body: JSON.stringify({ email, password })
})
```

## Errors found
- I had to pass a version header, to determine which version of the api I want to call and I get an error which says `Access to fetch at 'http://localhost:3001/api/user/signin' from origin 'http://localhost:3000' has been blocked by CORS policy: Request header field api-version is not allowed by Access-Control-Allow-Headers in preflight response.` and this is because we have to update the backend server to allow the api-version header. 