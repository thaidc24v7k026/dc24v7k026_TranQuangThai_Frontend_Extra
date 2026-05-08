<template>
  <nav class="navbar navbar-expand navbar-dark bg-dark">
    <a href="/" class="navbar-brand">Ứng dụng Quản lý danh bạ</a>
    <div class="mr-auto navbar-nav">
      <li class="nav-item">
        <router-link :to="{ name: 'contactbook' }" class="nav-link">
          Danh bạ
          <i class="fa-solid fa-address-book"></i>
        </router-link>
      </li>
    </div>
    
    <div class="navbar-nav ml-auto">
      <template v-if="!authStore.user">
        <li class="nav-item">
          <router-link :to="{ name: 'login' }" class="nav-link">
            <i class="fa-solid fa-right-to-bracket mr-1"></i> Đăng nhập
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'register' }" class="nav-link">
            <i class="fa-solid fa-user-plus mr-1"></i> Đăng ký
          </router-link>
        </li>
      </template>
      <template v-else>
        <li class="nav-item d-flex align-items-center">
          <span class="navbar-text text-light mr-3">
            <i class="fa-solid fa-user-circle mr-1"></i>
            {{ authStore.user.name || authStore.user.email }}
          </span>
          <a href="#" class="nav-link text-danger font-weight-bold" @click.prevent="logout">
            <i class="fa-solid fa-right-from-bracket mr-1"></i> Đăng xuất
          </a>
        </li>
      </template>
    </div>
  </nav>
</template>

<script>
import authService from '@/services/auth.service';
import { authStore } from '@/store/authStore';

export default {
  data() {
    return {
      authStore,
    };
  },
  methods: {
    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        authStore.clearUser();
        this.$router.push({ name: 'login' });
      }
    },
  },
};
</script>
