import { AbstractUseCase } from '@libs/base';

import { CalculateRiskScoreRequestDto } from './calculate-risk-score.request.dto';
import { CalculateRiskScoreResponseDto } from './calculate-risk-score.response.dto';

export class CalculateRiskScoreUseCase extends AbstractUseCase<
  CalculateRiskScoreRequestDto,
  CalculateRiskScoreResponseDto
> {
  async action(params: CalculateRiskScoreRequestDto): Promise<CalculateRiskScoreResponseDto> {
    return params;
  }
}
