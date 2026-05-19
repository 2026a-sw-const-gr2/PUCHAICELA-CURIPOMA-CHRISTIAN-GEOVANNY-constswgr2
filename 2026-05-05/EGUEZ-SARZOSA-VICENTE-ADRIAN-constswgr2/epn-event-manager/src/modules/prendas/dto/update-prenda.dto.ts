/**
 * DTO - Actualizar Prenda
 * 
 * Similar a CreatePrendaDto pero todos los campos son opcionales
 */

import { IsOptional, IsString, MaxLength, IsDecimal, IsInt, Min, IsIn } from 'class-validator';

export class UpdatePrendaDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @IsOptional()
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: 'Talla inválida. Valores permitidos: XS, S, M, L, XL, XXL',
  })
  size?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' }, { message: 'El precio debe tener máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El color no puede exceder 100 caracteres' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El material no puede exceder 100 caracteres' })
  material?: string;
}
