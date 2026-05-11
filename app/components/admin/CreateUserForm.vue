<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createUserSchema, type CreateUserPayload } from '#shared/types/user'
import { useNotifications } from '~/composables/useNotifications'
import { useAdminUsers } from '../../composables/useAdminUsers'
import { useAuthStore } from '../../stores/auth'
import type { User } from '../../composables/useAdminUsers'
import { Button } from '../ui/button'
import { DialogClose, DialogFooter } from '../ui/dialog'
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

const props = defineProps<{
  user?: User | null
}>()

const emit = defineEmits<Emits>()

const { t } = useI18n()
const auth = useAuthStore()
const { createUser, updateUser, creating } = useAdminUsers()
const { notify } = useNotifications()

const { values, handleSubmit, errors, setFieldError, submitCount, resetForm } =
  useForm<CreateUserPayload>({
    validationSchema: toTypedSchema(createUserSchema),
    validateOnMount: false,
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
    if (props.user?.id) {
      await updateUser(props.user.id, formValues as CreateUserPayload)
      notify.success(t('errors.user_updated'))
    } else {
      await createUser(formValues as CreateUserPayload)
      notify.success(t('errors.user_created'))
    }
    emit('success')
  } catch (error: any) {
    if (error?.data?.error?.errors) {
      const allowedFields: Array<keyof CreateUserPayload> = [
        'name',
        'email',
        'role',
        'phone',
      ]
      Object.entries(error.data.error.errors).forEach(([field, messages]) => {
        if (allowedFields.includes(field as keyof CreateUserPayload)) {
          setFieldError(
            field as keyof CreateUserPayload,
            (messages as string[])[0]
          )
        }
      })
    } else {
      notify.error(
        props.user?.id
          ? t('errors.user_update_failed')
          : t('errors.user_creation_failed')
      )
    }
  }
})

watch(
  () => props.user,
  user => {
    if (user) {
      resetForm({
        values: {
          name: user.name,
          email: user.email,
          role: user.role as CreateUserPayload['role'],
          phone: user.phone ?? '',
        },
      })
      return
    }

    resetForm({
      values: {
        name: '',
        email: '',
        role: undefined,
        phone: '',
      },
    })
  },
  { immediate: true }
)
</script>

<template>
  <form class="grid gap-4 py-1" @submit="onSubmit">
    <!-- Full Name -->
    <Field class="grid gap-2">
      <FieldLabel for="name" class="text-start">{{
        t('admin.users.create.full_name')
      }}</FieldLabel>
      <Input
        id="name"
        v-model="values.name"
        :placeholder="t('admin.users.create.full_name_placeholder')"
        :class="{ 'border-destructive': submitCount > 0 && errors.name }"
      />
      <FieldError
        :errors="submitCount > 0 ? [errors.name] : []"
        class="text-xs"
      />
    </Field>

    <!-- Email -->
    <Field class="grid gap-2">
      <FieldLabel for="email" class="text-start">{{
        t('admin.users.create.email')
      }}</FieldLabel>
      <Input
        id="email"
        v-model="values.email"
        type="email"
        :placeholder="t('admin.users.create.email_placeholder')"
        :class="{ 'border-destructive': submitCount > 0 && errors.email }"
      />
      <FieldError
        :errors="submitCount > 0 ? [errors.email] : []"
        class="text-xs"
      />
    </Field>

    <!-- Role -->
    <Field class="grid gap-2">
      <FieldLabel for="role" class="text-start">{{
        t('admin.users.create.role')
      }}</FieldLabel>
      <Select v-model="values.role">
        <SelectTrigger
          :class="{ 'border-destructive': submitCount > 0 && errors.role }"
        >
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
      <FieldError
        :errors="submitCount > 0 ? [errors.role] : []"
        class="text-xs"
      />
    </Field>

    <!-- Phone (Optional) -->
    <Field class="grid gap-2">
      <FieldLabel for="phone" class="text-start">{{
        t('admin.users.create.phone')
      }}</FieldLabel>
      <Input
        id="phone"
        :model-value="values.phone ?? ''"
        type="tel"
        :placeholder="t('admin.users.create.phone_placeholder')"
        @update:model-value="values.phone = String($event)"
      />
    </Field>

    <DialogFooter class="mt-2 gap-2">
      <DialogClose as-child>
        <Button
          type="button"
          variant="outline"
          :disabled="creating"
          @click="() => emit('cancel')"
        >
          {{ t('admin.users.create.cancel') }}
        </Button>
      </DialogClose>
      <Button type="submit" :disabled="creating" :loading="creating">
        {{
          props.user?.id ? t('common.confirm') : t('admin.users.create.submit')
        }}
      </Button>
    </DialogFooter>
  </form>
</template>
