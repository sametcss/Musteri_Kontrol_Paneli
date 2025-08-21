// client/src/hooks/useValidation.js
import { useState, useMemo } from 'react';

export const useValidation = (initialData = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationRules = {
    firstName: (value) => {
      if (!value?.trim()) return 'Ad zorunludur';
      if (value.trim().length < 2) return 'Ad en az 2 karakter olmalı';
      return null;
    },
    
    lastName: (value) => {
      if (!value?.trim()) return 'Soyad zorunludur';
      if (value.trim().length < 2) return 'Soyad en az 2 karakter olmalı';
      return null;
    },
    
    birthDate: (value) => {
      if (!value) return 'Doğum tarihi zorunludur';
      const birth = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      if (birth >= today) return 'Doğum tarihi bugünden önce olmalı';
      if (age < 18 || age > 120) return 'Yaş 18-120 arasında olmalı';
      return null;
    },
    
    tcIdentity: (value) => {
      if (!value?.trim()) return 'TC Kimlik No zorunludur';
      if (!/^\d{11}$/.test(value)) return 'TC Kimlik No 11 haneli olmalı';
      return null;
    },
    
    passportNo: (value) => {
      if (!value?.trim()) return 'Pasaport No zorunludur';
      if (value.length < 6) return 'Pasaport No en az 6 karakter olmalı';
      return null;
    },
    
    passportExpiryDate: (value) => {
      if (!value) return 'Pasaport bitiş tarihi zorunludur';
      const expiry = new Date(value);
      const today = new Date();
      if (expiry <= today) return 'Pasaport tarihi gelecekte olmalı';
      const sixMonths = new Date();
      sixMonths.setMonth(today.getMonth() + 6);
      if (expiry <= sixMonths) return 'En az 6 ay geçerli olmalı';
      return null;
    },
    
    phone: (value) => {
      if (!value?.trim()) return 'Telefon zorunludur';
      const cleaned = value.replace(/[\s\-\(\)]/g, '');
      if (!/^(\+90|0)?[5-9][0-9]{9}$/.test(cleaned)) return 'Geçerli telefon numarası girin';
      return null;
    },
    
    email: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Geçerli e-posta adresi girin';
      }
      return null;
    },
    
    countryId: (value) => {
      if (!value) return 'Ülke seçimi zorunludur';
      return null;
    },
    
    visaTypeId: (value) => {
      if (!value) return 'Vize türü seçimi zorunludur';
      return null;
    },
    
    officeId: (value) => {
      if (!value) return 'Ofis seçimi zorunludur';
      return null;
    }
  };

  const validateField = (field, value) => {
    const rule = validationRules[field];
    return rule ? rule(value) : null;
  };

  const validateStep = (stepFields, data) => {
    const stepErrors = {};
    stepFields.forEach(field => {
      const error = validateField(field, data[field]);
      if (error) stepErrors[field] = error;
    });
    return stepErrors;
  };

  const setFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const setFieldError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    touched,
    validateField,
    validateStep,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors
  };
};