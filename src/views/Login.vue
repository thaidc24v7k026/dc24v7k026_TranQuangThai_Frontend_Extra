<template>
  <div class="page">
    <div class="card card-container">
      <h4 class="text-center mb-4">Đăng nhập</h4>
      <Form @submit="handleLogin" :validation-schema="schema">
        <div class="form-group">
          <label for="email">E-mail</label>
          <Field name="email" type="email" class="form-control" placeholder="Nhập email..." />
          <ErrorMessage name="email" class="error-feedback" />
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <Field name="password" type="password" class="form-control" placeholder="Nhập mật khẩu..." />
          <ErrorMessage name="password" class="error-feedback" />
        </div>

        <div class="form-group mt-4">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            <span>Đăng nhập</span>
          </button>
        </div>

        <div class="form-group mt-2" v-if="message">
          <div class="alert alert-danger" role="alert">
            {{ message }}
          </div>
        </div>

        <div class="d-flex align-items-center my-3">
          <div class="flex-grow-1 border-bottom"></div>
          <span class="mx-3 text-muted" style="font-size: 0.9em">Hoặc</span>
          <div class="flex-grow-1 border-bottom"></div>
        </div>

        <div class="form-group d-flex justify-content-center">
          <GoogleLogin :callback="handleGoogleAuth" />
        </div>

        <div class="text-center mt-3">
          <p class="mb-0">Chưa có tài khoản? <router-link :to="{ name: 'register' }">Đăng ký ngay</router-link></p>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { GoogleLogin } from 'vue3-google-login';
import authService from '@/services/auth.service';
import { authStore } from '@/store/authStore';
import { toast } from 'vue-sonner';

export default {
  components: {
    Form,
    Field,
    ErrorMessage,
    GoogleLogin,
  },
  data() {
    const schema = yup.object().shape({
      email: yup.string().required('Email là bắt buộc.').email('Email không đúng định dạng.'),
      password: yup.string().required('Mật khẩu là bắt buộc.').min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
    });
    return {
      schema,
      loading: false,
      message: '',
    };
  },
  methods: {
    async handleLogin(values) {
      this.loading = true;
      this.message = '';

      try {
        const response = await authService.login({
          email: values.email,
          password: values.password,
        });

        authStore.setUser(response.user);
        toast.success('Đăng nhập thành công!');
        this.$router.push({ name: 'contactbook' });
      } catch (error) {
        this.message = error.response?.data?.message || 'Đã có lỗi xảy ra.';
        toast.error(this.message);
      } finally {
        this.loading = false;
      }
    },
    async handleGoogleAuth(response) {
      this.loading = true;
      this.message = '';

      try {
        const apiResponse = await authService.googleLogin({ idToken: response.credential });

        authStore.setUser(apiResponse.user);
        toast.success('Đăng nhập Google thành công!');
        this.$router.push({ name: 'contactbook' });
      } catch (error) {
        console.error(error);
        this.message = error.response?.data?.message || 'Đăng nhập Google thất bại hoặc người dùng uỷ quyền bị huỷ.';
        toast.error(this.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
@import '@/assets/form.css';

.btn-google {
  background-color: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
  font-weight: 500;
  border-radius: 4px;
}

.btn-google:hover:not(:disabled) {
  background-color: #f8f9fa;
  box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
