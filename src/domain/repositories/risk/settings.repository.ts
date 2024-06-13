import { SettingsEntity } from '../../entities';
import { ISettingsParams } from '../../types';

export abstract class SettingsRepository {
  abstract getByParams(params: ISettingsParams): Promise<SettingsEntity[]>;
}
