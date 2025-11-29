# 📋 Recomendaciones DDD - OsitoPolar Frontend

## 📊 Resumen Ejecutivo

Este documento presenta un análisis exhaustivo de la arquitectura actual del proyecto **OsitoPolar Frontend** desde la perspectiva de **Domain-Driven Design (DDD)**, junto con recomendaciones específicas para mejorar la implementación.

### Puntuación DDD Actual: **47/100** (Regular-Bueno)

---

## 🏗️ Arquitectura Actual

### Stack Tecnológico
- **Framework**: Vue 3.5.13 + Vite
- **State Management**: Pinia 3.0.2
- **UI Components**: PrimeVue 4.3.3 + PrimeFlex 4.0.0
- **Routing**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.9.0
- **i18n**: Vue-i18n 10.0.7
- **Pagos**: Stripe 18.2.1

### Bounded Contexts Identificados (9)

| Bounded Context | Entidades Principales | Responsabilidad |
|---|---|---|
| **IAM** | User, AuthResponse | Autenticación, autorización, perfiles |
| **Equipment** | Equipment | Gestión de equipos de refrigeración |
| **Analytics** | TemperatureReading, DailyTemperatureAverage | Análisis de temperatura y energía |
| **Rental** | RentalEquipment, RentalContract, RentalPrice | Sistema de alquiler completo |
| **Field Operations** | WorkOrder, Technician | Órdenes de trabajo y técnicos |
| **Service** | ServiceRequest | Solicitudes de servicio técnico |
| **Subscriptions** | Plan | Planes de suscripción |
| **Notifications** | Notification | Sistema de notificaciones |
| **Public** | - | Páginas públicas y landing |

---

## ✅ Fortalezas del Proyecto

1. **Excelente separación por Bounded Contexts** (9/10)
   - Cada contexto tiene su propia carpeta
   - Clara separación de responsabilidades
   - Estructura consistente: `components/`, `models/`, `services/`, `pages/`

2. **Entidades bien definidas** (8/10)
   - 15 entidades identificadas
   - Métodos de dominio implementados (ej: `Equipment.getTemperatureStatus()`)
   - Uso de constructores con validación

3. **Infrastructure layer organizada** (8/10)
   - Axios configurado con interceptores
   - Routing con guards y lazy loading
   - Internacionalización implementada

4. **Estado centralizado** (7/10)
   - Pinia implementado correctamente
   - Stores para auth y theme
   - Persistencia en localStorage

5. **Color principal consistente** (9/10)
   - #0079c2 (Azul Osito Polar) usado en 60+ ubicaciones
   - Identidad visual coherente

---

## ⚠️ Áreas de Mejora Críticas

### 1. Repository Pattern (0/10) - **CRÍTICO**

**Problema**: Los servicios llaman directamente a HTTP sin abstracción.

**Ejemplo actual (Incorrecto)**:
```javascript
// rental/services/rental-catalog.service.js
export class RentalCatalogService {
  getAllRentalEquipment() {
    return httpInstance.get('/rentalEquipment?isAvailable=true');
  }
}
```

**Solución recomendada**:
```javascript
// rental/domain/repositories/rental-equipment.repository.interface.js
export class RentalEquipmentRepository {
  async findAll() { throw new Error('Must implement'); }
  async findById(id) { throw new Error('Must implement'); }
  async findAvailable() { throw new Error('Must implement'); }
}

// rental/infrastructure/repositories/rental-equipment.repository.impl.js
import { RentalEquipmentRepository } from '../../domain/repositories/rental-equipment.repository.interface.js';
import httpInstance from '../../../shared/http.instance.js';
import { RentalEquipment } from '../../domain/entities/rental-equipment.entity.js';

export class RentalEquipmentRepositoryImpl extends RentalEquipmentRepository {
  async findAll() {
    const response = await httpInstance.get('/rentalEquipment');
    return response.data.map(data => new RentalEquipment(data));
  }

  async findAvailable() {
    const response = await httpInstance.get('/rentalEquipment?isAvailable=true');
    return response.data.map(data => new RentalEquipment(data));
  }
}
```

**Beneficios**:
- Abstracción de la fuente de datos
- Facilita testing con mocks
- Permite cambiar backend sin afectar dominio

---

### 2. Separación Domain Services vs Application Services (3/10) - **ALTA PRIORIDAD**

**Problema**: Servicios actuales mezclan lógica de dominio con orquestación.

**Solución**:

