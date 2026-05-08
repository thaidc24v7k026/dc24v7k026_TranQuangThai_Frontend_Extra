<template>
  <div v-if="isLoading" class="text-center my-5">
    <div class="spinner-border text-primary" role="status">
      <span class="sr-only">Đang tải...</span>
    </div>
    <p class="mt-2 text-muted">Đang tải dữ liệu liên hệ...</p>
  </div>
  <div v-else-if="contact" class="page">
    <h4>Hiệu chỉnh Liên hệ</h4>
    <ContactForm :contact="contact" @submit:contact="updateContact" @delete:contact="deleteContact" />
  </div>
</template>

<script>
import ContactForm from '@/components/ContactForm.vue';
import ContactService from '@/services/contact.service';
import { toast } from 'vue-sonner';

export default {
  components: { ContactForm },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      contact: null,
      isLoading: false,
    };
  },
  methods: {
    async getContact(id) {
      this.isLoading = true;
      try {
        this.contact = await ContactService.get(id);
      } catch (error) {
        this.$router.push({
          name: 'notfound',
          params: { pathMatch: this.$route.path.split('/').slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async updateContact(data, done) {
      try {
        await ContactService.update(this.contact._id, data);
        toast.success('Liên hệ được cập nhật thành công.');
        this.$router.push({ name: 'contactbook' });
      } catch (error) {
        const message = error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
        toast.error(message);
        done(error);
      }
    },
    async deleteContact() {
      if (confirm('Bạn muốn xóa Liên hệ này?')) {
        try {
          await ContactService.delete(this.contact._id);
          toast.success('Đã xóa liên hệ.');
          this.$router.push({ name: 'contactbook' });
        } catch (error) {
          toast.error('Xóa liên hệ thất bại. Vui lòng thử lại.');
        }
      }
    },
  },
  created() {
    this.getContact(this.id);
  },
};
</script>
