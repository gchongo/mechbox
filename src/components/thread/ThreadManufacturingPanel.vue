<template>
  <div class="thread-manufacturing-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('mfgIntro') }}</p>

    <el-steps
      :active="workflowSteps.length"
      finish-status="success"
      align-center
      class="mfg-steps mb-6"
    >
      <el-step
        v-for="step in workflowSteps"
        :key="step"
        :title="pt(`mfgStep_${step}`)"
        :description="pt(`mfgStep_${step}_desc`)"
      />
    </el-steps>

    <div class="grid gap-4 lg:grid-cols-2 lg:items-start">
      <section class="card-panel mfg-card">
        <header class="mfg-card__head">
          <h3 class="mfg-card__title">{{ pt('mfgPipeTorqueTitle') }}</h3>
          <p class="mfg-card__note">{{ pt('mfgPipeTorqueNote') }}</p>
        </header>

        <ul class="mfg-pipe-list">
          <li v-for="row in pipeTorqueRows" :key="row.size" class="mfg-pipe-row">
            <span class="mfg-pipe-row__size">{{ row.size }}</span>
            <div class="mfg-pipe-row__body">
              <div class="mfg-pipe-row__field">
                <span class="mfg-pipe-row__label">{{ pt('mfgTorqueRef') }}</span>
                <span class="mfg-pipe-row__value">{{ pt(row.torqueKey) }}</span>
              </div>
              <div class="mfg-pipe-row__field">
                <span class="mfg-pipe-row__label">{{ pt('mfgSealant') }}</span>
                <span class="mfg-pipe-row__value">{{ pt(row.sealKey) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section class="card-panel mfg-card">
        <header class="mfg-card__head">
          <h3 class="mfg-card__title">{{ pt('mfgChecklistTitle') }}</h3>
        </header>

        <ol class="mfg-check-list">
          <li v-for="(key, i) in checklistKeys" :key="key" class="mfg-check-item">
            <span class="mfg-check-item__num" aria-hidden="true">{{ i + 1 }}</span>
            <span class="mfg-check-item__text">{{ pt(key) }}</span>
          </li>
        </ol>

        <p class="mfg-aside">{{ pt('mfgIndependentNote') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pt: { type: Function, required: true },
})

const workflowSteps = ['select', 'tolerance', 'engagement', 'tap', 'verify']

const pipeTorqueRows = [
  { size: '1/8 NPT', torqueKey: 'mfgTorque_18', sealKey: 'mfgSeal_tape' },
  { size: '1/4 NPT', torqueKey: 'mfgTorque_14', sealKey: 'mfgSeal_tape' },
  { size: '1/2 NPT', torqueKey: 'mfgTorque_12', sealKey: 'mfgSeal_tape' },
  { size: 'G1/2', torqueKey: 'mfgTorque_g', sealKey: 'mfgSeal_gasket' },
  { size: 'R1/2', torqueKey: 'mfgTorque_r', sealKey: 'mfgSeal_tape' },
]

const checklistKeys = [
  'mfgCheck_1',
  'mfgCheck_2',
  'mfgCheck_3',
  'mfgCheck_4',
  'mfgCheck_5',
  'mfgCheck_6',
]
</script>

<style scoped>
.mfg-steps :deep(.el-step__description) {
  @apply text-xs leading-snug;
}

@media (max-width: 768px) {
  .mfg-steps :deep(.el-step__description) {
    display: none;
  }
  .mfg-steps :deep(.el-step__title) {
    @apply text-xs;
  }
}

.mfg-card__head {
  @apply mb-3;
}
.mfg-card__title {
  @apply text-base font-semibold text-gray-900 dark:text-gray-100;
}
.mfg-card__note {
  @apply mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400;
}

.mfg-pipe-list {
  @apply m-0 list-none space-y-2 p-0;
}
.mfg-pipe-row {
  @apply flex gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-900/35;
}
.mfg-pipe-row__size {
  @apply shrink-0 self-start rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary;
}
.mfg-pipe-row__body {
  @apply min-w-0 flex-1 space-y-1.5;
}
.mfg-pipe-row__field {
  @apply flex flex-col gap-0.5 sm:flex-row sm:gap-2;
}
.mfg-pipe-row__label {
  @apply shrink-0 text-[11px] text-gray-500 dark:text-gray-400 sm:w-16;
}
.mfg-pipe-row__value {
  @apply text-sm leading-snug text-gray-800 dark:text-gray-200;
}

.mfg-check-list {
  @apply m-0 list-none space-y-2 p-0;
}
.mfg-check-item {
  @apply flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900/35;
}
.mfg-check-item__num {
  @apply inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary;
}
.mfg-check-item__text {
  @apply pt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200;
}

.mfg-aside {
  @apply mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-400;
}
</style>
