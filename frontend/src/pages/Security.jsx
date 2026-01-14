import React, { useEffect, useState } from 'react'
import { authAPI, usersAPI } from '../services/api'

export default function Security() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState(null)
  const [token, setToken] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableToken, setDisableToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    try {
      const res = await usersAPI.getMe()
      setUser(res.data)
    } catch (err) {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const startSetup = async () => {
    setError('')
    setSuccess('')
    try {
      const res = await authAPI.setupMFA()
      setSetupData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start MFA setup')
    }
  }

  const enableMfa = async () => {
    setError('')
    setSuccess('')
    if (!token.trim()) {
      setError('Enter the MFA code from your authenticator app.')
      return
    }
    try {
      await authAPI.enableMFA(token.trim())
      setSuccess('MFA enabled successfully.')
      setSetupData(null)
      setToken('')
      await loadUser()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enable MFA')
    }
  }

  const disableMfa = async () => {
    setError('')
    setSuccess('')
    if (!disablePassword.trim() || !disableToken.trim()) {
      setError('Password and MFA code are required to disable MFA.')
      return
    }
    try {
      await authAPI.disableMFA(disablePassword.trim(), disableToken.trim())
      setSuccess('MFA disabled successfully.')
      setDisablePassword('')
      setDisableToken('')
      await loadUser()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable MFA')
    }
  }

  if (loading) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-base-100 p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-2">Security Settings</h2>
        <p className="text-gray-500">Manage multi-factor authentication for your account.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      <div className="bg-base-100 p-6 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Multi-Factor Authentication</h3>
            <p className="text-gray-500 text-sm">
              Status: {user?.mfa_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          {!user?.mfa_enabled && (
            <button className="btn btn-primary" onClick={startSetup}>
              Start MFA Setup
            </button>
          )}
        </div>

        {setupData && (
          <div className="space-y-4">
            <div className="bg-base-200 p-4 rounded">
              <p className="font-semibold mb-2">Scan this QR code:</p>
              <img src={setupData.qrCode} alt="MFA QR Code" className="max-w-xs border rounded" />
              <p className="text-sm text-gray-500 mt-2">
                Secret (manual entry): <span className="font-mono">{setupData.secret}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Enter 6-digit MFA code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button className="btn btn-primary" onClick={enableMfa}>
                Enable MFA
              </button>
            </div>
          </div>
        )}

        {user?.mfa_enabled && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Disable MFA (requires password and current MFA code).</p>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Current password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Current MFA code"
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value)}
            />
            <button className="btn btn-outline btn-error" onClick={disableMfa}>
              Disable MFA
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
