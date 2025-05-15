import httpInstance from "../../shared/http.instance.js";
import { ServiceRequest } from "../models/service-request.entity.js";

export class ServiceRequestService {
    getAll() {
        return httpInstance.get('/service-requests?_expand=equipment');
    }

    async getAllMapped() {
        const { data } = await this.getAll();
        return this.mapRequest(data);
    }

    create(data) {
        return httpInstance.post('/service-requests', data);
    }

    mapRequest(data) {
        if (Array.isArray(data)) {
            return data.map(item => new ServiceRequest(item));
        }
        return new ServiceRequest(data);
    }
}
