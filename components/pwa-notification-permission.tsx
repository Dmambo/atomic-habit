'use client'
import { useEffect, useState } from "react"

export default function PwaNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission as NotificationPermission : 'default')

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  if (typeof window === 'undefined' || !('Notification' in window) || permission === 'granted') return null

  return (
    permission !== 'default' && permission !== 'denied' ? null : (
      <div style={{position: 'fixed', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000}}>
        <div style={{background: '#fffbe6', color: '#222', padding: '1rem 2rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 16}}>
          <span>Notifications: <b>{permission}</b></span>
          {permission === 'default' && (
            <button onClick={requestPermission} style={{background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600}}>Enable Notifications</button>
          )}
          {permission === 'denied' && <span style={{color: 'red'}}>You have blocked notifications.</span>}
        </div>
      </div>
    )
  )
} 