<script>
import AppHeader from '@/components/AppHeader.vue';
import { Toaster } from 'vue-sonner';

export default {
  components: {
    AppHeader,
    Toaster,
  },
};
</script>

<template>
  <div id="app">
    <AppHeader />
    <div class="container mt-3">
      <router-view />
    </div>
    <Toaster position="top-right" rich-colors close-button />
  </div>
</template>

<style>
.page {
  max-width: 600px;
  margin: auto;
}
</style>
