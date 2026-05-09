import { expect, describe, it } from 'vitest'
import enLocale from '~/i18n/locales/en.json'
import arLocale from '~/i18n/locales/ar.json'

describe('Notification Event i18n Keys', () => {
  const eventTypes = [
    'report_submitted',
    'supervisor_approved',
    'supervisor_rejected',
    'client_approved',
    'client_rejected',
    'payment_released',
    'project_created',
  ]

  describe('English locale', () => {
    it('should have all 7 event notification title keys', () => {
      eventTypes.forEach(eventType => {
        const key = `notif.events.${eventType}.title`
        const title =
          enLocale.notif.events[eventType as keyof typeof enLocale.notif.events]
            ?.title
        expect(title, `Missing English title for ${eventType}`).toBeDefined()
        expect(
          title,
          `English title should not be empty for ${eventType}`
        ).toBeTruthy()
      })
    })

    it('should have specific English event titles', () => {
      expect(enLocale.notif.events.report_submitted.title).toBe(
        'Report Submitted'
      )
      expect(enLocale.notif.events.supervisor_approved.title).toBe(
        'Approved by Supervisor'
      )
      expect(enLocale.notif.events.supervisor_rejected.title).toBe(
        'Rejected by Supervisor'
      )
      expect(enLocale.notif.events.client_approved.title).toBe(
        'Approved by Client'
      )
      expect(enLocale.notif.events.client_rejected.title).toBe(
        'Rejected by Client'
      )
      expect(enLocale.notif.events.payment_released.title).toBe(
        'Payment Released'
      )
      expect(enLocale.notif.events.project_created.title).toBe(
        'New Project Created'
      )
    })
  })

  describe('Arabic locale', () => {
    it('should have all 7 event notification title keys', () => {
      eventTypes.forEach(eventType => {
        const title =
          arLocale.notif.events[eventType as keyof typeof arLocale.notif.events]
            ?.title
        expect(title, `Missing Arabic title for ${eventType}`).toBeDefined()
        expect(
          title,
          `Arabic title should not be empty for ${eventType}`
        ).toBeTruthy()
      })
    })

    it('should have non-empty Arabic translations for all events', () => {
      eventTypes.forEach(eventType => {
        const title =
          arLocale.notif.events[eventType as keyof typeof arLocale.notif.events]
            ?.title
        expect(
          title,
          `Arabic title should not be empty for ${eventType}`
        ).toBeTruthy()
      })
    })
  })

  describe('i18n structure', () => {
    it('should have matching keys between English and Arabic', () => {
      const enKeys = Object.keys(enLocale.notif.events)
      const arKeys = Object.keys(arLocale.notif.events)
      expect(arKeys).toEqual(enKeys)
    })
  })
})
