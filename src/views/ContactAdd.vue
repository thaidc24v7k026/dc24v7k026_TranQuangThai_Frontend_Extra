<template>
  <div class="page">
    <h4>Thêm Liên hệ</h4>
    <ContactForm :contact="contact" @submit:contact="addContact" />
  </div>
</template>

<script>
import ContactForm from '@/components/ContactForm.vue';
import ContactService from '@/services/contact.service';
import { toast } from 'vue-sonner';

export default {
  components: { ContactForm },
  data() {
    return {
      contact: {
        name: '',
        email: '',
        address: '',
        phone: '',
        favorite: false,
      },
    };
  },
  methods: {
    async addContact(data, done) {
      try {
        await ContactService.create(data);
        toast.success('Liên hệ được thêm mới thành công.');
        this.$router.push({ name: 'contactbook' });
      } catch (error) {
        const message = error.response?.data?.message || 'Thêm liên hệ thất bại. Vui lòng thử lại.';
        toast.error(message);
        done(error);
      }
    },
  },
};
</script>
