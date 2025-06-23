# Design Agency Landing Page

A modern, responsive landing page for a design agency built with React and TypeScript, following a modular architecture with clear separation of concerns.

## Features

- **Responsive Design**: Mobile-first approach with beautiful responsive layouts
- **Modern UI**: Clean, professional design with gradient backgrounds and smooth animations
- **Modular Architecture**: Component-based structure with hooks for state management
- **Multiple Pages**: Home, About, Services, Portfolio, and Contact pages
- **Interactive Elements**: Hover effects, smooth transitions, and form interactions
- **Portfolio Filtering**: Dynamic portfolio filtering by category
- **Contact Form**: Fully functional contact form with validation

## Pages

### Home Page (`/`)

- Hero section with compelling call-to-action
- Service preview showcasing key offerings
- Portfolio highlights
- Call-to-action section

### About Page (`/about`)

- Company story and mission
- Core values presentation
- Team member profiles
- Professional layout with engaging visuals

### Services Page (`/services`)

- Detailed service descriptions
- Feature lists and pricing
- Process overview
- Professional service cards

### Portfolio Page (`/portfolio`)

- Filterable project gallery
- Project details and categories
- Interactive hover effects
- Tag-based organization

### Contact Page (`/contact`)

- Contact information display
- Interactive contact form
- Form validation and submission
- Success/error messaging

## Architecture

The project follows the guidelines specified in `guideline.md`:

### Resource Types

- **Components** (`.component.tsx`): UI-only React components
- **Hooks** (`.hook.ts`): Logic and state management
- **Loaders** (`.loader.ts`): Data fetching functions
- **Handlers** (`.handler.ts`): API request processing
- **Styles** (`.css`): Component-specific styling

### Styling Approach

- CSS files separate from components
- ID-based styling for unique elements
- `clsx` for conditional styling
- Responsive design with mobile-first approach

### File Structure

```
design-agency-landing-page/
├── components/
│   ├── call-to-action/
│   ├── contact-form/
│   ├── footer/
│   ├── header/
│   ├── hero/
│   ├── layout/
│   ├── navigation/
│   ├── portfolio-preview/
│   └── service-preview/
├── hooks/
│   ├── useContactForm.hook.ts
│   ├── useHomeData.hook.ts
│   ├── usePortfolio.hook.ts
│   └── useServices.hook.ts
├── views/
│   ├── about/
│   ├── contact/
│   ├── home/
│   ├── portfolio/
│   └── services/
├── types/
├── router.json
└── README.md
```

## Design Features

### Visual Design

- Modern gradient backgrounds
- Consistent color scheme (purple/blue theme)
- Professional typography
- Smooth animations and transitions
- Clean card-based layouts

### Interactive Elements

- Hover effects on cards and buttons
- Smooth page transitions
- Portfolio filtering
- Form validation feedback
- Loading states

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Responsive navigation
- Optimized for all screen sizes

## Color Scheme

- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Text: `#1f2937` (Dark Gray)
- Background: `#f8fafc` (Light Gray)
- Accent: `#667eea` to `#764ba2` (Gradient)

## Typography

- Font Family: Inter, system fonts
- Headings: Bold weights (700-800)
- Body text: Regular weight (400-500)
- Responsive font sizes

This project demonstrates modern web development practices with a focus on user experience, maintainability, and professional design standards.
