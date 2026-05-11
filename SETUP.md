# InvoiceFlow Setup Guide

## Database Setup (Supabase)

### 1. Execute the SQL Schema

Copy and paste the entire contents of `/database/schema.sql` into your Supabase SQL Editor:

1. Go to your Supabase project → SQL Editor
2. Click "New Query"
3. Copy all SQL from `database/schema.sql`
4. Execute the query

This creates:
- `users` - User profiles
- `invoices` - Invoice records
- `payment_transactions` - Payment tracking
- `invoice_steps` - Step completion tracking
- `mpesa_callbacks` - M-Pesa callback logs
- Indexes for performance
- Row Level Security (RLS) policies

### 2. Set Up Supabase Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Copy your API credentials to environment variables (see below)

---

## Environment Variables

Add these to your `.env.local` file:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### M-Pesa (Daraja API - Sandbox for testing, Production for live)
```
# Get these from https://developer.safaricom.co.ke/

# For Sandbox (Testing)
MPESA_BUSINESS_SHORTCODE=174379
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_PASSKEY=your_sandbox_passkey

# Callback URL (where M-Pesa sends transaction results)
# Update this with your actual domain
MPESA_CALLBACK_URL=https://yourapp.com/api/mpesa/callback

# For Production (remove sandbox from endpoints in lib/mpesa.ts)
# MPESA_BUSINESS_SHORTCODE=your_production_shortcode
# MPESA_CONSUMER_KEY=your_production_key
# MPESA_CONSUMER_SECRET=your_production_secret
# MPESA_PASSKEY=your_production_passkey
```

---

## How the Payment Flow Works

### Step-by-Step Process

1. **User Registration (Step 1)**
   - User enters email and phone
   - Invoice is created in database with status "pending"

2. **M-Pesa Payment (Step 2)**
   - User clicks "Send Payment Prompt"
   - Frontend calls `/api/mpesa/stkpush`
   - Backend initiates STK push via Daraja API
   - M-Pesa prompt appears on user's phone
   - User enters PIN to authorize payment
   - Payment transaction record is created with status "pending"

3. **Payment Completion**
   - M-Pesa sends callback to `/api/mpesa/callback`
   - Backend verifies transaction and updates:
     - `payment_transactions` status → "completed"
     - `invoices` status → "paid"
     - Transaction ID and receipt number stored

4. **User Continues (Step 3-8)**
   - Frontend polls `/api/mpesa/query` to check payment status
   - When success detected, user proceeds to next steps
   - Each step data is stored in database for audit trail

---

## Key Files

### Database & Configuration
- `/database/schema.sql` - Complete database schema with RLS
- `/lib/supabase.ts` - Supabase client configuration
- `/lib/mpesa.ts` - M-Pesa Daraja API integration

### API Routes
- `/app/api/mpesa/stkpush/route.ts` - Initiates payment prompt
- `/app/api/mpesa/callback/route.ts` - Handles M-Pesa callbacks
- `/app/api/mpesa/query/route.ts` - Checks payment status

### Components
- `/components/mpesa-payment-modal.tsx` - Payment UI with real transaction flow
- `/app/start-invoicing/page.tsx` - Multi-step invoice form

### Context
- `/lib/invoice-context.tsx` - Invoice state management
- `/lib/auth-context.tsx` - User authentication

---

## Testing in Sandbox

### Test Credentials
The Daraja API provides test phone numbers and credentials:
- Test Phone: `254708374149` (for Kenya)
- Test PIN: `1234`
- Amount: Any amount (will always succeed in sandbox)

### Testing Steps

1. Start the app: `pnpm dev`
2. Sign up with any email
3. Go to "Start Invoicing"
4. Fill in Step 1 details with test phone `254708374149`
5. Click "Send Payment Prompt"
6. You'll see a spinner - in production, user enters PIN on real M-Pesa
7. In sandbox, you can manually simulate callback by:
   - Making a POST request to `/api/mpesa/callback` with test data
   - Or wait for M-Pesa's test callback (usually instant in sandbox)

---

## Troubleshooting

### "Failed to get access token"
- Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET
- Ensure you're using sandbox credentials for testing
- Verify credentials are copied exactly (no spaces)

### "Payment request timed out"
- In sandbox, callbacks are usually instant
- Check `/api/mpesa/callback` logs for errors
- Verify MPESA_CALLBACK_URL is correct and accessible

### "Transaction not found in database"
- Ensure Supabase tables are created from schema.sql
- Check that RLS policies allow inserts
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly

### Database RLS Issues
- If users can't see their invoices, check RLS policies
- Current policies only show users their own data
- Modify `/database/schema.sql` if different access is needed

---

## Production Deployment

1. **Switch M-Pesa to Production**
   - Change API base URL in `/lib/mpesa.ts` from sandbox to production
   - Update environment variables with production credentials
   - Test with real M-Pesa payments

2. **Deploy to Vercel**
   - Add environment variables in Vercel project settings
   - Ensure callback URL matches your production domain
   - Enable HTTPS (required by M-Pesa)

3. **Update Callback URL**
   - Set `MPESA_CALLBACK_URL` to `https://yourdomain.com/api/mpesa/callback`
   - M-Pesa must be able to reach this URL from internet

---

## Support

For M-Pesa Daraja API issues:
- Documentation: https://developer.safaricom.co.ke/
- Community: Safaricom Developer Forum

For Supabase issues:
- Documentation: https://supabase.com/docs
- Support: https://supabase.com/support
