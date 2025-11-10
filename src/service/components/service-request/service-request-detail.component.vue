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
      if (!date) return this.$t('service.notScheduled');
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<template>
  <pv-dialog
      :header="$t('service.requestDetails')"
      :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '700px' }"
      class="detail-dialog"
      @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="request" class="dialog-content">
      <div class="field"><strong>{{ $t('service.orderNumber') }}:</strong> {{ request.orderNumber }}</div>
      <div class="field"><strong>{{ $t('service.statusLabel') }}:</strong> {{ $t(`service.status.${request.status}`) }}</div>
      <div class="field"><strong>{{ $t('service.description') }}:</strong> {{ request.description }}</div>
      <div class="field"><strong>{{ $t('service.equipment') }}:</strong> {{ equipmentDisplay }}</div>
      <div class="field"><strong>{{ $t('service.location') }}:</strong> {{ locationDisplay }}</div>
      <div class="field"><strong>{{ $t('service.serviceType') }}:</strong> {{ $t(`service.types.${request.serviceType}`) || request.serviceType }}</div>
      <div class="field"><strong>{{ $t('service.urgency') }}:</strong> {{ $t(`service.form.${request.urgency?.toLowerCase()}`) || request.urgency }}</div>
      <div class="field"><strong>{{ $t('service.asap') }}:</strong> {{ request.isEmergency ? $t('service.yes') : $t('service.no') }}</div>
      <div class="field" v-if="!request.asap"><strong>{{ $t('service.scheduledFor') }}:</strong> {{ formatDate(request.scheduledDate) }}</div>
      <div class="field" v-if="!request.asap"><strong>{{ $t('service.timeSlot') }}:</strong> {{ request.timeSlot || '-' }}</div>
      <div class="field"><strong>{{ $t('service.address') }}:</strong> {{ request.serviceAddress || $t('service.notSpecified') }}</div>
      <div class="field"><strong>{{ $t('service.technician') }}:</strong> {{ request.assignedTechnicianId || $t('service.notAssigned') }}</div>
      <div class="field"><strong>{{ $t('service.completed') }}:</strong> {{ formatDate(request.actualCompletionDate) }}</div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.detail-dialog :deep(.p-dialog) {
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-card-background);
  border: 1px solid var(--color-card-border);
  box-shadow: 0 8px 32px var(--color-shadow-large);
  transition: all 0.3s ease;
}

.detail-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  font-weight: 700;
  font-size: 1.25rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 1.5rem 2rem;
  transition: background 0.3s ease;
}

.detail-dialog :deep(.p-dialog-content) {
  background-color: var(--color-card-background);
  padding: 2rem;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  transition: background-color 0.3s ease;
}

.dialog-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  background: var(--color-surface-hover);
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 2px 4px var(--color-shadow);
  color: var(--color-text);
  transition: all 0.3s ease;
  font-size: 0.95rem;
  line-height: 1.5;
}

.field:hover {
  background: var(--color-card-background);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--color-shadow-medium);
}

.field strong {
  color: var(--color-primary);
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .dialog-content {
    grid-template-columns: 1fr;
  }

  .detail-dialog :deep(.p-dialog) {
    width: 95vw !important;
  }

  .detail-dialog :deep(.p-dialog-header) {
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
  }

  .detail-dialog :deep(.p-dialog-content) {
    padding: 1.5rem 1rem;
  }

  .field {
    padding: 0.875rem 1rem;
  }
}
</style>
