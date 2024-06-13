import { CalculationEntity } from '../../entities';

export abstract class CalculationRepository {
  abstract save(entity: CalculationEntity): Promise<CalculationEntity | null>;
}
