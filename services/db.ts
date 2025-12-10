import { Provider, DiagnosisResult, User, Review, NutritionResult } from '../types';

// Initial Mock Data
const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'h1',
    type: 'HOSPITAL',
    name: 'City General Hospital',
    phone: '+1-555-0123',
    location: { lat: 37.7749, lng: -122.4194, address: '123 Health St, San Francisco' },
    services: ['Emergency', 'Cardiology', 'Pediatrics'],
    email: 'hospital@city.com',
    password: 'admin',
    rating: 4.5,
    reviews: [
        { id: 'r1', userName: 'John Doe', rating: 5, comment: 'Excellent emergency care.', date: '2023-10-01' },
        { id: 'r2', userName: 'Jane Smith', rating: 4, comment: 'Wait time was a bit long.', date: '2023-09-15' }
    ]
  },
  {
    id: 'p1',
    type: 'PHARMACY',
    name: 'MediCare Plus Pharmacy',
    phone: '+1-555-0987',
    location: { lat: 37.7849, lng: -122.4094, address: '456 Wellness Blvd, San Francisco' },
    services: ['24/7', 'Home Delivery'],
    email: 'pharmacy@medicare.com',
    password: 'admin',
    rating: 4.8,
    reviews: [
        { id: 'r3', userName: 'Alice Brown', rating: 5, comment: 'Always stocked up.', date: '2023-10-05' }
    ]
  }
];

class DBService {
  private PROVIDERS_KEY = 'ai_doctor_providers';
  private DIAGNOSIS_KEY = 'ai_doctor_diagnosis_history';
  private NUTRITION_KEY = 'ai_doctor_nutrition_history';
  private USERS_KEY = 'ai_doctor_users';
  private CURRENT_USER_KEY = 'ai_doctor_current_user';
  private CURRENT_PROVIDER_KEY = 'ai_doctor_current_provider';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.PROVIDERS_KEY)) {
      localStorage.setItem(this.PROVIDERS_KEY, JSON.stringify(INITIAL_PROVIDERS));
    }
    if (!localStorage.getItem(this.DIAGNOSIS_KEY)) {
      localStorage.setItem(this.DIAGNOSIS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.NUTRITION_KEY)) {
      localStorage.setItem(this.NUTRITION_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
    }
  }

  // --- Provider Methods ---
  getProviders(type?: 'HOSPITAL' | 'PHARMACY' | 'DOCTOR'): Provider[] {
    const data = JSON.parse(localStorage.getItem(this.PROVIDERS_KEY) || '[]');
    if (type) {
      return data.filter((p: Provider) => p.type === type);
    }
    return data;
  }

  addProvider(provider: Provider): void {
    const data = this.getProviders();
    data.push(provider);
    localStorage.setItem(this.PROVIDERS_KEY, JSON.stringify(data));
  }

  updateProvider(updatedProvider: Provider): void {
    const data = this.getProviders();
    const index = data.findIndex(p => p.id === updatedProvider.id);
    if (index !== -1) {
      data[index] = updatedProvider;
      localStorage.setItem(this.PROVIDERS_KEY, JSON.stringify(data));
      // Update session if it's the current provider
      const current = this.getCurrentProvider();
      if (current && current.id === updatedProvider.id) {
          this.setCurrentProvider(updatedProvider);
      }
    }
  }

  addReview(providerId: string, review: Review): void {
      const providers = this.getProviders();
      const index = providers.findIndex(p => p.id === providerId);
      if (index !== -1) {
          const provider = providers[index];
          provider.reviews.unshift(review);
          
          // Recalculate average rating
          const total = provider.reviews.reduce((acc, r) => acc + r.rating, 0);
          provider.rating = total / provider.reviews.length;
          
          providers[index] = provider;
          localStorage.setItem(this.PROVIDERS_KEY, JSON.stringify(providers));
      }
  }

  loginProvider(email: string, pass: string): Provider | null {
    const providers = this.getProviders();
    const provider = providers.find(p => p.email === email && p.password === pass);
    if (provider) {
        this.setCurrentProvider(provider);
        return provider;
    }
    return null;
  }

  setCurrentProvider(provider: Provider): void {
      localStorage.setItem(this.CURRENT_PROVIDER_KEY, JSON.stringify(provider));
  }

  getCurrentProvider(): Provider | null {
      const p = localStorage.getItem(this.CURRENT_PROVIDER_KEY);
      return p ? JSON.parse(p) : null;
  }

  logoutProvider(): void {
      localStorage.removeItem(this.CURRENT_PROVIDER_KEY);
  }

  // --- History Methods ---
  saveDiagnosis(result: DiagnosisResult): void {
    const data = JSON.parse(localStorage.getItem(this.DIAGNOSIS_KEY) || '[]');
    data.unshift(result); // Add to top
    localStorage.setItem(this.DIAGNOSIS_KEY, JSON.stringify(data));
  }

  getDiagnosisHistory(userId: string): DiagnosisResult[] {
    const data = JSON.parse(localStorage.getItem(this.DIAGNOSIS_KEY) || '[]');
    // Filter by userId if present, otherwise return empty or handle legacy data as needed
    return data.filter((item: DiagnosisResult) => item.userId === userId);
  }

  saveNutrition(result: NutritionResult): void {
    const data = JSON.parse(localStorage.getItem(this.NUTRITION_KEY) || '[]');
    data.unshift(result);
    localStorage.setItem(this.NUTRITION_KEY, JSON.stringify(data));
  }

  // --- Auth Methods ---

  registerUser(user: User): boolean {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    if (users.find((u: User) => u.email === user.email)) {
      return false; // User exists
    }
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(user);
    return true;
  }

  loginUser(email: string, pass: string): User | null {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email && u.password === pass);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  updateUser(updatedUser: User): void {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const index = users.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // Update session if it matches
      const current = this.getCurrentUser();
      if (current && current.id === updatedUser.id) {
          this.setCurrentUser(updatedUser);
      }
    }
  }

  logoutUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const u = localStorage.getItem(this.CURRENT_USER_KEY);
    return u ? JSON.parse(u) : null;
  }
}

export const db = new DBService();