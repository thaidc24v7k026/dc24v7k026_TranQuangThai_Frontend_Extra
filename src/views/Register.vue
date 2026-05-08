<template>
  <div class="page">
    <div class="card card-container">
      <h4 class="text-center mb-4">Đăng ký tài khoản</h4>
      <Form @submit="handleRegister" :validation-schema="schema" autocomplete="off">
        <div class="form-group">
          <label for="name">Họ và tên</label>
          <Field name="name" type="text" class="form-control" placeholder="Nhập họ và tên..." autocomplete="off" />
          <ErrorMessage name="name" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <Field name="email" type="email" class="form-control" placeholder="Nhập email..." autocomplete="off" />
          <ErrorMessage name="email" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <Field name="password" type="password" class="form-control" placeholder="Nhập mật khẩu..." autocomplete="new-password" />
          <ErrorMessage name="password" class="error-feedback" />
        </div>

        <div class="form-group">
          <label for="passwordConfirm">Xác nhận mật khẩu</label>
          <Field name="passwordConfirm" type="password" class="form-control" placeholder="Nhập lại mật khẩu..." autocomplete="new-password" />
          <ErrorMessage name="passwordConfirm" class="error-feedback" />
        </div>

        <div class="form-group mt-4">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            <span>Đăng ký</span>
          </button>
        </div>

        <div class="form-group mt-2" v-if="message || successMessage">
          <div :class="['alert', message ? 'alert-danger' : 'alert-success']" role="alert">
            {{ message || successMessage }}
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
          <p class="mb-0">Đã có tài khoản? <router-link :to="{ name: 'login' }">Đăng nhập</router-link></p>
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
      name: yup
        .string()
        .required('Họ tên là bắt buộc.')
        .min(2, 'Tên phải có ít nhất 2 ký tự.')
        .max(50, 'Tên có nhiều nhất 50 ký tự.'),
      email: yup.string().required('Email là bắt buộc.').email('Email không đúng định dạng.'),
      password: yup.string().required('Mật khẩu là bắt buộc.').min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
      passwordConfirm: yup
        .string()
        .required('Xác nhận mật khẩu là bắt buộc.')
        .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp.'),
    });
    return {
      schema,
      loading: false,
      message: '',
      successMessage: '',
    };
  },
  methods: {
    async handleRegister(values) {
      this.loading = true;
      this.message = '';
      this.successMessage = '';

      try {
        await authService.register({
          name: values.name,
          email: values.email,
          password: values.password,
        });

        this.successMessage = 'Đăng ký thành công! Đang chuyển hướng...';
        toast.success('Đăng ký tài khoản thành công!');

        setTimeout(() => {
          this.$router.push({ name: 'login' });
        }, 1500);
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
      this.successMessage = '';

      try {
        const apiResponse = await authService.googleLogin({ idToken: response.credential });

        authStore.setUser(apiResponse.user);

        this.successMessage = 'Uỷ quyền Google thành công! Đang chuyển hướng...';
        toast.success('Đăng ký Google thành công!');
        setTimeout(() => {
          this.$router.push({ name: 'contactbook' });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.message = error.response?.data?.message || 'Đăng ký Google thất bại hoặc người dùng uỷ quyền bị huỷ.';
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
