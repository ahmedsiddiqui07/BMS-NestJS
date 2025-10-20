import { IsEnum } from 'class-validator';
import { RequestStatus } from 'src/common/constants/enum/req-status.enum';

export class UpdateBookRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
