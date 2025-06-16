# Clinic Admin Dashboard

A modern, responsive clinic administration dashboard built with React, TypeScript, and CSS Modules. This application provides comprehensive patient management, appointment scheduling, and doctor management capabilities.

## Features

### 🏥 Patient Management

- **Patient List**: View all patients with search and pagination
- **Patient Profiles**: Detailed patient information including medical history and allergies
- **Patient Forms**: Add and edit patient information
- **Emergency Contacts**: Manage patient emergency contact information

### 📅 Appointment Management

- **Appointment List**: View all appointments with filtering by status, doctor, and date
- **Appointment Scheduling**: Create new appointments
- **Status Management**: Update appointment statuses (scheduled, confirmed, in-progress, completed, cancelled)
- **Real-time Updates**: Live status updates for appointments

### 👨‍⚕️ Doctor Management

- **Doctor Directory**: View all doctors with their specializations and availability
- **Doctor Profiles**: Detailed information about each doctor
- **Availability Tracking**: Monitor doctor schedules and availability

### 🎛️ Dashboard & Analytics

- **Overview Dashboard**: Key metrics and statistics
- **Today's Appointments**: Quick view of today's schedule
- **Quick Actions**: Fast access to common tasks
- **Recent Activity**: Track recent system activity

### 🔐 Authentication & Security

- **Secure Login**: Role-based authentication
- **User Management**: Different permission levels for different roles
- **Session Management**: Secure session handling

### ⚙️ Settings & Configuration

- **Profile Management**: Update user profiles and passwords
- **Notification Settings**: Configure email and SMS notifications
- **System Preferences**: Customize system behavior

## Technology Stack

### Frontend

- **React 18+**: Modern React with hooks and function components
- **TypeScript**: Full type safety and better developer experience
- **CSS Modules**: Scoped styling with CSS variables for theming
- **Modern CSS**: Flexbox, Grid, and CSS custom properties

### State Management

- **React Context**: Global state management with useReducer
- **Custom Hooks**: Reusable business logic hooks
- **Local Storage**: Persistent authentication state

### API Integration

- **Fetch API**: Modern HTTP client with error handling
- **TypeScript Types**: Fully typed API responses
- **Error Boundaries**: Graceful error handling

## Project Structure

```
clinic-admin/
├── api/                    # API client and configuration
│   └── client.ts
├── components/             # Reusable UI components
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Form.tsx
├── data/                   # Mock data for development
│   └── mockData.ts
├── hooks/                  # Custom React hooks
│   ├── useAppointments.ts
│   ├── useAuth.ts
│   ├── useDoctors.ts
│   └── usePatients.ts
├── store/                  # State management
│   └── context.tsx
├── styles/                 # CSS Modules
│   ├── variables.module.css
│   ├── Button.module.css
│   ├── Card.module.css
│   ├── Form.module.css
│   ├── Table.module.css
│   ├── Dashboard.module.css
│   ├── PatientList.module.css
│   ├── PatientForm.module.css
│   ├── PatientProfile.module.css
│   ├── AppointmentList.module.css
│   ├── DoctorList.module.css
│   ├── Login.module.css
│   └── Settings.module.css
├── types/                  # TypeScript type definitions
│   └── index.ts
├── utils/                  # Utility functions
│   ├── dateUtils.ts
│   └── helpers.ts
├── views/                  # Page components
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── appointments/
│   │   └── AppointmentList.tsx
│   ├── auth/
│   │   └── Login.tsx
│   ├── doctors/
│   │   └── DoctorList.tsx
│   └── patients/
│       ├── PatientList.tsx
│       ├── PatientForm.tsx
│       └── PatientProfile.tsx
├── index.ts                # Main export file
└── router.json            # Route configuration
```

## Routes

The application follows the route structure defined in `router.json`:

- `/` - Dashboard (overview and statistics)
- `/patients` - Patient list with search and pagination
- `/patients/new` - Add new patient form
- `/patients/:id` - Patient profile view
- `/patients/:id/edit` - Edit patient form
- `/patients/:id/history` - Patient medical history
- `/appointments` - Appointment list with filtering
- `/appointments/new` - Schedule new appointment
- `/appointments/:id` - Appointment details
- `/doctors` - Doctor directory
- `/settings` - Application settings
- `/auth/login` - User login

## Components

### UI Components

#### Button

```tsx
<Button variant="primary" size="large" loading={isLoading}>
  Submit
</Button>
```

Variants: `primary`, `secondary`, `success`, `warning`, `error`, `outline`, `ghost`
Sizes: `small`, `default`, `large`

#### Form Components

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>

<Select
  label="Status"
  options={statusOptions}
  value={status}
  onChange={handleStatusChange}
/>

<Textarea
  label="Notes"
  rows={4}
  value={notes}
  onChange={handleNotesChange}
/>
```

#### Card Components

```tsx
<Card>
  <CardHeader>
    <CardTitle>Patient Information</CardTitle>
    <CardSubtitle>Last updated 2 hours ago</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Custom Hooks

#### usePatients

```tsx
const {
  patients,
  loading,
  error,
  pagination,
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
} = usePatients();
```

#### useAppointments

```tsx
const {
  appointments,
  loading,
  error,
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = useAppointments();
```

#### useAuth

```tsx
const { user, isAuthenticated, loading, error, login, logout, initializeAuth } =
  useAuth();
```

## Styling

The application uses CSS Modules with CSS custom properties for consistent theming:

### CSS Variables

```css
:root {
  --primary-color: #2563eb;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  /* ... more variables */
}
```

### Responsive Design

- Mobile-first approach
- Breakpoints at 768px for tablet/desktop
- Flexible grid layouts using CSS Grid and Flexbox
- Responsive typography and spacing

## Data Management

### Types

```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: "consultation" | "follow-up" | "emergency" | "routine";
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}
```

### State Management

The application uses React Context with useReducer for global state management:

```tsx
// Wrap your app with the provider
<AppProvider>
  <App />
</AppProvider>;

// Use in components
const { state, dispatch } = useAppContext();
```

## Development

### Mock Data

The application includes comprehensive mock data for development:

- 3 sample patients with realistic medical information
- 3 doctors with different specializations
- 5 appointments across different statuses
- User authentication data

### API Integration

The API client is designed to work with a REST API:

```typescript
// Example API calls
const patients = await apiClient.getPatients(page, limit, search);
const patient = await apiClient.createPatient(patientData);
const appointment = await apiClient.updateAppointment(id, updateData);
```

### Error Handling

- Global error boundaries
- Form validation with real-time feedback
- API error handling with user-friendly messages
- Loading states for all async operations

## Best Practices

### Code Organization

- Separation of concerns with clear folder structure
- Reusable components and hooks
- Type-safe API integration
- Consistent naming conventions

### Performance

- Lazy loading for large lists
- Debounced search functionality
- Optimized re-renders with proper dependency arrays
- Efficient state updates

### Accessibility

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

### Security

- Input validation and sanitization
- Secure authentication flow
- Protected routes
- XSS prevention

## Integration

This clinic admin dashboard is designed to be framework-agnostic and can be integrated into various React-based applications. The components are self-contained and can be imported individually or as a complete package.

### Example Integration

```tsx
import {
  AppProvider,
  Dashboard,
  PatientList,
  AppointmentList,
} from "./clinic-admin";

function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
```

## Future Enhancements

- Real-time notifications
- Advanced reporting and analytics
- Integration with medical devices
- Telemedicine capabilities
- Multi-clinic support
- Advanced role-based permissions
- Dark mode theme
- Offline functionality
- Print support for patient records
