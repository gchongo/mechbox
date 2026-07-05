<template>
  <template v-for="(block, bi) in data.blocks" :key="bi">
    <!-- 模式对照表 -->
    <section v-if="block.type === 'modes'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colMode ?? '模式' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colModel ?? '模型/功能' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colPass ?? '通过 / 放行' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colCaveat ?? '注意' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="align-top">
              <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.mode }}</td>
              <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
                <MathContent :text="row.features ?? row.model" />
              </td>
              <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
                <MathContent :text="row.passRule" />
              </td>
              <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.caveat }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 公式块 -->
    <section v-else-if="block.type === 'formulas'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <div class="space-y-3">
        <div
          v-for="(row, i) in block.items"
          :key="i"
          class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
        >
          <h4 class="mb-1 text-sm font-semibold">{{ row.name }}</h4>
          <MathTex :expr="row.latex" block />
          <p v-if="row.note" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <MathContent :text="row.note" />
          </p>
        </div>
      </div>
    </section>

    <!-- 判定依据表 -->
    <section v-else-if="block.type === 'passChecks'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-[520px] border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colCheck ?? '检查项' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colRule ?? '规则' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="align-top">
              <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.check }}</td>
              <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
                <MathContent :text="row.rule" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 通用对照表 -->
    <section v-else-if="block.type === 'compareTable'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <p v-if="block.intro" class="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <MathContent :text="block.intro" />
      </p>
      <div
        v-if="block.sharedInputs?.length"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
      >
        <h4 v-if="block.sharedTitle" class="mb-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
          {{ block.sharedTitle }}
        </h4>
        <ul class="help-list text-xs text-amber-900 dark:text-amber-200">
          <li v-for="(item, i) in block.sharedInputs" :key="i">
            <MathContent :text="item" />
          </li>
        </ul>
      </div>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <th
                v-for="col in block.columns"
                :key="col.key"
                class="border border-gray-200 px-2 py-2 dark:border-gray-700"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="align-top">
              <td
                v-for="col in block.columns"
                :key="col.key"
                class="border border-gray-200 px-2 py-2 dark:border-gray-700"
                :class="{ 'font-medium': col.key === block.rowKey }"
              >
                <MathContent :text="row[col.key]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="block.conclusion" class="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <MathContent :text="block.conclusion" />
      </p>
    </section>

    <!-- 教材式指南 -->
    <section v-else-if="block.type === 'guide'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <p v-if="block.intro" class="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <MathContent :text="block.intro" />
      </p>
      <div v-if="block.paragraphs?.length" class="mb-4 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <p v-for="(p, i) in block.paragraphs" :key="i">
          <MathContent :text="p" />
        </p>
      </div>
      <div
        v-for="(sec, i) in block.sections"
        :key="i"
        class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
      >
        <h4 class="mb-2 text-sm font-semibold">{{ sec.title }}</h4>
        <p v-if="sec.body" class="mb-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <MathContent :text="sec.body" />
        </p>
        <ul v-if="sec.bullets?.length" class="help-list text-xs">
          <li v-for="(bullet, j) in sec.bullets" :key="j">
            <MathContent :text="bullet" />
          </li>
        </ul>
      </div>
      <div v-if="block.examples?.length" class="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          v-for="(ex, i) in block.examples"
          :key="i"
          class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <h4 class="mb-1 text-sm font-semibold text-primary">{{ ex.label }}</h4>
          <p class="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            <MathContent :text="ex.detail" />
          </p>
        </div>
      </div>
    </section>

    <!-- 算例步骤 -->
    <section v-else-if="block.type === 'examples'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.subtitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ block.subtitle }}</p>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-[520px] border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <th class="w-28 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colStep ?? '步骤' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colDetail ?? '说明' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="align-top">
              <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.step }}</td>
              <td class="border border-gray-200 px-2 py-2 leading-relaxed dark:border-gray-700">
                <MathContent :text="row.detail" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 如何让判定通过 -->
    <section v-else-if="block.type === 'howToPass'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <div class="grid gap-4" :class="block.columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'">
        <div
          v-for="(item, i) in block.items"
          :key="i"
          class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <h4 class="mb-2 text-sm font-semibold text-primary">{{ item.goal }}</h4>
          <ol class="help-list list-decimal text-xs">
            <li v-for="(step, j) in item.steps" :key="j" class="mb-1">
              <MathContent :text="step" />
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section v-else-if="block.type === 'faq'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full min-w-[520px] border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <th class="w-2/5 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colQ ?? '问题' }}</th>
              <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ block.colA ?? '解答' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in block.rows" :key="i" class="align-top">
              <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.q }}</td>
              <td class="border border-gray-200 px-2 py-2 leading-relaxed dark:border-gray-700">
                <MathContent :text="row.a" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 页面说明 + 可选双栏列表 -->
    <section v-else-if="block.type === 'pageNotes'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <ul v-if="block.notes?.length" class="help-list mb-4 text-xs">
        <li v-for="(note, i) in block.notes" :key="i">
          <MathContent :text="note" />
        </li>
      </ul>
      <p v-if="block.confirmNote" class="mb-2 text-xs text-gray-500">
        <MathContent :text="block.confirmNote" />
      </p>
      <p v-if="block.extraNote" class="mb-3 text-xs text-amber-700 dark:text-amber-400">
        <MathContent :text="block.extraNote" />
      </p>
      <div v-if="block.lists?.length" class="grid gap-4 sm:grid-cols-2">
        <div v-for="(list, i) in block.lists" :key="i" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <h4 class="mb-2 text-sm font-semibold">{{ list.title }}</h4>
          <ul class="help-list text-xs">
            <li v-for="(item, j) in list.items" :key="j">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 适用边界 -->
    <section v-else-if="block.type === 'limitations'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <ul class="help-list">
        <li v-for="(item, i) in block.items" :key="i">
          <MathContent :text="item" />
        </li>
      </ul>
    </section>

    <!-- 标准引用 -->
    <section v-else-if="block.type === 'standards'" class="help-section">
      <h3 class="help-section__title">{{ block.title }}</h3>
      <p v-if="block.intro" class="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <MathContent :text="block.intro" />
      </p>
      <ul class="help-list text-sm">
        <li v-for="(item, i) in block.items" :key="i">
          <MathContent :text="item" />
        </li>
      </ul>
    </section>
  </template>
</template>

<script setup>
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'

defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.help-list {
  margin: 0;
  padding-left: 1.15rem;
  line-height: 1.7;
}
</style>
