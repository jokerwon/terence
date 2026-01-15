import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => boolean | Promise<boolean>
}

export interface FormWizardProps {
  steps: WizardStep[]
  onComplete: (data?: any) => void | Promise<void>
  onStepChange?: (stepIndex: number) => void
  className?: string
  showStepIndicator?: boolean
}

export function FormWizard({
  steps,
  onComplete,
  onStepChange,
  className,
  showStepIndicator = true,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isValidating, setIsValidating] = React.useState(false)

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    if (currentStepData.validate) {
      setIsValidating(true)
      try {
        const isValid = await currentStepData.validate()
        if (!isValid) {
          setIsValidating(false)
          return
        }
      } catch (error) {
        console.error('Validation error:', error)
        setIsValidating(false)
        return
      }
      setIsValidating(false)
    }

    if (isLastStep) {
      await onComplete()
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (onStepChange) {
        onStepChange(nextStep)
      }
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      if (onStepChange) {
        onStepChange(prevStep)
      }
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
      if (onStepChange) {
        onStepChange(stepIndex)
      }
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {showStepIndicator && (
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      )}

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
          {currentStepData.description && (
            <p className="mt-2 text-muted-foreground">
              {currentStepData.description}
            </p>
          )}
        </div>

        <div className="min-h-[300px]">{currentStepData.content}</div>

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isValidating}
          >
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isValidating}>
            {isValidating ? 'Validating...' : isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick: (stepIndex: number) => void
}

function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isClickable = index < currentStep

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors',
                  isActive &&
                    'border-primary bg-primary text-primary-foreground',
                  isCompleted &&
                    'border-primary bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90',
                  !isActive && !isCompleted && 'border-muted bg-background',
                  isClickable && 'cursor-pointer'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </button>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isActive && 'text-primary',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-[2px] flex-1 mx-4 transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function useFormWizard(steps: WizardStep[]) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())

  const goToStep = React.useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }, [steps.length])

  const nextStep = React.useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length])

  const previousStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const reset = React.useCallback(() => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [])

  return {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  }
}