```javascript
// rental/domain/services/rental-pricing.domain-service.js
export class RentalPricingDomainService {
  /**
   * Pure domain logic - no dependencies on infrastructure
   */
  calculateMonthlyDiscount(months) {
    if (months >= 12) return 0.20;      // 20% off
    if (months >= 6) return 0.15;       // 15% off
    if (months >= 3) return 0.10;       // 10% off
    return 0;
  }

  calculateTotalCost(basePrice, months, quantity) {
    const discount = this.calculateMonthlyDiscount(months);
    const discountedPrice = basePrice * (1 - discount);
    return discountedPrice * months * quantity;
  }
}

// rental/application/use-cases/create-rental-request.use-case.js
export class CreateRentalRequestUseCase {
  constructor(rentalRepository, pricingService, notificationService) {
    this.rentalRepository = rentalRepository;
    this.pricingService = pricingService;
    this.notificationService = notificationService;
  }

  async execute(command) {
    const { userId, equipmentId, months, quantity } = command;

    // 1. Fetch equipment
    const equipment = await this.rentalRepository.findById(equipmentId);
    if (!equipment.isAvailable) {
      throw new Error('Equipment not available');
    }

    // 2. Calculate pricing using domain service
    const totalCost = this.pricingService.calculateTotalCost(
      equipment.monthlyPrice,
      months,
      quantity
    );

    // 3. Create rental request
    const rental = new RentalRequest({
      userId,
      equipmentId,
      quantity,
      rentalPeriodMonths: months,
      totalMonthlyPrice: totalCost,
      status: 'draft'
    });

    // 4. Save
    await this.rentalRepository.save(rental);

    // 5. Notify
    await this.notificationService.notifyRentalCreated(userId, rental.id);

    return rental;
  }
}
```

---

### 3. Value Objects (2/10) - **MEDIA PRIORIDAD**

**Problema**: No hay Value Objects explícitos.

**Candidatos identificados**:
- `Money` - Para precios y montos
- `Location` - Para coordenadas geográficas
- `TemperatureRange` - Para rangos de temperatura
- `EmailAddress` - Para emails
- `PhoneNumber` - Para teléfonos

**Ejemplo de implementación**:

```javascript
// shared/domain/value-objects/money.value-object.js
export class Money {
  constructor(amount, currency = 'USD') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this._amount = amount;
    this._currency = currency;
  }

  get amount() {
    return this._amount;
  }

  get currency() {
    return this._currency;
  }

  add(other) {
    if (this._currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this._amount + other.amount, this._currency);
  }

  multiply(factor) {
    return new Money(this._amount * factor, this._currency);
  }

  equals(other) {
    return this._amount === other.amount && this._currency === other.currency;
  }

  toString() {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}

// analytics/domain/value-objects/temperature-range.value-object.js
export class TemperatureRange {
  constructor(min, max, unit = 'C') {
    if (min >= max) {
      throw new Error('Invalid temperature range: min must be less than max');
    }
    this._min = min;
    this._max = max;
    this._unit = unit;
  }

  isWithinRange(temperature) {
    return temperature >= this._min && temperature <= this._max;
  }

  equals(other) {
    return this._min === other._min &&
           this._max === other._max &&
           this._unit === other._unit;
  }

  toString() {
    return `${this._min}°${this._unit} - ${this._max}°${this._unit}`;
  }
}
```

**Uso en Equipment**:
```javascript
import { TemperatureRange } from '../value-objects/temperature-range.value-object.js';

export class Equipment {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    // Before: this.minTemperature = data.minTemperature;
    // After:
    this.temperatureRange = new TemperatureRange(
      data.minTemperature,
      data.maxTemperature
    );
  }

  isTemperatureNormal(currentTemp) {
    return this.temperatureRange.isWithinRange(currentTemp);
  }
}
```

---

### 4. Domain Events (0/10) - **MEDIA PRIORIDAD**

**Problema**: No hay eventos de dominio.

**Implementación recomendada**:

```javascript
// shared/domain/domain-event.js
export class DomainEvent {
  constructor() {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }
}

// rental/domain/events/rental-created.event.js
import { DomainEvent } from '../../../shared/domain/domain-event.js';

export class RentalCreatedEvent extends DomainEvent {
  constructor(rentalId, userId, equipmentId, totalCost) {
    super();
    this.rentalId = rentalId;
    this.userId = userId;
    this.equipmentId = equipmentId;
    this.totalCost = totalCost;
  }
}

// rental/domain/events/rental-contract-activated.event.js
export class RentalContractActivatedEvent extends DomainEvent {
  constructor(contractId, startDate, endDate) {
    super();
    this.contractId = contractId;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

// shared/infrastructure/event-bus.js
export class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  subscribe(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push(handler);
  }

  async publish(event) {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    for (const handler of handlers) {
      await handler(event);
    }
  }
}
```

