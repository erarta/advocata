import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Role slug (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'List of permissions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateAdminRoleDto {
  @ApiProperty({ description: 'List of permissions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class AssignAdminRoleDto {
  @ApiProperty({ description: 'Role ID to assign' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
