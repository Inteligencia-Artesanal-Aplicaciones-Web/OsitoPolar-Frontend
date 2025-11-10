/**
 * @class RentalEquipment
 * @description Equipment available for rent from OsitoPolar
 */
export class RentalEquipment {
    constructor({
                    id = '',
                    name = '',
                    type = '',
                    model = '',
                    manufacturer = '',
                    monthlyPrice = 0,
                    monthlyFee = 0,  // Backend sends this field
                    currency = '$',
                    imageUrl = '',
                    isAvailable = true,
                    description = '',
                    technicalDetails = '',  // Backend sends this field
                    technicalSpecs = '',
                    minimumRentalPeriod = 1, // in months
                    stock = 0,
                    features = []
                }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.model = model;
        this.manufacturer = manufacturer;
        // Use monthlyFee from backend if monthlyPrice not provided
        this.monthlyPrice = monthlyPrice || monthlyFee || 0;
        this.currency = currency;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        // Use technicalDetails from backend if description not provided
        this.description = description || technicalDetails || '';
        this.technicalSpecs = technicalSpecs || technicalDetails || '';
        this.minimumRentalPeriod = minimumRentalPeriod;
        this.stock = stock;
        this.features = features;
    }
}