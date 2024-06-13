import { RiskStatus } from './risk-status.enum';

export interface IRiskResult {
  score: number;
  status: RiskStatus;
}
