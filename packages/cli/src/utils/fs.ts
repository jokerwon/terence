import fs from 'fs-extra'
import path from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content, 'utf-8')
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8')
}

export async function copyFile(source: string, destination: string): Promise<void> {
  await ensureDir(path.dirname(destination))
  await fs.copyFile(source, destination)
}

export function resolveProjectPath(...segments: string[]): string {
  return path.resolve(process.cwd(), ...segments)
}

export async function detectPackageManager(): Promise<'npm' | 'pnpm' | 'yarn'> {
  const cwd = process.cwd()
  
  if (await fileExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }
  
  if (await fileExists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn'
  }
  
  return 'npm'
}

export async function installDependencies(dependencies: string[]): Promise<void> {
  if (dependencies.length === 0) return

  const packageManager = await detectPackageManager()
  
  let command: string
  switch (packageManager) {
    case 'pnpm':
      command = `pnpm add ${dependencies.join(' ')}`
      break
    case 'yarn':
      command = `yarn add ${dependencies.join(' ')}`
      break
    default:
      command = `npm install ${dependencies.join(' ')}`
  }

  await execAsync(command, { cwd: process.cwd() })
}

export async function readPackageJson(): Promise<any> {
  const packageJsonPath = resolveProjectPath('package.json')
  if (!(await fileExists(packageJsonPath))) {
    throw new Error('package.json not found in current directory')
  }
  const content = await readFile(packageJsonPath)
  return JSON.parse(content)
}
