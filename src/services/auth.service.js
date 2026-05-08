import createApiClient from './api.service';

class AuthService {
  constructor() {
    this.api = createApiClient();
  }

  async login(credentials) {
    return (await this.api.post('/api/auth/login', credentials)).data;
  }

  async register(data) {
    return (await this.api.post('/api/auth/register', data)).data;
  }

  async googleLogin(data) {
    return (await this.api.post('/api/auth/google', data)).data;
  }

  async logout() {
    return (await this.api.post('/api/auth/logout')).data;
  }

  async getProfile() {
    return (await this.api.get('/api/auth/me')).data;
  }
}

export default new AuthService();
