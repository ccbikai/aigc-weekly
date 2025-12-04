import type { CloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import { zh } from '@payloadcms/translations/languages/zh'
import { buildConfig } from 'payload'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Weekly } from './collections/Weekly'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isCLI = process.argv.some(value => value.match(/^(generate|migrate):?/))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare = isCLI || !isProduction
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Weekly, Media],
  editor: lexicalEditor(),
  i18n: {
    supportedLanguages: { zh },
    fallbackLanguage: 'zh',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    readReplicas: 'first-primary',
  }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    mcpPlugin({
      collections: {
        weekly: {
          enabled: true,
        },
      },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
async function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  const { getPlatformProxy } = await import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`)
  console.info('Getting Cloudflare context from Wrangler bindings', {
    environment: process.env.CLOUDFLARE_ENV,
    remoteBindings: isProduction,
  })
  return getPlatformProxy({
    environment: process.env.CLOUDFLARE_ENV,
    remoteBindings: isProduction,
  } satisfies GetPlatformProxyOptions)
}
