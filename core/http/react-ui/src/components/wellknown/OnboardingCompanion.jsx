/* eslint-disable no-unused-vars -- JSX components look unused to this config */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Dialog from '../Dialog'
import { Button } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { ONBOARDING_FLAG, onboardingDone, markOnboardingDone } from '../../utils/onboarding'
import './onboarding.css'

// The companion is a three-step welcome, shown once per browser. It points at
// real routes rather than teaching from the outside — pick a model, start a
// chat, add a skill — and offers a seeded prompt that hands the rest of the
// walkthrough to the in-app assistant, which already knows the admin surface.

// Admin routes on which the companion stays out of the way. Admins explore the
// shell on their own; the walkthrough is for a fresh user on the chat surface.
const BUSY_PATH = /^\/app\/(admin|operate|setup)(\/|$)/

export default function OnboardingCompanion() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth() || {}
  const [dismissed, setDismissed] = useState(onboardingDone)

  const open = useMemo(() => {
    if (dismissed) return false
    if (loading) return false
    if (BUSY_PATH.test(location.pathname)) return false
    return true
  }, [dismissed, loading, location.pathname])

  // A second tab that dismisses it shouldn't leave this tab still showing it.
  // A resetOnboarding() call elsewhere dispatches a storage event with newValue
  // null — that reopens the companion without a reload.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== ONBOARDING_FLAG) return
      if (e.newValue === '1') setDismissed(true)
      else if (e.newValue == null) setDismissed(false)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!open) return null

  const dismiss = () => { markOnboardingDone(); setDismissed(true) }

  const steps = [
    {
      key: 'model',
      icon: 'cpu',
      title: t('onboarding.step1.title', 'Install a model'),
      body: t('onboarding.step1.body', 'Pick a small open model from the gallery. It runs on your own hardware — no API key, no tokens billed.'),
      action: { label: t('onboarding.step1.action', 'Open the gallery'), to: '/app/models' }
    },
    {
      key: 'chat',
      icon: 'chat',
      title: t('onboarding.step2.title', 'Start a chat'),
      body: t('onboarding.step2.body', 'Chat with any installed model. Attach files, mount MCP tools, and keep conversations in a project.'),
      action: { label: t('onboarding.step2.action', 'Open chats'), to: '/app/chats' }
    },
    {
      key: 'skill',
      icon: 'sparkles',
      title: t('onboarding.step3.title', 'Add skills and add-ons'),
      body: t('onboarding.step3.body', 'Admin-installed add-ons give the assistant Office, Sandbox, Tables and more. Skills are reusable prompt + tool bundles.'),
      action: { label: t('onboarding.step3.action', 'Browse add-ons'), to: '/app/addons?tab=browse' }
    }
  ]

  const askAssistant = () => {
    markOnboardingDone()
    setDismissed(true)
    // The chat page accepts a seeded prompt via location state. If a given
    // build hasn't wired the seed, the user still lands in a new chat.
    // Chat.jsx seeds the composer from location.state.start.
    navigate('/app/chats', { state: { newChat: true, start: t('onboarding.assistantSeed', 'Walk me through setting up LocalAI step by step: pick a first model, show me how to chat with it, and point me at the three add-ons that matter most.') } })
  }

  const welcomeName = user?.name ? t('onboarding.helloName', { name: user.name, defaultValue: 'Hello, {{name}}' }) : t('onboarding.hello', 'Welcome')

  return (
    <Dialog
      ariaLabel={t('onboarding.title', 'Welcome to LocalAI')}
      closable
      onClose={dismiss}
      bodyClass="lai-onb__body"
      className="lai-onb"
    >
      <div className="lai-onb__head">
        <p className="lai-onb__hello">{welcomeName}</p>
        <h2 className="lai-onb__title">{t('onboarding.title', 'Welcome to LocalAI')}</h2>
        <p className="lai-onb__lead">{t('onboarding.lead', 'Three short steps to get real value on your own hardware. Close this to explore on your own — or let the assistant walk you through it.')}</p>
      </div>
      <ol className="lai-onb__steps" aria-label={t('onboarding.stepsLabel', 'Getting started')}>
        {steps.map((s, i) => (
          <li key={s.key} className="lai-onb__step">
            <span className="lai-onb__num" aria-hidden="true">{i + 1}</span>
            <div className="lai-onb__text">
              <h3 className="lai-onb__step-title">{s.title}</h3>
              <p className="lai-onb__step-body">{s.body}</p>
            </div>
            <Button variant="ghost" size="sm" to={s.action.to} onClick={dismiss}>{s.action.label}</Button>
          </li>
        ))}
      </ol>
      <div className="lai-onb__foot">
        <Button variant="ghost" onClick={dismiss}>{t('onboarding.dismiss', 'I\'ll explore on my own')}</Button>
        <Button variant="primary" icon="sparkles" onClick={askAssistant} data-autofocus>{t('onboarding.ask', 'Let the assistant guide me')}</Button>
      </div>
    </Dialog>
  )
}
