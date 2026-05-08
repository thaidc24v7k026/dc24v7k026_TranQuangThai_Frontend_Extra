<template>
  <div class="page row">
    <div class="col-md-10">
      <InputSearch v-model="searchText" />
    </div>
    <div class="mt-3 col-md-6">
      <h4>
        Danh bạ
        <i class="fa-solid fa-address-book"></i>
      </h4>
      <div v-if="isLoading" class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Đang tải...</span>
        </div>
      </div>
      <ContactList v-else-if="filteredContactsCount > 0" :contacts="filteredContacts" v-model:activeIndex="activeIndex" />
      <p v-else>Không có liên hệ nào.</p>

      <div class="mt-3 row justify-content-around align-items-center">
        <button class="btn btn-sm btn-primary" @click="refreshList()"><i class="fa-solid fa-redo"></i> Làm mới</button>
        <button class="btn btn-sm btn-success" @click="goToAddContact">
          <i class="fa-solid fa-plus"></i> Thêm mới
        </button>
        <button class="btn btn-sm btn-danger" @click="removeAllContacts">
          <i class="fa-solid fa-trash"></i> Xóa tất cả
        </button>
      </div>
    </div>
    <div class="mt-3 col-md-6">
      <div v-if="activeContact">
        <h4>
          Chi tiết Liên hệ
          <i class="fa-solid fa-address-card"></i>
        </h4>
        <ContactCard :contact="activeContact" />
        <router-link
          :to="{
            name: 'contact.edit',
            params: { id: activeContact._id },
          }"
        >
          <span class="mt-2 badge badge-warning"> <i class="fas fa-edit"></i> Hiệu chỉnh </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import ContactCard from '@/components/ContactCard.vue';
import InputSearch from '@/components/InputSearch.vue';
import ContactList from '@/components/ContactList.vue';
import ContactService from '@/services/contact.service';
import { toast } from 'vue-sonner';

export default {
  components: {
    ContactCard,
    InputSearch,
    ContactList,
  },
  data() {
    return {
      contacts: [],
      activeIndex: -1,
      searchText: '',
      isLoading: false,
    };
  },
  watch: {
    searchText() {
      this.activeIndex = -1;
    },
  },
  computed: {
    contactStrings() {
      return this.contacts.map((contact) => {
        const { name, email, address, phone, notes, province_name, ward_name } = contact;
        return [name, email, address, phone, notes, province_name, ward_name].join('').toLowerCase();
      });
    },
    filteredContacts() {
      if (!this.searchText) return this.contacts;
      const keyword = this.searchText.toLowerCase();
      return this.contacts.filter((_contact, index) => this.contactStrings[index].includes(keyword));
    },
    activeContact() {
      if (this.activeIndex < 0) return null;
      return this.filteredContacts[this.activeIndex];
    },
    filteredContactsCount() {
      return this.filteredContacts.length;
    },
  },
  methods: {
    async retrieveContacts() {
      this.isLoading = true;
      try {
        this.contacts = await ContactService.getAll();
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
    },
    refreshList() {
      this.retrieveContacts();
      this.activeIndex = -1;
    },
    async removeAllContacts() {
      if (confirm('Bạn muốn xóa tất cả Liên hệ?')) {
        try {
          await ContactService.deleteAll();
          toast.success('Đã xóa tất cả liên hệ.');
          this.refreshList();
        } catch (error) {
          console.log(error);
          toast.error('Xóa thất bại. Vui lòng thử lại.');
        }
      }
    },
    goToAddContact() {
      this.$router.push({ name: 'contact.add' });
    },
  },
  mounted() {
    this.refreshList();
  },
};
</script>

<style scoped>
.page {
  text-align: left;
  max-width: 750px;
}
</style>
