import { describe, it, expect } from 'vitest'
import {
  getHomePageForRole,
  isAdminRole,
  getDisplayNameForRole,
} from '../../../app/utils/roleRoutes'

describe('roleRoutes utilities', () => {
  describe('getHomePageForRole', () => {
    it('returns /projects for client', () => {
      expect(getHomePageForRole('client')).toBe('/projects')
    })

    it('returns /projects for contractor', () => {
      expect(getHomePageForRole('contractor')).toBe('/projects')
    })

    it('returns /assignments for field_engineer', () => {
      expect(getHomePageForRole('field_engineer')).toBe('/assignments')
    })

    it('returns /reviews for supervisor_engineer', () => {
      expect(getHomePageForRole('supervisor_engineer')).toBe('/reviews')
    })

    it('returns /admin/dashboard for admin', () => {
      expect(getHomePageForRole('admin')).toBe('/admin/dashboard')
    })

    it('returns /admin/dashboard for super_admin', () => {
      expect(getHomePageForRole('super_admin')).toBe('/admin/dashboard')
    })

    it('returns /projects for unknown role', () => {
      expect(getHomePageForRole('unknown')).toBe('/projects')
    })

    it('returns /projects for empty string', () => {
      expect(getHomePageForRole('')).toBe('/projects')
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
      expect(getDisplayNameForRole('client')).toBe('roles.client')
    })

    it('returns i18n key for contractor', () => {
      expect(getDisplayNameForRole('contractor')).toBe('roles.contractor')
    })

    it('returns i18n key for field_engineer', () => {
      expect(getDisplayNameForRole('field_engineer')).toBe(
        'roles.field_engineer'
      )
    })

    it('returns i18n key for supervisor_engineer', () => {
      expect(getDisplayNameForRole('supervisor_engineer')).toBe(
        'roles.supervisor_engineer'
      )
    })

    it('returns i18n key for admin', () => {
      expect(getDisplayNameForRole('admin')).toBe('roles.admin')
    })

    it('returns i18n key for super_admin', () => {
      expect(getDisplayNameForRole('super_admin')).toBe('roles.super_admin')
    })

    it('returns roles.unknown for unknown role', () => {
      expect(getDisplayNameForRole('unknown')).toBe('roles.unknown')
    })
  })
})
