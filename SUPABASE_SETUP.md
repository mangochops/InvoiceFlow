# InvoiceFlow - Simplified Supabase Setup Guide

## Database Schema Overview

Your simplified schema includes:

1. **users** - Extends Supabase auth with profile info
2. **invoices** - Main invoice records (KES 2000 per invoice)
3. **invoice_steps** - Tracks all 8 steps for each invoice with form data

## Step 1: Execute SQL Schema

Copy and paste the entire contents of `database/simplified-schema.sql` into Supabase SQL Editor and execute it.

This creates:
- 3 tables with proper relationships
- Indexes for performance
- Row Level Security (RLS) policies to protect user data

## Step 2: Environment Variables

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase:
1. Go to Settings → API
2. Copy the URL and anon key

## Step 3: Set Up Authentication

Supabase provides built-in authentication. In Supabase Console:

1. Go to **Authentication** → **Providers**
2. Enable "Email" provider (already enabled by default)
3. Configure email settings if needed

The app uses `supabase.auth.signUp()` and `supabase.auth.signIn()` for authentication.

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 5: Update Your App

Replace your current auth context with the new Supabase auth provider:

### In `app/layout.tsx`:

```tsx
import { SupabaseAuthProvider } from '@/lib/supabase-auth-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
```

### In your components, use the hook:

```tsx
import { useSupabaseAuth } from '@/lib/supabase-auth-context'

export default function MyComponent() {
  const { user, loading, signIn, signOut } = useSupabaseAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn('user@example.com', 'password')}>Sign In</button>
      )}
    </>
  )
}
```

## Session Persistence Features

The Supabase client automatically:

1. **Stores session in localStorage** - User stays logged in after page refresh
2. **Auto-refreshes tokens** - Tokens are automatically renewed before expiry
3. **Detects sessions in URL** - Handles email confirmation links
4. **Listens to auth changes** - Updates app state when auth changes

## Database Operations

### Create an Invoice

```tsx
const { data, error } = await supabase
  .from('invoices')
  .insert([{
    user_id: user.id,
    email: user.email,
    phone: '0712345678',
    amount: 2000,
    status: 'pending'
  }])
```

### Update Invoice Step

```tsx
const { error } = await supabase
  .from('invoice_steps')
  .upsert({
    invoice_id: invoiceId,
    step_number: 1,
    step_name: 'Register Details',
    status: 'completed',
    data: { email, phone, balanceScreenshot }
  })
```

### Fetch User's Invoices

```tsx
const { data: invoices, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

## Row Level Security

All tables have RLS enabled. Users can only:
- View their own invoices and steps
- Insert/update their own data
- Cannot access other users' data

This is enforced by Supabase automatically using `auth.uid()`.

## Testing

1. Sign up with an email and password
2. Session automatically persists to localStorage
3. Refresh the page - user should stay logged in
4. Sign out clears the session
5. Sign in again and session returns

## Troubleshooting

**Session lost after refresh?**
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in `.env.local`
- Verify localStorage is enabled in browser

**Can't access invoices?**
- Make sure you're logged in with a user account
- Check that invoice `user_id` matches your user ID
- Check RLS policies are enabled

**Auth errors?**
- Verify email/password are correct
- Check that Email provider is enabled in Supabase Authentication
- Look for error messages in browser console
