# Contact Component

This folder contains the refactored Contact component split into focused, maintainable modules.

## Structure

```
Contact/
├── index.tsx           # Main Contact component with tab logic and form submission
├── PrivateForm.tsx     # Form component for private customers
├── BusinessForm.tsx    # Form component for business customers
├── types.ts           # Shared TypeScript types and interfaces
└── validation.ts      # Validation utilities and functions
```

## Components

### `index.tsx`
- Main Contact component
- Handles tab navigation between private/business forms
- Manages form submission logic
- Contains shared state (errors, result, activeTab)

### `PrivateForm.tsx`
- Form fields for private customers
- Fields: Name, Surname, Email, Phone, Message
- Receives errors as props for validation feedback

### `BusinessForm.tsx`
- Form fields for business customers
- Fields: Company Name, VAT Number, Contact Person, Email, Phone, Address, Message
- Includes specialized VAT number validation
- Receives errors as props for validation feedback

### `types.ts`
- TypeScript type definitions
- `CustomerType`: 'private' | 'business'
- `ValidationErrors`: Object with error messages
- `FormProps`: Props interface for form components

### `validation.ts`
- Email validation (regex-based)
- Italian phone number validation (mobile + landline)
- Italian VAT number validation with checksum
- Form validation orchestration function

## Usage

```tsx
import Contact from '../components/Contact';

// The component is self-contained and requires no props
<Contact />
```

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single responsibility
2. **Maintainability**: Easier to modify individual forms or validation logic
3. **Testability**: Can unit test each component and utility separately
4. **Reusability**: Form components could be reused elsewhere if needed
5. **Code Organization**: Logical grouping of related functionality
