# Teacher Display Order - Deployment Instructions

## Changes Made

✅ Added `order` field to Teacher model in schema
✅ Created database migration for the order field
✅ Updated API to sort teachers by order (then by name)
✅ Added PATCH endpoint for bulk updating teacher order
✅ Added drag-and-drop reordering UI in admin panel

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Add teacher display order functionality"
git push
```

### 2. Run Migration on Vercel

The migration will automatically run when you deploy to Vercel. However, if you need to run it manually:

1. Go to your Vercel project
2. Navigate to **Settings** → **General**
3. Find your connected Git repository
4. The migration in `prisma/migrations/20260125000000_add_teacher_order/` will run on next deployment

Alternatively, run manually via Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### 3. Verify in Production

After deployment:
1. Go to your admin panel: `https://www.greekdancefestival.gr/admin/teachers`
2. You should see position numbers (#1, #2, etc.) on each teacher card
3. Drag and drop teachers to reorder them
4. The order will be saved automatically

## Features

- **Drag-and-Drop**: Simply drag teacher cards to reorder them
- **Visual Feedback**: Dragged items show opacity/scale changes
- **Position Numbers**: Each card displays its current position (#1, #2, etc.)
- **Auto-Save**: Order changes are saved immediately to the database
- **Public Display**: The order is reflected on the public teachers page at `/teachers`

## Notes

- The migration file adds a new `order` column with default value 0
- Existing teachers will all have order = 0 initially
- You can reorder them in the admin panel after deployment
- Teachers are sorted by order (ascending), then by name (ascending)
