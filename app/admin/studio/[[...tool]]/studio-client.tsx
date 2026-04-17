'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioClient() {
  return (
    <div className="min-h-0 flex-1">
      <NextStudio config={config} />
    </div>
  )
}