**Uso en Use Case**:
```javascript
export class CreateRentalRequestUseCase {
  async execute(command) {
    // ... create rental ...

    // Publish event
    const event = new RentalCreatedEvent(
      rental.id,
      rental.userId,
      rental.equipmentId,
      rental.totalMonthlyPrice
    );

    await this.eventBus.publish(event);

    return rental;
  }
}

// Event handler (puede estar en otro bounded context)
export class NotifyUserOnRentalCreatedHandler {
  async handle(event) {
    await notificationService.sendNotification({
      userId: event.userId,
      type: 'RENTAL_CREATED',
      message: `Your rental request #${event.rentalId} has been created`
    });
  }
}
```

---

### 5. DTOs (Data Transfer Objects) (0/10) - **BAJA PRIORIDAD**

**Problema**: Las entidades se usan directamente como respuestas HTTP.

**Solución**:

```javascript
// rental/application/dto/rental-equipment.dto.js
export class RentalEquipmentDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.monthlyPrice = data.monthlyPrice;
    this.isAvailable = data.isAvailable;
    this.imageUrl = data.imageUrl;
    this.description = data.description;
  }

  static fromEntity(entity) {
    return new RentalEquipmentDTO({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      monthlyPrice: entity.monthlyPrice,
      isAvailable: entity.isAvailable,
      imageUrl: entity.imageUrl,
      description: entity.description
    });
  }

  toEntity() {
    return new RentalEquipment(this);
  }
}
```

---

## 📂 Estructura Recomendada DDD Completa

```
rental/
├── domain/
│   ├── entities/
│   │   ├── rental-equipment.entity.js
│   │   ├── rental-contract.entity.js
│   │   └── rental-request.entity.js
│   ├── value-objects/
│   │   ├── rental-price.value-object.js
│   │   ├── rental-period.value-object.js
│   │   └── money.value-object.js
│   ├── repositories/
│   │   ├── rental-equipment.repository.interface.js
│   │   └── rental-contract.repository.interface.js
│   ├── services/
│   │   ├── rental-pricing.domain-service.js
│   │   └── rental-contract-factory.js
│   └── events/
│       ├── rental-created.event.js
│       ├── contract-activated.event.js
│       └── payment-completed.event.js
│
├── application/
│   ├── use-cases/
│   │   ├── create-rental-request.use-case.js
│   │   ├── approve-rental-request.use-case.js
│   │   ├── activate-rental-contract.use-case.js
│   │   └── calculate-rental-cost.use-case.js
│   ├── dto/
│   │   ├── rental-equipment.dto.js
│   │   ├── rental-request.dto.js
│   │   └── rental-contract.dto.js
│   └── services/
│       └── rental.application-service.js
│
├── infrastructure/
│   ├── repositories/
│   │   ├── rental-equipment.repository.impl.js
│   │   └── rental-contract.repository.impl.js
│   └── adapters/
│       ├── stripe-payment-adapter.js
│       └── email-notification-adapter.js
│
├── presentation/
│   ├── components/
│   │   ├── RentalEquipmentCard.vue
│   │   ├── RentalFilterBar.vue
│   │   └── RentalCheckoutForm.vue
│   ├── pages/
│   │   ├── rental-catalog.page.vue
│   │   └── rental-checkout.page.vue
│   └── store/
│       └── rental.store.js
│
└── config/
    └── rental-di-container.js
