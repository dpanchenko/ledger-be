import { CalculationEntity } from '@domain/entities';
import { CalculationRepository, SettingsRepository } from '../../repositories';
import { IRiskResult, RiskCalculationStatus, RiskStatus } from '../../types';

export class RiskCalculateService {
  constructor(
    protected readonly calculateRepository: CalculationRepository,
    protected readonly settingsRepository: SettingsRepository,
  ) {}

  async calculateRisk(params: any): Promise<IRiskResult> {
    const calculationEntity = await this.calculateRepository.save(
      new CalculationEntity({
        payload: params,
      }),
    );

    try {
      const settingsEntities = await this.settingsRepository.getByParams(params);

      if (!settingsEntities.length) {
        throw new Error('Settings not found');
      }

      // Calculate risk logic
      const result: IRiskResult = {
        score: 0,
        status: RiskStatus.Approved,
      };

      calculationEntity.settingsId = settingsEntities.map((entity) => entity.id);
      calculationEntity.result = result;
      calculationEntity.status = RiskCalculationStatus.Success;
      await this.calculateRepository.save(calculationEntity);

      return result;
    } catch (error) {
      calculationEntity.result = error;
      calculationEntity.status = RiskCalculationStatus.Failed;
      await this.calculateRepository.save(calculationEntity);

      throw error;
    }
  }
}
