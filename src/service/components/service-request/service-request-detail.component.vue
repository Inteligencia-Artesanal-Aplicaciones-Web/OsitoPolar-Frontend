<script>
/**
 * @component ServiceRequestDetailModal
 * @description Modal component that displays detailed information about a service request.
 */
export default {
  name: "ServiceRequestDetailModal",

  /**
   * @props
   * @property {Boolean} visible - Controls the visibility of the dialog.
   * @property {Object} request - The service request object containing all detail fields.
   * @property {String} equipmentDisplay - Readable name or description of the related equipment.
   * @property {String} locationDisplay - Readable name or description of the location.
   */
  props: {
    visible: Boolean,
    request: Object,
    equipmentDisplay: String,
    locationDisplay: String
  },

  /**
   * @emits update:visible - Emitted when the visibility of the dialog changes.
   */
  emits: ["update:visible"],

  methods: {
    /**
     * @method formatDate
     * @description Converts a date to a human-readable localized string. Returns "Not defined" if date is invalid.
     * @param {String|Date} date - The date to format.
     * @returns {String}
     */
    formatDate(date) {
      if (!date) return "Not defined";
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<template>
  <pv-dialog
      header="Request Details"
      :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '700px' }"
      class="detail-dialog"
      @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="request" class="dialog-content">
      <div class="field"><strong>Order Number:</strong> {{ request.orderNumber }}</div>
      <div class="field"><strong>Status:</strong> {{ request.status.replace('_', ' ') }}</div>
      <div class="field"><strong>Description:</strong> {{ request.description }}</div>
      <div class="field"><strong>Equipment:</strong> {{ equipmentDisplay }}</div>
      <div class="field"><strong>Location:</strong> {{ locationDisplay }}</div>
      <div class="field"><strong>Service Type:</strong> {{ request.serviceType }}</div>
      <div class="field"><strong>Urgency:</strong> {{ request.urgency }}</div>
      <div class="field"><strong>ASAP:</strong> {{ request.asap ? 'Yes' : 'No' }}</div>
      <div class="field" v-if="!request.asap"><strong>Scheduled Date:</strong> {{ formatDate(request.scheduledDate) }}</div>
      <div class="field" v-if="!request.asap"><strong>Time Slot:</strong> {{ request.timeSlot || '-' }}</div>
      <div class="field"><strong>Address:</strong> {{ request.serviceAddress || 'Not specified' }}</div>
      <div class="field"><strong>Technician:</strong> {{ request.technicianId || 'Not assigned' }}</div>
      <div class="field"><strong>Completed:</strong> {{ formatDate(request.completionDate) }}</div>
    </div>
  </pv-dialog>
</template>

<style>
.detail-dialog .p-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.detail-dialog .p-dialog-header {
  background-color: #0884c4;
  color: #fff;
  font-weight: bold;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 1rem;
}

.detail-dialog .p-dialog-content {
  background-color: #ffffff;
  padding: 2rem;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.dialog-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  background: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
