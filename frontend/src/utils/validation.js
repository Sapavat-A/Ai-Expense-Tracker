// Validation utilities for form inputs and data

export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  // Password validation
  password: (value, minLength = 8) => {
    if (!value) return 'Password is required';
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  // Amount validation
  amount: (value, min = 0, max = 1000000) => {
    if (!value && value !== 0) return 'Amount is required';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number';
    if (numValue < min) return `Amount must be at least ${min}`;
    if (numValue > max) return `Amount must be less than ${max}`;
    if (numValue <= 0) return 'Amount must be positive';
    return null;
  },

  // Date validation
  date: (value) => {
    if (!value) return 'Date is required';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Please enter a valid date';
    if (date > new Date()) return 'Date cannot be in the future';
    return null;
  },

  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Text length validation
  maxLength: (value, maxLength, fieldName = 'Field') => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be ${maxLength} characters or less`;
    }
    return null;
  },

  // Phone number validation
  phone: (value) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return 'URL is required';
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    // Handle multiple validation rules
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = typeof rule === 'function' ? rule(value) : validators[rule](value);
        if (error) {
          errors[field] = error;
          isValid = false;
          break;
        }
      }
    } else {
      // Handle single validation rule
      const error = typeof rules === 'function' ? rules(value) : validators[rules](value);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Real-time validation hook
export const useValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    const error = typeof rules === 'function' ? rules(value) : validators[rules](value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];
      
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          const error = typeof rule === 'function' ? rule(value) : validators[rule](value);
          if (error) {
            newErrors[field] = error;
            isValid = false;
            break;
          }
        }
      } else {
        const error = typeof rules === 'function' ? rules(value) : validators[rules](value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Sanitization utilities
export const sanitize = {
  // Remove HTML tags
  html: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Trim and normalize whitespace
  text: (str) => {
    return str.toString().trim().replace(/\s+/g, ' ');
  },

  // Sanitize email
  email: (email) => {
    return email.toString().toLowerCase().trim();
  },

  // Sanitize number input
  number: (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize currency input
  currency: (value) => {
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
};

// Error message formatter
export const formatErrorMessage = (errors, fieldName) => {
  if (typeof errors === 'string') return errors;
  if (Array.isArray(errors)) return errors[0];
  if (typeof errors === 'object' && errors[fieldName]) {
    return errors[fieldName];
  }
  return 'Validation failed';
};

export default {
  validators,
  validateForm,
  useValidation,
  sanitize,
  formatErrorMessage
};
