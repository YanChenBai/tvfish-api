import { IsNotEmpty, IsOptional } from 'class-validator';

export class RoomInfo {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  type: 'douyu' | 'bili';
}

export class GetOrigin {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  type: 'douyu' | 'bili';

  @IsOptional()
  @IsNotEmpty()
  qn = 0;

  @IsOptional()
  @IsNotEmpty()
  line = ' ';
}
