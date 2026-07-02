<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="shrink-0"
  >
    <rect width="32" height="32" rx="7" fill="url(#mb-grad)" />
    <path
      d="M16 7.5a4.5 4.5 0 0 0-3.5 7.2l-2.1 2.1a1 1 0 0 0 1.4 1.4l2.1-2.1A4.5 4.5 0 1 0 16 7.5Z"
      fill="white"
      opacity="0.95"
    />
    <circle cx="16" cy="12" r="2.2" fill="#409EFF" />
    <path
      d="M8 22h4l1.5-3 2 3.5 2-3.5 1.5 3h4"
      stroke="white"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient id="mb-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stop-color="#409EFF" />
        <stop offset="1" stop-color="#2B7CD3" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
})
</script>
