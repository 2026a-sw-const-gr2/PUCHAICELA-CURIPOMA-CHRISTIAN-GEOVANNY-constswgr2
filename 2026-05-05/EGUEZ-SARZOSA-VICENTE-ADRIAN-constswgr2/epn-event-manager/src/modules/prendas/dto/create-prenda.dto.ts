/**
 * DTO - Crear Prenda
 * 
 * Mantenimiento Preventivo: Validaciones en decoradores
 * Mantenimiento Correctivo: Restricciones de datos
 */

import { IsNotEmpty, IsString, MaxLength, IsDecimal, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class CreatePrendaDto {
  // Mantenimiento Preventivo: Nombre obligatorio y con límite
  @IsNotEmpty({ message: 'El nombre de la prenda es obligatorio' })
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  // Descripción opcional
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  // Mantenimiento Preventivo: Talla debe ser valor válido
  @IsNotEmpty({ message: 'La talla es obligatoria' })
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: 'Talla inválida. Valores permitidos: XS, S, M, L, XL, XXL',
  })
  size: string;

  // Mantenimiento Preventivo: Precio positivo
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsDecimal({ decimal_digits: '2' }, { message: 'El precio debe tener máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  // Mantenimiento Preventivo: Stock no negativo
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsInt()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  // Color opcional
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El color no puede exceder 100 caracteres' })
  color?: string;

  // Material opcional
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El material no puede exceder 100 caracteres' })
  material?: string;
}
