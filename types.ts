export enum ModuleType {
  DIAGNOSIS = 'DIAGNOSIS',
  PHARMACY = 'PHARMACY',
  EMERGENCY = 'EMERGENCY',
  PROVIDER_REGISTER = 'PROVIDER_REGISTER',
  PROVIDER_LOGIN = 'PROVIDER_LOGIN',
  PROVIDER_DASHBOARD = 'PROVIDER_DASHBOARD',
  USER_LOGIN = 'USER_LOGIN',
  USER_REGISTER = 'USER_REGISTER',
  USER_PROFILE = 'USER_PROFILE',
  TRIP = 'TRIP'
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords!
  age?: string;
  gender?: string;
  address?: string;
  photo?: string; // Base64 string
  type: 'USER';
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Provider {
  id: string;
  type: 'HOSPITAL' | 'PHARMACY' | 'DOCTOR';
  name: string;
  phone: string;
  location: GeoLocation;
  services: string[]; // e.g., "Cardiology", "24/7", "Delivery"
  email?: string; // For login
  password?: string; // For login
  rating: number;
  reviews: Review[];
  licenseNumber?: string; // For Doctors
}

export interface DiagnosisResult {
  id: string;
  userId?: string; // Link result to a specific user
  date: string;
  symptoms: string;
  aiAnalysis: string;
  image?: string; // Base64
}

export interface NutritionResult {
  id: string;
  date: string;
  foodItem: string;
  calories: string;
  macros: string; // JSON string
  recipe: string;
}