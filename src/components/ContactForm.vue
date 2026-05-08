<template>
  <Form @submit="submitContact" :validation-schema="contactFormSchema">
    <div class="text-center mb-4 mt-2">
      <div
        class="contact-avatar mx-auto position-relative"
        :style="{ cursor: 'pointer' }"
        @click="triggerFileInput"
        title="Nhấn để đổi ảnh đại diện"
      >
        <img 
          :src="previewUrl || avatarUrl" 
          alt="Avatar" 
          class="w-100 h-100 rounded-circle" 
          style="object-fit: cover;"
        />
        <div class="avatar-overlay d-flex align-items-center justify-content-center">
          <i class="fas fa-camera"></i>
        </div>
      </div>
      <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="onFileChange" />
      <small class="text-muted d-block mt-2">Nhấn vào ảnh để đổi avatar</small>
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <label for="name">Tên</label>
          <Field name="name" type="text" class="form-control" v-model="contactLocal.name" placeholder="Ví dụ: Nguyễn Văn A" />
          <ErrorMessage name="name" class="error-feedback" />
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="phone">Điện thoại</label>
          <Field name="phone" type="tel" class="form-control" v-model="contactLocal.phone" placeholder="Ví dụ: 0912345678" />
          <ErrorMessage name="phone" class="error-feedback" />
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <label for="email">E-mail</label>
          <Field name="email" type="email" class="form-control" v-model="contactLocal.email" placeholder="Ví dụ: email@domain.com" />
          <ErrorMessage name="email" class="error-feedback" />
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="birthday">Ngày sinh</label>
          <Field name="birthday" type="date" class="form-control" v-model="contactLocal.birthday" />
          <ErrorMessage name="birthday" class="error-feedback" />
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <label for="provinceSearch">Tỉnh/Thành phố</label>
          <div class="position-relative" :class="{ 'is-loading': isLoadingProvinces }">
            <input 
              type="text" 
              class="form-control pr-4" 
              v-model="provinceSearchText" 
              @focus="showProvinceDropdown = true; $event.target.select()"
              @blur="handleProvinceBlur"
              :disabled="isLoadingProvinces"
              placeholder="Nhập để tìm kiếm..."
              autocomplete="off"
            />
            <i class="fas fa-chevron-down position-absolute text-muted" style="right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;"></i>
            
            <div v-show="showProvinceDropdown" class="custom-dropdown border rounded bg-white position-absolute w-100 shadow-sm" style="z-index: 1000; max-height: 200px; overflow-y: auto; top: calc(100% + 4px);">
              <div v-if="filteredProvinces.length === 0" class="p-2 text-muted text-center small">Không tìm thấy</div>
              <div 
                v-else
                v-for="province in filteredProvinces" 
                :key="province.code" 
                class="custom-option px-3 py-2" 
                @mousedown.prevent="selectProvince(province)"
              >
                {{ province.name }}
              </div>
            </div>
            <Field name="province_code" type="hidden" v-model="contactLocal.province_code" />
          </div>
          <ErrorMessage name="province_code" class="error-feedback" />
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="wardSearch">Phường/Xã</label>
          <div class="position-relative" :class="{ 'is-loading': isLoadingWards, 'is-disabled': !contactLocal.province_code }">
            <input 
              type="text" 
              class="form-control pr-4" 
              v-model="wardSearchText" 
              @focus="showWardDropdown = true; $event.target.select()"
              @blur="handleWardBlur"
              :disabled="!contactLocal.province_code || isLoadingWards"
              :placeholder="!contactLocal.province_code ? 'Vui lòng chọn tỉnh trước' : 'Nhập để tìm kiếm...'"
              autocomplete="off"
            />
            <i class="fas fa-chevron-down position-absolute text-muted" style="right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;"></i>
            
            <div v-show="showWardDropdown" class="custom-dropdown border rounded bg-white position-absolute w-100 shadow-sm" style="z-index: 1000; max-height: 200px; overflow-y: auto; top: calc(100% + 4px);">
              <div v-if="filteredWards.length === 0" class="p-2 text-muted text-center small">Không tìm thấy</div>
              <div 
                v-else
                v-for="ward in filteredWards" 
                :key="ward.code" 
                class="custom-option px-3 py-2" 
                @mousedown.prevent="selectWard(ward)"
              >
                {{ ward.name }}
              </div>
            </div>
            <Field name="ward_code" type="hidden" v-model="contactLocal.ward_code" />
          </div>
          <ErrorMessage name="ward_code" class="error-feedback" />
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="address">Địa chỉ chi tiết</label>
      <Field name="address" type="text" class="form-control" v-model="contactLocal.address" placeholder="Ví dụ: Số nhà, Tên đường, Ấp/Khóm..." />
      <ErrorMessage name="address" class="error-feedback" />
    </div>

    <div class="form-group">
      <label for="notes">Ghi chú</label>
      <Field
        as="textarea"
        name="notes"
        class="form-control"
        v-model="contactLocal.notes"
        rows="2"
        placeholder="Thông tin thêm..."
      />
      <ErrorMessage name="notes" class="error-feedback" />
    </div>

    <div class="form-group mb-3">
      <label class="d-block mb-2">Giới tính</label>
      <div class="d-flex">
        <div class="form-check form-check-inline" v-for="option in genderOptions" :key="option.value">
          <Field
            class="form-check-input"
            type="radio"
            name="gender"
            :id="'contactGender_' + option.value"
            :value="option.value"
            v-model="contactLocal.gender"
          />
          <label class="form-check-label" :for="'contactGender_' + option.value">
            {{ option.label }}
          </label>
        </div>
      </div>
      <ErrorMessage name="gender" class="error-feedback" />
    </div>

    <div class="form-group mb-4">
      <div class="form-check mb-2">
        <Field
          name="favorite"
          type="checkbox"
          id="favorite"
          class="form-check-input"
          :value="true"
          :unchecked-value="false"
          v-model="contactLocal.favorite"
        />
        <label for="favorite" class="form-check-label">
          <strong><i class="fas fa-star text-warning"></i> Liên hệ yêu thích</strong>
        </label>
      </div>
    </div>

    <div class="form-group action-row">
      <button class="btn btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="btn-spinner"></span>
        <span>{{ isSubmitting ? 'Đang lưu...' : 'Lưu' }}</span>
      </button>
      <button
        v-if="contactLocal._id"
        type="button"
        class="ml-2 btn btn-danger"
        :disabled="isSubmitting"
        @click="deleteContact"
      >
        Xóa
      </button>
      <button type="button" class="ml-2 btn btn-secondary" :disabled="isSubmitting" @click="Cancel">Thoát</button>
    </div>
  </Form>
