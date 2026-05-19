/**
 * SERVICIO - Prendas CRUD
 * 
 * Responsabilidades:
 * - Operaciones CRUD en base de datos
 * - Integración con Event Manager
 * - Validaciones de negocio
 * - Manejo de errores
 */

import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PrendaEntity } from '../entities/prenda.entity';
import { CreatePrendaDto } from '../dto/create-prenda.dto';
import { UpdatePrendaDto } from '../dto/update-prenda.dto';
import { EventManagerClient } from '../clients/event-manager.client';


@Injectable()
export class PrendasService {
  private readonly logger = new Logger(PrendasService.name);

  constructor(
    @InjectRepository(PrendaEntity)
    private readonly prendaRepository: Repository<PrendaEntity>,
    private readonly eventManagerClient: EventManagerClient,
  ) {}

  /**
   * 🟢 CREATE - Crear nueva prenda
   * 
   * Flujo:
   * 1. Validar datos (automático vía DTO)
   * 2. Crear entidad
   * 3. Guardar en BD
   * 4. Enviar evento al Event Manager
   */
  async create(createPrendaDto: CreatePrendaDto): Promise<PrendaEntity> {
    try {
      // Mantenimiento Correctivo: Validar que no haya prenda duplicada con mismo nombre y talla
      const existente = await this.prendaRepository.findOne({
        where: {
          name: createPrendaDto.name,
          size: createPrendaDto.size,
          isDeleted: false,
        },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe una prenda "${createPrendaDto.name}" en talla ${createPrendaDto.size}`
        );
      }

      // Mantenimiento Preventivo: Crear entidad con validaciones
      const prenda = this.prendaRepository.create({
        name: createPrendaDto.name.trim(),
        description: createPrendaDto.description?.trim() || null,
        size: createPrendaDto.size.toUpperCase(),
        price: createPrendaDto.price,
        stock: createPrendaDto.stock,
        color: createPrendaDto.color?.trim() || null,
        material: createPrendaDto.material?.trim() || null,
        isDeleted: false,
      });

      // Guardar en BD
      const prendaGuardada = await this.prendaRepository.save(prenda);

      // Mantenimiento Perfectivo: Enviar evento CREATE de forma NO BLOQUEANTE
      this.eventManagerClient.sendCreateEvent(prendaGuardada);

      return prendaGuardada;
    } catch (error) {
      // Mantenimiento Preventivo: Capturar y loguear error
      this.logger.error(`Error creando prenda: ${error}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al crear prenda: ${error instanceof Error ? error.message : 'Desconocido'}`
      );
    }
  }

  /**
   * 🔵 READ - Obtener todas las prendas activas
   */
  async findAll(): Promise<PrendaEntity[]> {
    try {
      // Mantenimiento Preventivo: Enviar evento de QUERY
      this.eventManagerClient.sendQueryEvent('find-all');

      // Mantenimiento Correctivo: Solo traer prendas no eliminadas
      return await this.prendaRepository.find({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error obteniendo prendas: ${error}`);
      throw new InternalServerErrorException('Error al obtener prendas');
    }
  }

  /**
   * 🔵 READ - Obtener prenda por ID
   */
  async findById(id: string): Promise<PrendaEntity> {
    try {
      // Mantenimiento Preventivo: Validar que ID no esté vacío
      if (!id || id.trim() === '') {
        throw new BadRequestException('ID de prenda inválido');
      }

      const prenda = await this.prendaRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!prenda) {
        throw new NotFoundException(`Prenda con ID ${id} no encontrada`);
      }

      return prenda;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error obteniendo prenda: ${error}`);
      throw new InternalServerErrorException('Error al obtener prenda');
    }
  }

  /**
   * 🔵 READ - Buscar prendas por talla
   */
  async findBySize(size: string): Promise<PrendaEntity[]> {
    try {
      // Mantenimiento Preventivo: Validar talla
      const sizesValidas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const sizeNormalizada = size.toUpperCase();

      if (!sizesValidas.includes(sizeNormalizada)) {
        throw new BadRequestException(
          `Talla inválida: ${size}. Valores válidos: ${sizesValidas.join(', ')}`
        );
      }

      this.eventManagerClient.sendQueryEvent('find-by-size', { size: sizeNormalizada });

      return await this.prendaRepository.find({
        where: { size: sizeNormalizada, isDeleted: false },
        order: { name: 'ASC' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error buscando por talla: ${error}`);
      throw new InternalServerErrorException('Error al buscar prendas por talla');
    }
  }

  /**
   * 🔵 READ - Buscar prendas por nombre (LIKE)
   */
  async findByName(name: string): Promise<PrendaEntity[]> {
    try {
      // Mantenimiento Preventivo: Validar nombre
      if (!name || name.trim() === '') {
        throw new BadRequestException('Nombre de búsqueda no puede estar vacío');
      }

      const nameSanitizado = name.trim();

      this.eventManagerClient.sendQueryEvent('find-by-name', { name: nameSanitizado });

      return await this.prendaRepository.find({
        where: { name: Like(`%${nameSanitizado}%`), isDeleted: false },
        order: { name: 'ASC' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error buscando por nombre: ${error}`);
      throw new InternalServerErrorException('Error al buscar prendas por nombre');
    }
  }

  /**
   * 🟡 UPDATE - Actualizar prenda
   */
  async update(id: string, updatePrendaDto: UpdatePrendaDto): Promise<PrendaEntity> {
    try {
      // Mantenimiento Correctivo: Verificar que prenda exista
      const prendaAntes = await this.findById(id);

      // Mantenimiento Correctivo: Validar que no haya duplicados si cambia nombre/talla
      if (
        (updatePrendaDto.name || updatePrendaDto.size) &&
        (updatePrendaDto.name !== prendaAntes.name || updatePrendaDto.size !== prendaAntes.size)
      ) {
        const duplicada = await this.prendaRepository.findOne({
          where: {
            name: updatePrendaDto.name || prendaAntes.name,
            size: updatePrendaDto.size || prendaAntes.size,
            isDeleted: false,
          },
        });

        if (duplicada && duplicada.id !== id) {
          throw new BadRequestException('Ya existe una prenda con ese nombre y talla');
        }
      }

      // Mantenimiento Preventivo: Preparar cambios para auditoría
      const cambios: Record<string, any> = {};

      // Actualizar solo campos proporcionados
      if (updatePrendaDto.name !== undefined && updatePrendaDto.name !== prendaAntes.name) {
        prendaAntes.name = updatePrendaDto.name.trim();
        cambios['name'] = updatePrendaDto.name;
      }

      if (
        updatePrendaDto.description !== undefined &&
        updatePrendaDto.description !== prendaAntes.description
      ) {
        prendaAntes.description = updatePrendaDto.description?.trim() || null;
        cambios['description'] = updatePrendaDto.description;
      }

      if (updatePrendaDto.size !== undefined && updatePrendaDto.size !== prendaAntes.size) {
        prendaAntes.size = updatePrendaDto.size.toUpperCase();
        cambios['size'] = updatePrendaDto.size;
      }

      if (updatePrendaDto.price !== undefined && updatePrendaDto.price !== prendaAntes.price) {
        prendaAntes.price = updatePrendaDto.price;
        cambios['price'] = updatePrendaDto.price;
      }

      if (updatePrendaDto.stock !== undefined && updatePrendaDto.stock !== prendaAntes.stock) {
        prendaAntes.stock = updatePrendaDto.stock;
        cambios['stock'] = updatePrendaDto.stock;
      }

      if (updatePrendaDto.color !== undefined && updatePrendaDto.color !== prendaAntes.color) {
        prendaAntes.color = updatePrendaDto.color?.trim() || null;
        cambios['color'] = updatePrendaDto.color;
      }

      if (
        updatePrendaDto.material !== undefined &&
        updatePrendaDto.material !== prendaAntes.material
      ) {
        prendaAntes.material = updatePrendaDto.material?.trim() || null;
        cambios['material'] = updatePrendaDto.material;
      }

      // Si no hay cambios, retornar sin actualizar
      if (Object.keys(cambios).length === 0) {
        return prendaAntes;
      }

      // Guardar cambios
      const prendaActualizada = await this.prendaRepository.save(prendaAntes);

      // Mantenimiento Perfectivo: Enviar evento UPDATE con comparativa
      this.eventManagerClient.sendUpdateEvent(
        { ...prendaAntes, ...cambios },
        prendaActualizada,
        cambios
      );

      return prendaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error actualizando prenda: ${error}`);
      throw new InternalServerErrorException(
        `Error al actualizar prenda: ${error instanceof Error ? error.message : 'Desconocido'}`
      );
    }
  }

  /**
   * 🔴 DELETE - Eliminar prenda (soft delete)
   * 
   * Mantenimiento Preventivo: Usar soft delete para mantener auditoría
   * No se elimina físicamente, solo se marca como eliminada
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    try {
      // Mantenimiento Correctivo: Verificar que prenda exista
      const prenda = await this.findById(id);

      // Marcar como eliminada (soft delete)
      prenda.isDeleted = true;
      await this.prendaRepository.save(prenda);

      // Mantenimiento Perfectivo: Enviar evento DELETE
      this.eventManagerClient.sendDeleteEvent(prenda);

      return {
        message: `Prenda "${prenda.name}" eliminada exitosamente`,
        id: prenda.id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error eliminando prenda: ${error}`);
      throw new InternalServerErrorException(
        `Error al eliminar prenda: ${error instanceof Error ? error.message : 'Desconocido'}`
      );
    }
  }

  /**
   * PERFECTIVO: Obtener estadísticas del inventario
   */
  async getInventarioStats(): Promise<{
    totalPrendas: number;
    stockTotal: number;
    precioPromedio: number;
    prendaMasVendida?: string;
    distribucionPorTalla: Record<string, number>;
  }> {
    try {
      const prendas = await this.prendaRepository.find({
        where: { isDeleted: false },
      });

      if (prendas.length === 0) {
        return {
          totalPrendas: 0,
          stockTotal: 0,
          precioPromedio: 0,
          distribucionPorTalla: {},
        };
      }

      // Contar por talla
      const distribucionPorTalla: Record<string, number> = {
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
      };

      prendas.forEach((p) => {
        distribucionPorTalla[p.size]++;
      });

      const totalStock = prendas.reduce((sum, p) => sum + p.stock, 0);
      const precioPromedio = prendas.reduce((sum, p) => sum + parseFloat(p.price.toString()), 0) / prendas.length;

      return {
        totalPrendas: prendas.length,
        stockTotal: totalStock,
        precioPromedio: Math.round(precioPromedio * 100) / 100,
        distribucionPorTalla,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error}`);
      throw new InternalServerErrorException('Error al obtener estadísticas');
    }
  }
}