```

---

## 🎯 Plan de Implementación por Prioridad

### 🔴 PRIORIDAD 1: Crítico (2-3 semanas)

1. **Implementar Repository Pattern** (1 semana)
   - Crear interfaces de repositorios para cada bounded context
   - Implementar repositorios concretos con HTTP
   - Actualizar servicios para usar repositorios

2. **Separar Domain Services de Application Services** (1 semana)
   - Identificar lógica de dominio pura
   - Crear domain services
   - Crear use cases para orquestación

3. **Crear Value Objects principales** (1 semana)
   - Money
   - Location
   - TemperatureRange
   - Actualizar entidades para usarlos

### 🟡 PRIORIDAD 2: Importante (3-4 semanas)

4. **Implementar Domain Events** (2 semanas)
   - Crear event bus
   - Definir eventos de dominio clave
   - Implementar event handlers
   - Integrar con use cases

5. **Crear Use Cases explícitos** (2 semanas)
   - CreateRentalRequest
   - ActivateRentalContract
   - CreateWorkOrder
   - ProcessServiceRequest

6. **Mejorar State Management** (1 semana)
   - Crear stores por bounded context
   - Rental store (carrito)
   - Notification store
   - Equipment store

### 🟢 PRIORIDAD 3: Mejoras (4-6 semanas)

7. **Implementar DTOs** (2 semanas)
   - Crear DTOs para cada entidad
   - Mappers entre DTOs y entidades
   - Actualizar repositorios

8. **Inyección de Dependencias** (1 semana)
   - Crear contenedor DI
   - Registrar dependencias
   - Actualizar componentes Vue

9. **Specification Pattern** (1 semana)
   - Para búsquedas complejas
   - Filtros reutilizables

10. **Testing** (2 semanas)
    - Unit tests para domain services
    - Integration tests para repositories
    - E2E tests para use cases

---

## 📈 Métricas de Éxito

### Antes de DDD (Actual)

| Aspecto | Puntuación |
|---|---|
| Organización | 9/10 |
| Entidades | 8/10 |
| Domain Services | 5/10 |
| Repository Pattern | 0/10 |
| Application Services | 3/10 |
| Value Objects | 2/10 |
| Domain Events | 0/10 |
| State Management | 7/10 |
| **TOTAL** | **47/100** |

### Después de DDD (Objetivo)

| Aspecto | Puntuación Objetivo |
|---|---|
| Organización | 10/10 |
| Entidades | 9/10 |
| Domain Services | 9/10 |
| Repository Pattern | 9/10 |
| Application Services | 9/10 |
| Value Objects | 8/10 |
| Domain Events | 8/10 |
| State Management | 9/10 |
| **TOTAL** | **85/100** |

---

## 🎨 Dark Mode Implementado

### ✅ Características

1. **Sistema de temas completo**
   - Light mode (default)
   - Dark mode
   - Persistencia en localStorage
   - Respeta preferencias del sistema

2. **Color principal mantenido**
   - Light: #0079c2 (Azul Osito Polar original)
   - Dark: #0ea5e9 (Variante más clara para visibilidad)

3. **Archivos creados/modificados**
   - `src/config/theme-config.js` - Configuración centralizada
   - `src/style.css` - CSS custom properties
   - `src/shared/components/theme-toggle.component.vue` - Botón toggle
   - `src/main.js` - Inicialización del tema
   - `src/public/components/navbar.component.vue` - Integración

4. **Paleta completa**
   ```javascript
   // Light Theme
   primary: '#0079c2'
   background: '#f5f7fa'
   text: '#333333'

   // Dark Theme
   primary: '#0ea5e9'
   background: '#0f172a'
   text: '#f1f5f9'
   ```

---

## 📚 Referencias y Recursos

### Libros Recomendados
1. **"Domain-Driven Design" - Eric Evans** (El libro original)
2. **"Implementing Domain-Driven Design" - Vaughn Vernon** (Implementación práctica)
3. **"Clean Architecture" - Robert C. Martin** (Arquitectura limpia)

### Artículos y Recursos
- [DDD Reference - Eric Evans](https://www.domainlanguage.com/ddd/reference/)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Pinia Best Practices](https://pinia.vuejs.org/cookbook/)

### Patrones Implementados
- ✅ Bounded Contexts
- ✅ Entities
- ⚠️ Value Objects (parcial)
- ❌ Aggregates (implícito, no explícito)
- ❌ Repositories
- ⚠️ Domain Services (mezclado)
- ❌ Application Services
- ❌ Domain Events
- ✅ State Management (Pinia)

---

## 🚀 Próximos Pasos Inmediatos

1. **Revisar este documento con el equipo**
2. **Priorizar implementación** según business value
3. **Crear primera iteración**: Repository Pattern para Rental BC
4. **Iterar** y mejorar progresivamente
5. **Documentar decisiones** de arquitectura

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación de estas recomendaciones, consultar:
- Documentación del proyecto
- Equipo de arquitectura
- Revisiones de código semanales

---

**Documento creado**: 2025-11-02
**Versión**: 1.0
**Autor**: Claude Code - Análisis de Arquitectura DDD
**Proyecto**: OsitoPolar Frontend
