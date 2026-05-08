import { reactive } from 'vue';
import authService from '@/services/auth.service';

export const authStore = reactive({
  user: null,
  isInitialized: false,

  async initialize() {
    if (this.isInitialized) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.user = null;
      this.isInitialized = true;
      return;
    }

    try {
      const response = await authService.getProfile();
      this.user = response.user;
    } catch (error) {
      this.clearUser();
    } finally {
      this.isInitialized = true;
    }
  },

  setUser(user) {
    this.user = user;
    localStorage.setItem('isLoggedIn', 'true');
  },

  clearUser() {
    this.user = null;
    localStorage.removeItem('isLoggedIn');
  }
});
