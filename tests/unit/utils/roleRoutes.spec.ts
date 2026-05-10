import { describe, it, expect } from 'vitest'
import {
  getHomePageForRole,
  isAdminRole,
  getDisplayNameForRole,
} from '../../../app/utils/roleRoutes'

describe('roleRoutes utilities', () => {
  describe('getHomePageForRole', () => {
    it('returns /dashboard for every known role', () => {
      for (const role of [
        'client',
        'contractor',
        'field_engineer',
        'supervisor_engineer',
        'admin',
        'super_admin',
      ]) {
        expect(getHomePageForRole(role)).toBe('/dashboard')
      }
    })

    it('returns /dashboard for unknown role', () => {
      expect(getHomePageForRole('unknown')).toBe('/dashboard')
    })

    it('returns /dashboard for empty string', () => {
      expect(getHomePageForRole('')).toBe('/dashboard')
    })
  })

  describe('isAdminRole', () => {
    it('returns true for admin', () => {
      expect(isAdminRole('admin')).toBe(true)
    })

    it('returns true for super_admin', () => {
      expect(isAdminRole('super_admin')).toBe(true)
    })

    it('returns false for client', () => {
      expect(isAdminRole('client')).toBe(false)
    })

    it('returns false for contractor', () => {
      expect(isAdminRole('contractor')).toBe(false)
    })

    it('returns false for field_engineer', () => {
      expect(isAdminRole('field_engineer')).toBe(false)
    })

    it('returns false for supervisor_engineer', () => {
      expect(isAdminRole('supervisor_engineer')).toBe(false)
    })

    it('returns false for unknown role', () => {
      expect(isAdminRole('unknown')).toBe(false)
    })
  })

  describe('getDisplayNameForRole', () => {
    it('returns i18n key for client', () => {
      expect(getDisplayNameForRole('client')).toBe('roles.client.label')
    })

    it('returns i18n key for contractor', () => {
      expect(getDisplayNameForRole('contractor')).toBe('roles.contractor.label')
    })

    it('returns i18n key for field_engineer', () => {
      expect(getDisplayNameForRole('field_engineer')).toBe(
        'roles.field_engineer.label'
      )
    })

    it('returns i18n key for supervisor_engineer', () => {
      expect(getDisplayNameForRole('supervisor_engineer')).toBe(
        'roles.supervisor_engineer.label'
      )
    })

    it('returns i18n key for admin', () => {
      expect(getDisplayNameForRole('admin')).toBe('roles.admin.label')
    })

    it('returns i18n key for super_admin', () => {
      expect(getDisplayNameForRole('super_admin')).toBe(
        'roles.super_admin.label'
      )
    })

    it('returns roles.unknown.label for unknown role', () => {
      expect(getDisplayNameForRole('unknown')).toBe('roles.unknown.label')
    })
  })
})
