// types/steps.ts
import type { Driver } from '@/types';

export type StepNext = (stepData: Partial<Driver> & Record<string, any>) => void;

export interface StepBaseProps {
  data: Partial<Driver> & Record<string, any>;
  onBack?: () => void;
}

export interface StepWithNextProps extends StepBaseProps {
  onNext: StepNext;
}
