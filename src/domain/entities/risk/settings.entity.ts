import { generateUuid } from '@libs/helpers';
import { UUID } from '@libs/types';
import { ISettings } from '../../types';

export class SettingsEntity implements ISettings {
  public id: UUID;

  constructor(params: ISettings) {
    this.id = params.id ?? generateUuid();
  }

  toJSON(): Required<ISettings> {
    return {
      id: this.id,
    };
  }
}
