import { UUID } from '@libs/types';
import { RiskCalculationStatus } from './risk-calculation-status.enum';

export interface ICalculation {
  id?: UUID;
  settingsId?: UUID[];
  payload: any;
  status?: RiskCalculationStatus;
  result?: any;
  createdAt?: Date;
}
