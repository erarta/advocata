# Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
cd /home/user/advocata/apps/landing
npm install
```

This will install:
- next@14.1.0
- react@18.2.0
- react-dom@18.2.0
- framer-motion@10.18.0
- lucide-react@0.309.0
- tailwindcss@3.4.1
- typescript@5.3.3
- And all other dependencies...

### 2. Start Development Server

```bash
npm run dev
```

The landing page will be available at:
**http://localhost:4001**

### 3. Build for Production

```bash
npm run build
```

### 4. Start Production Server

```bash
npm start
```

## Verification Checklist

After installation, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] Landing page loads at http://localhost:4001
- [ ] All 11 sections are visible
- [ ] Animations work smoothly
- [ ] Page is responsive (test mobile/tablet/desktop)
- [ ] No console errors

## Common Issues

### TypeScript Errors Before Install

If you run `npm run type-check` before `npm install`, you'll see errors about missing modules. This is expected. Run `npm install` first.

### Port Already in Use

If port 4001 is already in use:

```bash
# Option 1: Change port in package.json
"dev": "next dev -p 4002"

# Option 2: Kill process on port 4001
lsof -ti:4001 | xargs kill -9
```

### Build Errors

If you encounter build errors:

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Next Steps

1. **Customize Content**: Edit `/src/lib/constants.ts`
2. **Add Images**: Place real images in `/public/images/`
3. **Configure SEO**: Update metadata in `/src/app/layout.tsx`
4. **Deploy**: Use Vercel, Netlify, or your preferred platform

## Documentation

- `LANDING_README.md` - Complete setup guide
- `DESIGN_GUIDE.md` - Design system documentation
- `ANIMATION_GUIDE.md` - Animation patterns
- `IMPLEMENTATION_SUMMARY.md` - What was built

## Support

If you encounter issues:
1. Check the documentation files
2. Verify all dependencies are installed
3. Clear cache and reinstall
4. Check console for specific error messages

---

**Ready to go!** 🚀
