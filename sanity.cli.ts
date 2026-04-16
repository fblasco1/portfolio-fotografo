/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

// Next.js carga `.env.local` automáticamente, pero el CLI de Sanity NO.
// Cargamos `.env.local` (y `.env`) para que `sanity deploy`, etc. vean las variables.
import {config as loadDotEnv} from 'dotenv'

loadDotEnv({path: '.env.local'})
loadDotEnv({path: '.env'})

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage)
  return v
}

const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)'
)

const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: SANITY_STUDIO_DATASET (or NEXT_PUBLIC_SANITY_DATASET)'
)

export default defineCliConfig({api: {projectId, dataset}})
