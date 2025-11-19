import { IQuery } from '@nestjs/cqrs';
import { GetUsersDto } from '../../../../presentation/dtos/users/get-users.dto';

export class GetUsersQuery implements IQuery {
  constructor(public readonly dto: GetUsersDto) {}
}
