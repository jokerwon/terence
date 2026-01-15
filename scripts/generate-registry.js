#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateRegistry(componentName) {
  const componentDir = path.join(
    __dirname,
    '..',
    'packages',
    'components',
    componentName
  )

  try {
    await fs.access(componentDir)
  } catch {
    console.error(`Component directory not found: ${componentDir}`)
    process.exit(1)
  }

  const files = await fs.readdir(componentDir)
  const registryFiles = []

  for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue

    const filePath = path.join(componentDir, file)
    const content = await fs.readFile(filePath, 'utf-8')

    const fileType = file.includes('use-')
      ? 'hook'
      : file.includes('type')
      ? 'type'
      : file.includes('util')
      ? 'util'
      : 'component'

    registryFiles.push({
      path: `${componentName}/${file}`,
      type: fileType,
      content: content,
    })
  }

  const registryEntry = {
    name: componentName,
    description: `Description for ${componentName}`,
    type: 'component',
    dependencies: ['react'],
    registryDependencies: [],
    files: registryFiles,
  }

  const registryPath = path.join(
    __dirname,
    '..',
    'registry',
    `${componentName}.json`
  )

  await fs.writeFile(registryPath, JSON.stringify(registryEntry, null, 2))

  console.log(`✓ Generated registry file: ${registryPath}`)
  console.log('\nPlease update:')
  console.log('- description')
  console.log('- dependencies')
  console.log('- registryDependencies')
}

const componentName = process.argv[2]

if (!componentName) {
  console.error('Usage: node generate-registry.js <component-name>')
  process.exit(1)
}

generateRegistry(componentName).catch(console.error)
