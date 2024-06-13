import { generateUuid } from '@libs/helpers';
import { UUID } from '@libs/types';
import { ICalculation, RiskCalculationStatus } from '../../types';

export class CalculationEntity implements ICalculation {
  public id: UUID;
  public settingsId: UUID[];
  public payload: any;
  public status: RiskCalculationStatus;
  public result: any | null;
  public createdAt: Date;

  constructor(params: ICalculation) {
    this.id = params.id ?? generateUuid();
    this.settingsId = params.settingsId ?? [];
    this.payload = params.payload;
    this.status = params.status ?? RiskCalculationStatus.Created;
    this.result = params.result ?? null;
    this.createdAt = params.createdAt ?? new Date();
  }

  toJSON(): Required<ICalculation> {
    return {
      id: this.id,
      settingsId: this.settingsId,
      payload: this.payload,
      status: this.status,
      result: this.result,
      createdAt: this.createdAt,
    };
  }
}