</template>

<script>
import * as yup from 'yup';
import { Form, Field, ErrorMessage } from 'vee-validate';

const apiCache = {
  provinces: null,
  wards: {},
};

export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  emits: ['submit:contact', 'delete:contact'],
  props: {
    contact: { type: Object, required: true },
  },
  data() {
    const contactFormSchema = yup.object().shape({
      name: yup
        .string()
        .trim()
        .required('Tên phải có giá trị.')
        .min(2, 'Tên phải ít nhất 2 ký tự.')
        .max(50, 'Tên có nhiều nhất 50 ký tự.'),
      email: yup
        .string()
        .trim()
        .required('E-mail phải có giá trị.')
        .email('E-mail không đúng định dạng.')
        .max(50, 'E-mail tối đa 50 ký tự.'),
      phone: yup
        .string()
        .required('Số điện thoại phải có giá trị.')
        .matches(/^(09|03|07|08|05)[0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678).'),
      address: yup
        .string()
        .trim()
        .required('Địa chỉ chi tiết phải có giá trị.')
        .max(200, 'Địa chỉ tối đa 200 ký tự.'),
      birthday: yup
        .string()
        .required('Ngày sinh phải có giá trị.')
        .test('not-future', 'Ngày sinh không được vượt quá ngày hiện tại.', (value) => {
          if (!value) return true;
          return new Date(value) <= new Date();
        })
        .test('not-too-old', 'Ngày sinh không hợp lệ.', (value) => {
          if (!value) return true;
          return new Date(value) >= new Date('1900-01-01');
        }),
      notes: yup
        .string()
        .trim()
        .max(500, 'Ghi chú tối đa 500 ký tự.'),
      gender: yup
        .string()
        .required('Vui lòng chọn giới tính.')
        .oneOf(['male', 'female', 'other'], 'Giới tính không hợp lệ.'),
      province_code: yup
        .string()
        .required('Vui lòng chọn Tỉnh/Thành phố.'),
      ward_code: yup
        .string()
        .required('Vui lòng chọn Phường/Xã.'),
    });

    return {
      contactLocal: {
        province_code: '',
        ward_code: '',
        gender: '',
        birthday: '',
        notes: '',
        avatarBase64: '',
        ...this.contact,
        province_code: this.contact.province_code ? String(this.contact.province_code) : '',
        ward_code: this.contact.ward_code ? String(this.contact.ward_code) : '',
        birthday: this.contact.birthday ? String(this.contact.birthday).split('T')[0] : '',
      },
      genderOptions: [
        { value: 'male', label: 'Nam' },
        { value: 'female', label: 'Nữ' },
        { value: 'other', label: 'Khác' },
      ],
      contactFormSchema,
      provinces: [],
      wards: [],
      isLoadingProvinces: false,
      isLoadingWards: false,
      isSubmitting: false,
      previewUrl: null,
      provinceSearchText: '',
      wardSearchText: '',
      showProvinceDropdown: false,
      showWardDropdown: false,
    };
  },
  computed: {
    filteredProvinces() {
      if (!this.provinceSearchText) return this.provinces;
      const lower = this.provinceSearchText.toLowerCase();
      return this.provinces.filter((p) => p.name.toLowerCase().includes(lower));
    },
    filteredWards() {
      if (!this.wardSearchText) return this.wards;
      const lower = this.wardSearchText.toLowerCase();
      return this.wards.filter((w) => w.name.toLowerCase().includes(lower));
    },
    avatarUrl() {
      const name = encodeURIComponent(this.contactLocal.name || '?');
      const color = this.avatarBgColor;
      return `https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=128&bold=true`;
    },
    avatarBgColor() {
      if (!this.contactLocal.name) return '6c757d';
      const colors = ['28a745', 'dc3545', 'ffc107', '6610f2', 'e83e8c', 'fd7e14', '6f42c1', '20c997'];
      let hash = 0;
      for (let i = 0; i < this.contactLocal.name.length; i++) {
        hash = this.contactLocal.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
  },
  async created() {
    if (this.contactLocal.avatarBase64) {
      this.previewUrl = this.contactLocal.avatarBase64;
    }
    await this.fetchProvinces();
    if (this.contactLocal.province_code) {
      const p = this.provinces.find(x => String(x.code) === String(this.contactLocal.province_code));
      if (p) this.provinceSearchText = p.name;

      await this.fetchWards(this.contactLocal.province_code);
      if (this.contactLocal.ward_code) {
        const w = this.wards.find(x => String(x.code) === String(this.contactLocal.ward_code));
        if (w) this.wardSearchText = w.name;
      }
    }
  },
  methods: {
    async fetchProvinces() {
      if (apiCache.provinces) {
        this.provinces = apiCache.provinces;
        return;
      }
      this.isLoadingProvinces = true;
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        const data = await response.json();
        this.provinces = data;
        apiCache.provinces = data;
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
      } finally {
        this.isLoadingProvinces = false;
      }
    },
    async fetchWards(provinceCode) {
      if (apiCache.wards[provinceCode]) {
        this.wards = apiCache.wards[provinceCode];
        return;
      }
      this.isLoadingWards = true;
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
        const data = await response.json();
        this.wards = data.wards || [];
        apiCache.wards[provinceCode] = this.wards;
      } catch (error) {
        console.error('Lỗi khi tải danh sách phường/xã:', error);
      } finally {
        this.isLoadingWards = false;
      }
    },
    selectProvince(p) {
      this.contactLocal.province_code = p.code;
      this.provinceSearchText = p.name;
      this.showProvinceDropdown = false;
      this.contactLocal.ward_code = '';
      this.wardSearchText = '';
      this.wards = [];
      this.fetchWards(p.code);
    },
    handleProvinceBlur() {
      this.showProvinceDropdown = false;
      const matched = this.provinces.find((p) => String(p.code) === String(this.contactLocal.province_code));
      if (matched) {
        this.provinceSearchText = matched.name;
      } else {
        this.provinceSearchText = '';
        this.contactLocal.province_code = '';
      }
    },
    selectWard(w) {
      this.contactLocal.ward_code = w.code;
      this.wardSearchText = w.name;
      this.showWardDropdown = false;
    },
    handleWardBlur() {
      this.showWardDropdown = false;
      const matched = this.wards.find((w) => String(w.code) === String(this.contactLocal.ward_code));
      if (matched) {
        this.wardSearchText = matched.name;
      } else {
        this.wardSearchText = '';
        this.contactLocal.ward_code = '';
      }
    },
    buildPayload() {
      const { name, email, phone, favorite, address, province_code, ward_code, gender, birthday, notes, avatarBase64 } = this.contactLocal;

      const selectedProvince = this.provinces.find((p) => p.code == province_code);
      const selectedWard = this.wards.find((w) => w.code == ward_code);

      return {
        name,
        email,
        phone,
        favorite,
        address: address?.trim() || '',
        gender: gender || null,
        birthday: birthday || null,
        notes: notes?.trim() || '',
        avatarBase64: avatarBase64 || null,
        province_code: selectedProvince?.code ?? null,
        province_name: selectedProvince?.name ?? null,
        ward_code: selectedWard?.code ?? null,
        ward_name: selectedWard?.name ?? null,
      };
    },
    submitContact() {
      this.isSubmitting = true;
      this.$emit('submit:contact', this.buildPayload(), (error) => {
        this.isSubmitting = false;
      });
    },
    deleteContact() {
      this.$emit('delete:contact', this.contactLocal._id);
    },
    Cancel() {
      const reply = window.confirm('You have unsaved changes! Do you want to leave?');
      if (!reply) {
        return false;
      } else {
        this.$router.push({ name: 'contactbook' });
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.previewUrl = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.contactLocal.avatarBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style scoped>
@import '@/assets/form.css';

.contact-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  user-select: none;
  overflow: hidden;
}
.contact-avatar:hover {
  transform: scale(1.05);
}
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 50%;
}
.contact-avatar:hover .avatar-overlay {
  opacity: 1;
}

.form-check-label {
  display: inline-block !important;
  margin-top: 0 !important;
  cursor: pointer;
}

.custom-dropdown {
  scrollbar-width: thin;
}
.custom-dropdown::-webkit-scrollbar {
  width: 6px;
}
.custom-dropdown::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
.custom-option {
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.95rem;
}
.custom-option:hover {
  background-color: #f1f8ff;
  color: #007bff;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-spinner {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

.select-wrapper {
  position: relative;
  display: block;
}

.select-wrapper .custom-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.5rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.select-wrapper.is-loading .custom-select,
.select-wrapper.is-disabled .custom-select {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.custom-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
