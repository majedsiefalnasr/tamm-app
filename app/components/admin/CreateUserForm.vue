<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createUserSchema, type CreateUserPayload } from '#shared/types/user'
import { useNotifications } from '~/composables/useNotifications'
import { useAdminUsers } from '../../composables/useAdminUsers'
import { useAuthStore } from '../../stores/auth'
import { Button } from '../ui/button'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface Emits {
  success: []
  cancel: []
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const auth = useAuthStore()
const { createUser, creating } = useAdminUsers()
const { notify } = useNotifications()

const { values, handleSubmit, errors, setFieldError, isSubmitting } =
  useForm<CreateUserPayload>({
    validationSchema: toTypedSchema(createUserSchema),
    initialValues: {
      name: '',
      email: '',
      role: undefined,
      phone: '',
    },
  })

const availableRoles = computed(() => {
  const roles = [
    { value: 'client', label: t('roles.client.label') },
    { value: 'contractor', label: t('roles.contractor.label') },
    { value: 'field_engineer', label: t('roles.field_engineer.label') },
    {
      value: 'supervisor_engineer',
      label: t('roles.supervisor_engineer.label'),
    },
  ]

  // Only super_admin can create admin users; safeguard against logout race
  if (auth.user && auth.user.role === 'super_admin') {
    roles.push({ value: 'admin', label: t('roles.admin.label') })
  }

  return roles
})

const onSubmit = handleSubmit(async formValues => {
  try {
    await createUser(formValues as CreateUserPayload)
    notify.success(t('errors.user_created'))
    emit('success')
  } catch (error: any) {
    if (error?.data?.error?.errors) {
      Object.entries(error.data.error.errors).forEach(([field, messages]) => {
        setFieldError(field, (messages as string[])[0])
      })
    } else {
      notify.error(t('errors.user_creation_failed'))
    }
  }
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <!-- Full Name -->
    <Field class="gap-1.5 space-y-1.5">
      <FieldLabel for="name" class="text-start">{{
        t('admin.users.create.full_name')
      }}</FieldLabel>
      <Input
        id="name"
        v-model="values.name"
        :placeholder="t('admin.users.create.full_name_placeholder')"
        :class="{ 'border-destructive': errors.name }"
      />
      <FieldError :errors="[errors.name]" class="text-xs" />
    </Field>

    <!-- Email -->
    <Field class="gap-1.5 space-y-1.5">
      <FieldLabel for="email" class="text-start">{{
        t('admin.users.create.email')
      }}</FieldLabel>
      <Input
        id="email"
        v-model="values.email"
        type="email"
        :placeholder="t('admin.users.create.email_placeholder')"
        :class="{ 'border-destructive': errors.email }"
      />
      <FieldError :errors="[errors.email]" class="text-xs" />
    </Field>

    <!-- Role -->
    <Field class="gap-1.5 space-y-1.5">
      <FieldLabel for="role" class="text-start">{{
        t('admin.users.create.role')
      }}</FieldLabel>
      <Select v-model="values.role">
        <SelectTrigger :class="{ 'border-destructive': errors.role }">
          <SelectValue
            :placeholder="t('admin.users.create.role_placeholder')"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="role in availableRoles"
            :key="role.value"
            :value="role.value"
          >
            {{ role.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <FieldError :errors="[errors.role]" class="text-xs" />
    </Field>

    <!-- Phone (Optional) - only show if user starts typing -->
    <Field v-if="values.phone" class="gap-1.5 space-y-1.5">
      <FieldLabel for="phone" class="text-start">{{
        t('admin.users.create.phone')
      }}</FieldLabel>
      <Input
        id="phone"
        v-model="values.phone"
        type="tel"
        :placeholder="t('admin.users.create.phone_placeholder')"
      />
    </Field>
    <!-- Show placeholder if phone is empty - allow user to add phone -->
    <div v-if="!values.phone" class="pt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="text-muted-foreground text-start"
        @click="values.phone = ''"
      >
        + {{ t('admin.users.create.phone') }}
      </Button>
    </div>

    <!-- Form Actions -->
    <div class="flex gap-3 pt-4">
      <Button
        type="button"
        variant="ghost"
        class="flex-1"
        :disabled="creating"
        @click="() => emit('cancel')"
      >
        {{ t('admin.users.create.cancel') }}
      </Button>
      <Button
        type="submit"
        class="flex-1"
        :disabled="creating"
        :loading="creating"
      >
        {{ t('admin.users.create.submit') }}
      </Button>
    </div>
  </form>
</template>
