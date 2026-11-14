import React from 'react'
import { createRoot } from 'react-dom/client'
import EvidencePredictionActivity from './EvidencePredictionActivity'
import { apollo15HammerFeatherPrediction } from '../../../features/storytelling/activities/apollo15Prediction'
import '../../../index.css'
import styles from './ActivityPreview.module.css'

const root = document.getElementById('activity-preview')
if (root) createRoot(root).render(<React.StrictMode><main className={styles.preview}>
  <header><p>AURORALYS · ISOLATED ACTIVITY PREVIEW</p><h1>Apollo 15 evidence lab</h1><p>Independent workstream preview. This page does not access your mission progress.</p></header>
  <EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />
</main></React.StrictMode>)
