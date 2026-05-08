<script>
export default {
  props: {
    contacts: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: -1 },
  },
  emits: ['update:activeIndex'],
  methods: {
    updateActiveIndex(index) {
      this.$emit('update:activeIndex', index);
    },
    getAvatarUrl(contact) {
      if (contact.avatarBase64) return contact.avatarBase64;
      const name = encodeURIComponent(contact.name || '?');
      const color = this.getAvatarBgColor(contact.name);
      return `https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=90&bold=true`;
    },
    getAvatarBgColor(name) {
      if (!name) return '6c757d';
      const colors = ['28a745', 'dc3545', 'ffc107', '6610f2', 'e83e8c', 'fd7e14', '6f42c1', '20c997'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
  },
};
</script>

<template>
  <ul class="list-group">
    <li
      class="list-group-item d-flex align-items-center"
      v-for="(contact, index) in contacts"
      :key="contact._id"
      :class="{ active: index === activeIndex }"
      @click="updateActiveIndex(index)"
      style="cursor: pointer"
    >
      <img 
        :src="getAvatarUrl(contact)" 
        alt="Avatar" 
        class="mr-3 flex-shrink-0 rounded-circle"
        style="width: 45px; height: 45px; object-fit: cover;"
      />
      <div>
        <div class="font-weight-bold" style="font-size: 1.1rem;">{{ contact.name }}</div>
        <small :class="index === activeIndex ? 'text-white-50' : 'text-muted'">
          <i class="fas fa-phone-alt mr-1"></i>{{ contact.phone || '—' }}
        </small>
      </div>
    </li>
  </ul>
</template>
