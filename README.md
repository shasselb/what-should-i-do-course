# What Should I Do?

A production-ready, multi-page course application for making God-honoring decisions. It includes self-paced BE, KNOW, and DO lessons with a saved learning journal; Pre-Work notes; a 120-card values exercise; a one-month Time Audit; shared admin-managed content; traditional email/password accounts; cloud synchronization; and secure self-emailing.

## Production architecture

- Static HTML, CSS, and JavaScript frontend
- Supabase Auth for email/password accounts
- Supabase Postgres with Row Level Security for user and admin data
- Vercel Functions for runtime configuration and authenticated email delivery
- Resend for transactional email
- Automatic one-year retention from each user's latest save
- Automatic cross-device saving after every card sort, pile-to-pile move, grouping, reorder, and finalization
- A protected My Values page that preserves each user's finalized groups and order
- Action verbs for finalized values, saved with the user's account and included in downloads and email summaries
- Saved reflections, faithful next steps, and completion status for all twelve self-paced lessons
- A searchable, scrollable guide of 100 one-click action verbs for each finalized value
- Security headers configured in `vercel.json`

No service-role key or email-provider key is ever sent to the browser.

## Local preview

Copy `config.example.js` to `config.local.js`, enter your Supabase URL and anon key, then serve this directory:

```bash
python3 -m http.server 4174
```

Visit `http://127.0.0.1:4174`. Account email delivery requires a Vercel-compatible local runtime or a deployed environment.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/001_production_schema.sql`.
3. In Authentication, enable Email and Password. Set your production Site URL and add your local and production redirect URLs.
4. Create your first account through `auth.html`.
5. Promote that account to administrator in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Row Level Security ensures users can only access their own course data. Site configuration is publicly readable and can only be changed by an administrator.

## Vercel deployment

Import this GitHub repository into Vercel and add these environment variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM` — a sender address on a verified Resend domain

Deploy, then add the resulting production URL to the Supabase Authentication URL configuration.

## Data retention

Every user-data save extends `expires_at` by 365 days. The included scheduled cleanup removes expired records daily. Deleting a Supabase Auth user also deletes their profile and saved course content through cascading foreign keys.

## Administrator workflow

Administrators can open `admin.html` to publish:

- YouTube course videos
- Home, Course Outline, and Pre-Work copy
- BE, KNOW, and DO self-paced lesson content
- Key Scripture references and discussion questions
- Individual values-card content

Admin changes are stored in shared cloud configuration and appear for all users.

## Release checklist

- Run the Supabase migration.
- Confirm the first administrator account.
- Configure all five production environment variables.
- Verify the Resend sending domain.
- Add production and local URLs to Supabase Auth.
- Test registration, email confirmation, sign-in, sign-out, password reset, admin publishing, cross-device sync, and self-emailing.
- Review your privacy notice and terms with qualified counsel before accepting public registrations.
