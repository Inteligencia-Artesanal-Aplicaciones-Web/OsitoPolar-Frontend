export class ServiceRequest {
    constructor({ id, description, priority, desiredDate, equipmentId, equipment, status }) {
        this.id = id;
        this.description = description;
        this.priority = priority;
        this.desiredDate = desiredDate;
        this.equipmentId = equipmentId;
        this.equipment = equipment;
        this.status = status || 'pending';
    }
}