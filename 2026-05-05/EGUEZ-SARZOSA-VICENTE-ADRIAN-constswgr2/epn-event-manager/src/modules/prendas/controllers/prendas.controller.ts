/**
 * CONTROLADOR - Prendas CRUD
 * 
 * Endpoints:
 * POST   /prendas             - Crear prenda
 * GET    /prendas             - Obtener todas las prendas
 * GET    /prendas/:id         - Obtener prenda por ID
 * GET    /prendas/size/:size  - Buscar por talla
 * GET    /prendas/name/:name  - Buscar por nombre
 * PATCH  /prendas/:id         - Actualizar prenda
 * DELETE /prendas/:id         - Eliminar prenda
 * GET    /prendas/stats       - Obtener estadísticas del inventario
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrendasService } from '../services/prendas.service';
import { CreatePrendaDto } from '../dto/create-prenda.dto';
import { UpdatePrendaDto } from '../dto/update-prenda.dto';

@Controller('prendas')
export class PrendasController {
  private readonly logger = new Logger(PrendasController.name);

  constructor(private readonly prendasService: PrendasService) {}

  /**
   * 🟢 POST /prendas - Crear nueva prenda
   * 
   * Body esperado:
   * {
   *   name: "Camiseta",
   *   size: "M",
   *   price: 29.99,
   *   stock: 50,
   *   color: "Rojo",
   *   material: "Algodón",
   *   description: "Camiseta casual"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPrendaDto: CreatePrendaDto) {
    this.logger.log(`Creando prenda: ${createPrendaDto.name} talla ${createPrendaDto.size}`);
    return await this.prendasService.create(createPrendaDto);
  }

  /**
   * 🔵 GET /prendas - Obtener todas las prendas activas
   */
  @Get()
  async findAll() {
    this.logger.log('Obteniendo todas las prendas');
    return await this.prendasService.findAll();
  }

  /**
   * 🔵 GET /prendas/:id - Obtener prenda específica
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    this.logger.log(`Obteniendo prenda con ID: ${id}`);
    return await this.prendasService.findById(id);
  }

  /**
   * 🔵 GET /prendas/size/:size - Buscar por talla
   * Ejemplo: GET /prendas/size/M
   */
  @Get('size/:size')
  async findBySize(@Param('size') size: string) {
    this.logger.log(`Buscando prendas con talla: ${size}`);
    return await this.prendasService.findBySize(size);
  }

  /**
   * 🔵 GET /prendas/name/:name - Buscar por nombre
   * Ejemplo: GET /prendas/name/Camiseta
   */
  @Get('search/:name')
  async findByName(@Param('name') name: string) {
    this.logger.log(`Buscando prendas con nombre: ${name}`);
    return await this.prendasService.findByName(name);
  }

  /**
   * 🟡 PATCH /prendas/:id - Actualizar prenda
   * 
   * Body esperado (todos los campos opcionales):
   * {
   *   price: 39.99,
   *   stock: 45
   * }
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePrendaDto: UpdatePrendaDto) {
    this.logger.log(`Actualizando prenda con ID: ${id}`);
    return await this.prendasService.update(id, updatePrendaDto);
  }

  /**
   * 🔴 DELETE /prendas/:id - Eliminar prenda (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando prenda con el ID: ${id}`);
    return await this.prendasService.remove(id);
  }

  /**
   * 📊 GET /prendas/stats/inventario - Estadísticas del inventario
   * 
   * Retorna:
   * {
   *   totalPrendas: 15,
   *   stockTotal: 350,
   *   precioPromedio: 45.50,
   *   distribucionPorTalla: { M: 5, L: 6, XL: 4 }
   * }
   */
  @Get('stats/inventario')
  async getInventarioStats() {
    this.logger.log('Obteniendo estadísticas del inventario');
    return await this.prendasService.getInventarioStats();
  }
}
