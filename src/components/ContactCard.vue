<script>
export default {
  props: {
    contact: { type: Object, required: true },
  },
  computed: {
    fullAddress() {
      const parts = [
        this.contact.address,
        this.contact.ward_name,
        this.contact.province_name,
      ].filter(Boolean);
      return parts.join(', ') || '—';
    },
    avatarUrl() {
      if (this.contact.avatarBase64) return this.contact.avatarBase64;
      const name = encodeURIComponent(this.contact.name || '?');
      const color = this.getAvatarBgColor(this.contact.name);
      return `https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=200&bold=true`;
    },
  },
  methods: {
    getAvatarBgColor(name) {
      if (!name) return '6c757d';
      const colors = ['28a745', 'dc3545', 'ffc107', '6610f2', 'e83e8c', 'fd7e14', '6f42c1', '20c997'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    getGenderLabel(val) {
      const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
      return map[val] || val;
    },
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN');
    }
  },
};
</script>

<template>
  <div>
    <!-- Avatar -->
    <div class="text-center mb-4 mt-2">
      <img 
        :src="avatarUrl" 
        alt="Avatar" 
        class="rounded-circle"
        style="width: 100px; height: 100px; object-fit: cover; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
      />
    </div>

    <div class="p-1">
      <strong>Họ tên:</strong>
      {{ contact.name }}
    </div>
    <div class="p-1" v-if="contact.gender">
      <strong>Giới tính:</strong>
      {{ getGenderLabel(contact.gender) }}
    </div>
    <div class="p-1" v-if="contact.birthday">
      <strong>Ngày sinh:</strong>
      {{ formatDate(contact.birthday) }}
    </div>
    <div class="p-1">
      <strong>E-mail:</strong>
      {{ contact.email || '—' }}
    </div>
    <div class="p-1">
      <strong>Điện thoại:</strong>
      {{ contact.phone || '—' }}
    </div>
    <div class="p-1">
      <strong>Địa chỉ:</strong>
      {{ fullAddress }}
    </div>
    <div class="p-1" v-if="contact.notes">
      <strong>Ghi chú:</strong>
      <p class="mb-0 mt-1 text-muted" style="white-space: pre-wrap;">{{ contact.notes }}</p>
    </div>
    <div class="p-1 mt-2">
      <strong>Liên hệ yêu thích:&nbsp;</strong>
      <i v-if="contact.favorite" class="fa-solid fa-check text-success"></i>
      <i v-else class="fa-solid fa-times text-danger"></i>
    </div>
  </div>
</template>
