<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <!-- 符号 + 公差带拖动 -->
      <el-tab-pane :label="pf('tabSymbols')" name="symbols">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <el-input v-model="search" clearable class="max-w-xs" :placeholder="pf('searchPlaceholder')" />
          <el-radio-group v-model="categoryFilter" size="small">
            <el-radio-button value="all">{{ pf('catAll') }}</el-radio-button>
            <el-radio-button v-for="c in GDT_CATEGORIES" :key="c.id" :value="c.id">
              {{ locale === 'en' ? c.labelEn : c.labelZh }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="card-panel gdt-symbol-board">
            <section v-for="cat in filteredCategories" :key="cat.id" class="gdt-symbol-cat">
              <h2 class="gdt-symbol-cat__title">{{ locale === 'en' ? cat.labelEn : cat.labelZh }}</h2>
              <div class="gdt-symbol-grid">
                <button
                  v-for="s in cat.symbols"
                  :key="s.id"
                  type="button"
                  class="gdt-symbol-card"
                  :class="{ 'is-active': selectedId === s.id }"
                  @click="selectSymbol(s.id)"
                >
                  <span class="gdt-symbol-card__glyph">{{ s.glyph }}</span>
                  <span class="gdt-symbol-card__text">
                    <span class="gdt-symbol-card__name">{{ locale === 'en' ? s.nameEn : s.nameZh }}</span>
                    <span class="gdt-symbol-card__note">{{ locale === 'en' ? s.nameZh : s.noteZh }}</span>
                  </span>
                </button>
              </div>
            </section>
          </div>
          <aside class="card-panel h-fit space-y-3 lg:sticky lg:top-4">
            <template v-if="selected">
              <div class="flex items-center gap-3">
                <span class="font-mono text-3xl">{{ selected.glyph }}</span>
                <div>
                  <h3 class="font-semibold">{{ locale === 'en' ? selected.nameEn : selected.nameZh }}</h3>
                  <p class="text-xs text-gray-500">{{ selected.categoryZh }}</p>
                </div>
              </div>
              <GdtZoneDiagram
                v-model:tolerance="zoneTol"
                :symbol-id="selected.id"
                :title="pf('zoneTitle')"
                :hint="selected.zoneZh"
                :captions="zoneCaptions"
              />
              <dl class="space-y-2 text-sm">
                <div>
                  <dt class="text-xs text-gray-500">{{ pf('detailUse') }}</dt>
                  <dd>{{ selected.useZh }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-500">{{ pf('detailMistake') }}</dt>
                  <dd class="text-warning">{{ selected.mistakeZh }}</dd>
                </div>
                <div v-if="selectedDepth?.inspectZh">
                  <dt class="text-xs text-gray-500">{{ pf('detailInspect') }}</dt>
                  <dd>{{ selectedDepth.inspectZh }}</dd>
                </div>
                <div v-if="selectedDepth?.costZh" class="flex gap-2">
                  <el-tag size="small">{{ pf('detailCost') }}：{{ selectedDepth.costZh }}</el-tag>
                </div>
              </dl>
              <div class="flex w-full flex-col gap-2">
                <el-button class="!m-0 !w-full" type="primary" size="small" @click="useInBuilder(selected.id)">{{ pf('useInBuilder') }}</el-button>
                <el-button class="!m-0 !w-full" size="small" @click="openCompareWith(selected.id)">{{ pf('compareThis') }}</el-button>
                <el-button class="!m-0 !w-full" size="small" @click="openDecodeFor(selected.id)">{{ pf('decodeThis') }}</el-button>
                <router-link class="block text-center text-xs text-primary" to="/quiz#gdt">{{ pf('gotoQuiz') }} →</router-link>
              </div>
            </template>
          </aside>
        </div>
      </el-tab-pane>

      <!-- 零件点选 -->
      <el-tab-pane :label="pf('tabPart')" name="part">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <GdtPartPlayground
              v-model="partFeatureId"
              :locale="locale"
              :title="pf('partTitle')"
              :hint="pf('partHint')"
              :aria="pf('partAria')"
              @pick-symbol="onPartPickSymbol"
            />
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('partAssigned') }}</h2>
            <p v-if="!Object.keys(partAssignments).length" class="text-sm text-gray-500">{{ pf('partEmpty') }}</p>
            <div v-else class="space-y-2">
              <div
                v-for="(symId, featId) in partAssignments"
                :key="featId"
                class="flex items-center justify-between gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
              >
                <span class="text-sm">{{ featureLabel(featId) }}</span>
                <span class="font-mono text-sm">{{ findGdtSymbol(symId)?.glyph }} {{ findGdtSymbol(symId)?.nameZh }}</span>
                <el-button link type="danger" size="small" @click="clearPartAssignment(featId)">{{ pf('remove') }}</el-button>
              </div>
            </div>
            <el-button class="mt-4" size="small" :disabled="!partFeatureId || !partPickSymbol" type="primary" @click="assignPartSymbol">
              {{ pf('assignSymbol') }}
            </el-button>
            <p v-if="partPickSymbol" class="mt-2 text-xs text-gray-500">
              {{ pf('willAssign') }}：{{ findGdtSymbol(partPickSymbol)?.glyph }} {{ findGdtSymbol(partPickSymbol)?.nameZh }}
            </p>
          </section>
        </div>
      </el-tab-pane>

      <!-- 对比 -->
      <el-tab-pane :label="pf('tabCompare')" name="compare">
        <section class="card-panel">
          <div class="mb-4 flex flex-wrap gap-2">
            <el-button
              v-for="p in GDT_COMPARE_PAIRS"
              :key="p.id"
              size="small"
              :type="comparePairId === p.id ? 'primary' : 'default'"
              @click="comparePairId = p.id"
            >
              {{ findGdtSymbol(p.leftId)?.glyph }} vs {{ findGdtSymbol(p.rightId)?.glyph }}
            </el-button>
          </div>
          <div v-if="comparePair" class="grid gap-4 md:grid-cols-2">
            <div
              v-for="side in [comparePair.leftId, comparePair.rightId]"
              :key="side"
              class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <p class="mb-2 font-mono text-2xl">
                {{ findGdtSymbol(side)?.glyph }}
                <span class="ml-2 text-base font-semibold">{{ findGdtSymbol(side)?.nameZh }}</span>
              </p>
              <GdtZoneDiagram
                :symbol-id="side"
                :tolerance="0.12"
                :title="findGdtSymbol(side)?.nameZh"
                :hint="findGdtSymbol(side)?.zoneZh"
                :captions="zoneCaptions"
              />
              <p class="mt-2 text-sm">{{ findGdtSymbol(side)?.useZh }}</p>
            </div>
          </div>
          <el-alert v-if="comparePair" class="mt-4" type="success" :closable="false" :title="comparePair.tipZh" />
        </section>
      </el-tab-pane>

      <!-- MMC 试算 -->
      <el-tab-pane :label="pf('tabMmc')" name="mmc">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('mmcTitle') }}</h2>
            <p class="mb-3 text-sm text-gray-500">{{ pf('mmcHint') }}</p>
            <el-form label-width="130px">
              <el-form-item :label="pf('mmcFeature')">
                <el-radio-group v-model="mmc.feature">
                  <el-radio value="hole">{{ pf('mmcHole') }}</el-radio>
                  <el-radio value="shaft">{{ pf('mmcShaft') }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="pf('mmcGeom')">
                <el-input-number v-model="mmc.geometricTol" :min="0.01" :max="2" :step="0.01" :precision="3" />
              </el-form-item>
              <el-form-item :label="pf('mmcSize')">
                <el-input-number v-model="mmc.mmcSize" :min="1" :max="200" :step="0.01" :precision="3" />
              </el-form-item>
              <el-form-item :label="pf('mmcActual')">
                <el-slider v-model="mmc.actualSize" :min="mmcSliderMin" :max="mmcSliderMax" :step="0.01" show-input />
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('mmcResult') }}</h2>
            <template v-if="mmcResult.ok">
              <div class="mb-4 h-3 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                <div class="h-full bg-primary transition-all" :style="{ width: `${mmcBarPct}%` }" />
              </div>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between"><dt>{{ pf('mmcBonus') }}</dt><dd class="font-mono">{{ mmcResult.bonus.toFixed(3) }}</dd></div>
                <div class="flex justify-between"><dt>{{ pf('mmcEffective') }}</dt><dd class="font-mono text-primary">{{ mmcResult.effectiveTol.toFixed(3) }}</dd></div>
              </dl>
              <p class="mt-3 text-xs text-gray-500">{{ pf('mmcNote') }}</p>
              <MathTex class="mt-3" expr="t_{\mathrm{eff}}=t_{\mathrm{geom}}+\mathrm{bonus}" block />
            </template>
          </section>
        </div>
      </el-tab-pane>

      <!-- 场景 -->
      <el-tab-pane :label="pf('tabScenario')" name="scenario">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('scenarioTitle') }}</h2>
            <el-radio-group v-model="scenarioId" class="flex flex-col items-start gap-2">
              <el-radio v-for="sc in GDT_SCENARIOS" :key="sc.id" :value="sc.id" class="!mr-0 h-auto whitespace-normal">
                {{ locale === 'en' ? sc.labelEn : sc.labelZh }}
              </el-radio>
            </el-radio-group>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('recommendTitle') }}</h2>
            <template v-if="scenarioRec">
              <p class="mb-3 text-sm">{{ scenarioRec.whyZh }}</p>
              <div class="space-y-2">
                <button
                  v-for="s in scenarioRec.symbols"
                  :key="s.id"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left dark:border-gray-700"
                  @click="selectSymbol(s.id); tab = 'symbols'"
                >
                  <span class="font-mono text-2xl">{{ s.glyph }}</span>
                  <span class="font-medium">{{ locale === 'en' ? s.nameEn : s.nameZh }}</span>
                </button>
              </div>
            </template>
          </section>
        </div>
      </el-tab-pane>

      <!-- 控制框拼装 + 框格解读 -->
      <el-tab-pane :label="pf('tabFrame')" name="frame">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-1 font-semibold">{{ pf('builderTitle') }}</h2>
            <p class="mb-4 text-sm text-gray-500">{{ pf('builderHint') }}</p>
            <el-form label-width="120px">
              <el-form-item :label="pf('builderExample')">
                <el-select
                  :model-value="activeExampleId || ''"
                  class="w-full"
                  clearable
                  :placeholder="pf('builderExamplePh')"
                  @change="onExampleSelect"
                  @clear="onExampleClear"
                >
                  <el-option
                    v-for="ex in GDT_DECODE_EXAMPLES"
                    :key="ex.id"
                    :label="locale === 'en' ? ex.titleEn : ex.titleZh"
                    :value="ex.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('builderSymbol')">
                <el-select v-model="builder.symbolId" filterable class="w-full">
                  <el-option
                    v-for="s in allSymbols"
                    :key="s.id"
                    :label="`${s.glyph} ${locale === 'en' ? s.nameEn : s.nameZh}`"
                    :value="s.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('builderTol')">
                <el-input-number v-model="builder.tolerance" :min="0.001" :max="10" :step="0.01" :precision="3" />
              </el-form-item>
              <el-form-item :label="pf('builderDia')">
                <el-switch v-model="builder.diameter" :disabled="diaDisabled" />
              </el-form-item>
              <el-form-item :label="pf('builderMod')">
                <el-radio-group v-model="builder.modifier" size="small">
                  <el-radio-button value="">{{ pf('modNone') }}</el-radio-button>
                  <el-radio-button value="mmc">Ⓜ</el-radio-button>
                  <el-radio-button value="lmc">Ⓛ</el-radio-button>
                  <el-radio-button value="rfs">Ⓢ</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="pf('builderDatums')">
                <div class="flex gap-2">
                  <el-input v-model="builder.datumA" class="w-16" maxlength="1" placeholder="A" />
                  <el-input v-model="builder.datumB" class="w-16" maxlength="1" placeholder="B" />
                  <el-input v-model="builder.datumC" class="w-16" maxlength="1" placeholder="C" />
                </div>
              </el-form-item>
            </el-form>
          </section>

          <section class="card-panel space-y-4">
            <div>
              <div class="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 class="font-semibold">{{ pf('previewTitle') }}</h2>
                  <p class="mt-0.5 text-xs text-gray-500">{{ pf('decodeClickHint') }}</p>
                </div>
                <el-button size="small" :disabled="!frame.ok" @click="copyFrame">{{ pf('copyFrame') }}</el-button>
              </div>
              <el-alert v-if="!frame.ok" type="warning" show-icon :closable="false" :title="pr(frame.errorKey || 'need_symbol')" class="mb-3" />
              <div class="flex justify-center rounded-lg bg-gray-50 px-3 py-5 dark:bg-gray-900/50">
                <GdtFeatureControlFrame
                  :cells="previewCells"
                  :interactive="frame.ok"
                  :active-index="frame.ok ? decodeSegIdx : -1"
                  :aria="pf('frameAria')"
                  @select="decodeSegIdx = $event"
                />
              </div>
              <ul v-if="frame.warnings?.length" class="mt-3 list-inside list-disc text-xs text-warning">
                <li v-for="w in frame.warnings" :key="w">{{ pr(`warn_${w}`) }}</li>
              </ul>
            </div>

            <div v-if="liveDecoded?.ok" class="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h2 class="mb-2 font-semibold">{{ pf('decodeDetail') }}</h2>
              <p class="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {{ liveDecoded.summaryZh }}
              </p>

              <div v-if="activeLiveSeg" class="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
                <p class="text-xs text-gray-500">{{ pf('decodeCell') }} · {{ activeLiveSeg.roleZh }}</p>
                <p class="my-1 font-mono text-2xl">{{ activeLiveSeg.cell }}</p>
                <p class="text-sm leading-relaxed">{{ activeLiveSeg.detailZh }}</p>
              </div>

              <ol class="mb-3 flex flex-wrap gap-1.5 text-sm">
                <li
                  v-for="(seg, i) in liveDecoded.segments"
                  :key="seg.roleKey || i"
                >
                  <button
                    type="button"
                    class="rounded border px-2.5 py-1 font-mono transition"
                    :class="decodeSegIdx === i
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-primary/40 dark:border-gray-700 dark:text-gray-300'"
                    @click="decodeSegIdx = i"
                  >
                    {{ seg.cell }}
                    <span class="ml-1 font-sans text-xs opacity-70">{{ seg.roleZh }}</span>
                  </button>
                </li>
              </ol>

              <ul v-if="liveDecoded.rulesZh?.length" class="mb-3 list-inside list-disc text-xs text-gray-500">
                <li v-for="(r, i) in liveDecoded.rulesZh" :key="i">{{ r }}</li>
              </ul>
              <p v-if="liveDecoded.inspectZh" class="text-xs text-gray-500">
                {{ pf('detailInspect') }}：{{ liveDecoded.inspectZh }}
                <el-tag v-if="liveDecoded.costZh" size="small" class="ml-2">{{ pf('detailCost') }}：{{ liveDecoded.costZh }}</el-tag>
              </p>
            </div>
          </section>
        </div>
      </el-tab-pane>

      <!-- 基准体系 -->
      <el-tab-pane :label="pf('tabDrf')" name="drf">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('drfTitle') }}</h2>
            <p class="mb-3 text-sm text-gray-500">{{ pf('drfHint') }}</p>
            <el-form label-width="110px">
              <el-form-item :label="pf('drfPrimary')">
                <el-select v-model="drf.primary" class="w-40">
                  <el-option value="plane" :label="pf('drfPlane')" />
                  <el-option value="axis" :label="pf('drfAxis')" />
                  <el-option value="" :label="pf('drfNone')" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('drfSecondary')">
                <el-select v-model="drf.secondary" class="w-40">
                  <el-option value="plane" :label="pf('drfPlane')" />
                  <el-option value="axis" :label="pf('drfAxis')" />
                  <el-option value="" :label="pf('drfNone')" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('drfTertiary')">
                <el-select v-model="drf.tertiary" class="w-40">
                  <el-option value="plane" :label="pf('drfPlane')" />
                  <el-option value="point" :label="pf('drfPoint')" />
                  <el-option value="" :label="pf('drfNone')" />
                </el-select>
              </el-form-item>
            </el-form>
            <ul class="mt-2 space-y-1 text-xs text-gray-500">
              <li v-for="s in drfResult.steps" :key="s.rank">
                {{ s.label }} · {{ s.type }} · {{ pf('drfLocks') }} {{ s.lock }}
              </li>
            </ul>
          </section>
          <section class="card-panel">
            <GdtDrfDiagram
              :primary="drf.primary"
              :secondary="drf.secondary"
              :tertiary="drf.tertiary"
              :locked="drfResult.locked"
              :remaining="drfResult.remaining"
              :complete="drfResult.complete"
              :tip="drfResult.tipZh"
              :title="pf('drfDiagramTitle')"
              :status-text="drfResult.complete ? pf('drfComplete') : pf('drfIncomplete')"
              :labels="{ plane: pf('drfPlane'), axis: pf('drfAxis'), point: pf('drfPoint'), none: pf('drfNone') }"
            />
          </section>
        </div>
      </el-tab-pane>

      <!-- 虚拟条件 + 预算 -->
      <el-tab-pane :label="pf('tabVirtual')" name="virtual">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('vcTitle') }}</h2>
            <p class="mb-3 text-sm text-gray-500">{{ pf('vcHint') }}</p>
            <el-form label-width="130px">
              <el-form-item :label="pf('mmcFeature')">
                <el-radio-group v-model="vc.feature">
                  <el-radio value="hole">{{ pf('mmcHole') }}</el-radio>
                  <el-radio value="shaft">{{ pf('mmcShaft') }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="pf('mmcSize')">
                <el-input-number v-model="vc.mmcSize" :min="1" :precision="3" :step="0.01" />
              </el-form-item>
              <el-form-item :label="pf('mmcGeom')">
                <el-slider v-model="vc.geometricTol" :min="0" :max="0.5" :step="0.01" show-input />
              </el-form-item>
            </el-form>
            <template v-if="vcResult.ok">
              <dl class="mt-3 space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt>{{ pf('vcValue') }}</dt>
                  <dd class="font-mono text-primary">{{ vcResult.virtualCondition.toFixed(3) }}</dd>
                </div>
              </dl>
              <p class="mt-2 text-xs text-gray-500">{{ vcResult.formulaZh }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ vcResult.gageHint }}</p>
              <MathTex class="mt-3" :expr="vc.feature === 'hole' ? 'VC=MMC-t' : 'VC=MMC+t'" block />
            </template>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('budgetTitle') }}</h2>
            <p class="mb-3 text-sm text-gray-500">{{ pf('budgetHint') }}</p>
            <el-form label-width="130px">
              <el-form-item :label="pf('builderTol')">
                <el-input-number v-model="budget.tolerance" :min="0.01" :step="0.01" :precision="3" />
              </el-form-item>
              <el-form-item :label="pf('budgetCount')">
                <el-input-number v-model="budget.featureCount" :min="1" :max="20" />
              </el-form-item>
              <el-form-item :label="pf('budgetMethod')">
                <el-radio-group v-model="budget.method">
                  <el-radio value="worst">{{ pf('budgetWorst') }}</el-radio>
                  <el-radio value="rss">RSS</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
            <template v-if="budgetResult.ok">
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between"><dt>{{ pf('budgetHalf') }}</dt><dd class="font-mono">±{{ budgetResult.halfBand.toFixed(4) }}</dd></div>
                <div class="flex justify-between"><dt>{{ pf('budgetStack') }}</dt><dd class="font-mono text-primary">{{ budgetResult.stackUp.toFixed(4) }}</dd></div>
              </dl>
              <p class="mt-2 text-xs text-gray-500">{{ budgetResult.tipZh }}</p>
              <router-link class="mt-3 inline-block text-sm text-primary" to="/gdt-stack">{{ pf('gotoGdtStack') }} →</router-link>
            </template>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabModifiers')" name="modifiers">
        <section class="card-panel">
          <el-table :data="GDT_MODIFIERS" size="small" border>
            <el-table-column :label="pr('colGlyph')" width="80" align="center">
              <template #default="{ row }"><span class="font-mono text-xl">{{ row.glyph }}</span></template>
            </el-table-column>
            <el-table-column :label="pr('colName')" min-width="140">
              <template #default="{ row }">{{ locale === 'en' ? row.nameEn : row.nameZh }}</template>
            </el-table-column>
            <el-table-column :label="pf('modTip')" min-width="220">
              <template #default="{ row }">{{ row.tipZh }}</template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>
    </el-tabs>

    <RelatedToolsPanel tool-id="gdt-symbols" class="mt-4" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  GDT_CATEGORIES,
  GDT_MODIFIERS,
  GDT_SCENARIOS,
  GDT_COMPARE_PAIRS,
  GDT_PART_FEATURES,
  listAllGdtSymbols,
  findGdtSymbol,
  buildFeatureControlFrame,
  recommendForScenario,
  calcMmcBonus,
} from '@/constants/gdt-symbols'
import {
  GDT_DECODE_EXAMPLES,
  decodeFeatureControlFrame,
  getSymbolDepth,
  analyzeDatumReferenceFrame,
  calcVirtualCondition,
  estimatePositionBudget,
} from '@/constants/gdt-depth'
import GdtZoneDiagram from '@/components/gdt/GdtZoneDiagram.vue'
import GdtPartPlayground from '@/components/gdt/GdtPartPlayground.vue'
import GdtDrfDiagram from '@/components/gdt/GdtDrfDiagram.vue'
import GdtFeatureControlFrame from '@/components/gdt/GdtFeatureControlFrame.vue'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'
import MathTex from '@/components/common/MathTex.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useLocale } from '@/composables/useLocale'

const { pt, pf, pr } = useCalcPage('gdt-symbols')
const { locale: localeRef } = useLocale()
const locale = computed(() => (String(localeRef.value || 'zh').startsWith('en') ? 'en' : 'zh'))

const tab = ref('symbols')
const search = ref('')
const categoryFilter = ref('all')
const selectedId = ref('position')
const zoneTol = ref(0.1)
const zoneCaptions = computed(() => ({
  straightness: pf('zoneCapStraightness'),
  flatness: pf('zoneCapFlatness'),
  circularity: pf('zoneCapCircularity'),
  cylindricity: pf('zoneCapCylindricity'),
  profile_line: pf('zoneCapProfileLine'),
  profile_surface: pf('zoneCapProfileSurface'),
  parallelism: pf('zoneCapParallelism'),
  perpendicularity: pf('zoneCapPerpendicularity'),
  angularity: pf('zoneCapAngularity'),
  position: pf('zoneCapPosition'),
  concentricity: pf('zoneCapConcentricity'),
  symmetry: pf('zoneCapSymmetry'),
  circular_runout: pf('zoneCapCircularRunout'),
  total_runout: pf('zoneCapTotalRunout'),
}))
const scenarioId = ref('hole_pattern')
const comparePairId = ref(GDT_COMPARE_PAIRS[0].id)
const decodeSegIdx = ref(0)

const drf = reactive({
  primary: 'plane',
  secondary: 'plane',
  tertiary: 'plane',
})

const vc = reactive({
  feature: 'hole',
  mmcSize: 10,
  geometricTol: 0.1,
})

const budget = reactive({
  tolerance: 0.1,
  featureCount: 4,
  method: 'rss',
})

const partFeatureId = ref('bore')
const partPickSymbol = ref('')
const partAssignments = reactive({})

const mmc = reactive({
  feature: 'hole',
  geometricTol: 0.1,
  mmcSize: 10.0,
  actualSize: 10.05,
})

const allSymbols = computed(() => listAllGdtSymbols())
const selected = computed(() => findGdtSymbol(selectedId.value))
const selectedDepth = computed(() => getSymbolDepth(selectedId.value))
const scenarioRec = computed(() => recommendForScenario(scenarioId.value))
const comparePair = computed(() => GDT_COMPARE_PAIRS.find((p) => p.id === comparePairId.value))
const drfResult = computed(() => analyzeDatumReferenceFrame(drf))
const vcResult = computed(() => calcVirtualCondition(vc))
const budgetResult = computed(() => estimatePositionBudget(budget))

const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  return GDT_CATEGORIES.map((cat) => {
    if (categoryFilter.value !== 'all' && cat.id !== categoryFilter.value) return null
    const symbols = cat.symbols.filter((s) => {
      if (!q) return true
      return `${s.nameZh} ${s.nameEn} ${s.noteZh} ${s.useZh} ${s.id}`.toLowerCase().includes(q)
    })
    if (!symbols.length) return null
    return { ...cat, symbols }
  }).filter(Boolean)
})

const builder = reactive({
  symbolId: 'position',
  tolerance: 0.1,
  diameter: true,
  modifier: 'mmc',
  datumA: 'A',
  datumB: 'B',
  datumC: '',
})

const builderSymbol = computed(() => findGdtSymbol(builder.symbolId))
const diaDisabled = computed(() => builderSymbol.value?.diameterZone === 'no')

watch(
  () => builder.symbolId,
  (id) => {
    const s = findGdtSymbol(id)
    if (!s) return
    if (s.diameterZone === 'no') builder.diameter = false
    else if (s.diameterZone === 'usual') builder.diameter = true
  },
)

const frame = computed(() =>
  buildFeatureControlFrame({
    symbolId: builder.symbolId,
    tolerance: builder.tolerance,
    diameter: builder.diameter,
    modifier: builder.modifier,
    datums: [builder.datumA, builder.datumB, builder.datumC],
  }),
)
const previewCells = computed(() => (frame.value.ok ? frame.value.cells : builderSymbol.value ? [builderSymbol.value.glyph, '—'] : ['—']))

const liveDecoded = computed(() =>
  decodeFeatureControlFrame({
    symbolId: builder.symbolId,
    tolerance: builder.tolerance,
    diameter: builder.diameter,
    modifier: builder.modifier,
    datums: [builder.datumA, builder.datumB, builder.datumC],
  }),
)
const activeLiveSeg = computed(() => liveDecoded.value?.segments?.[decodeSegIdx.value] ?? null)

watch(
  () => [builder.symbolId, builder.tolerance, builder.diameter, builder.modifier, builder.datumA, builder.datumB, builder.datumC],
  () => {
    decodeSegIdx.value = 0
  },
)

watch(
  () => liveDecoded.value?.segments?.length,
  (n) => {
    if (decodeSegIdx.value >= (n || 0)) decodeSegIdx.value = 0
  },
)

const activeExampleId = computed(() => {
  const norm = (d) => String(d || '').trim().toUpperCase()
  const hit = GDT_DECODE_EXAMPLES.find((ex) => {
    const inp = ex.input
    return (
      inp.symbolId === builder.symbolId &&
      Number(inp.tolerance) === Number(builder.tolerance) &&
      !!inp.diameter === !!builder.diameter &&
      (inp.modifier || '') === (builder.modifier || '') &&
      norm(inp.datums?.[0]) === norm(builder.datumA) &&
      norm(inp.datums?.[1]) === norm(builder.datumB) &&
      norm(inp.datums?.[2]) === norm(builder.datumC)
    )
  })
  return hit?.id ?? ''
})

const mmcResult = computed(() => calcMmcBonus(mmc))
const mmcSliderMin = computed(() => (mmc.feature === 'hole' ? mmc.mmcSize : mmc.mmcSize - 0.2))
const mmcSliderMax = computed(() => (mmc.feature === 'hole' ? mmc.mmcSize + 0.2 : mmc.mmcSize))
const mmcBarPct = computed(() => {
  if (!mmcResult.value.ok) return 0
  const max = mmc.geometricTol + 0.2
  return Math.min(100, (mmcResult.value.effectiveTol / max) * 100)
})

watch(
  () => mmc.feature,
  (f) => {
    if (f === 'hole') {
      mmc.mmcSize = 10
      mmc.actualSize = 10.05
    } else {
      mmc.mmcSize = 10
      mmc.actualSize = 9.95
    }
  },
)

function selectSymbol(id) {
  selectedId.value = id
}

function useInBuilder(id) {
  if (!id) return
  builder.symbolId = id
  selectedId.value = id
  tab.value = 'frame'
}

function openCompareWith(id) {
  const pair = GDT_COMPARE_PAIRS.find((p) => p.leftId === id || p.rightId === id)
  if (pair) comparePairId.value = pair.id
  tab.value = 'compare'
}

function openDecodeFor(symbolId) {
  const hit = GDT_DECODE_EXAMPLES.find((e) => e.input.symbolId === symbolId)
  loadExample(hit?.id ?? GDT_DECODE_EXAMPLES[0].id)
}

function loadExample(id) {
  const ex = GDT_DECODE_EXAMPLES.find((e) => e.id === id)
  if (!ex) return
  const inp = ex.input
  builder.symbolId = inp.symbolId
  builder.tolerance = inp.tolerance
  builder.diameter = !!inp.diameter
  builder.modifier = inp.modifier || ''
  builder.datumA = inp.datums?.[0] || ''
  builder.datumB = inp.datums?.[1] || ''
  builder.datumC = inp.datums?.[2] || ''
  decodeSegIdx.value = 0
  tab.value = 'frame'
}

function onExampleSelect(id) {
  if (id) loadExample(id)
}

function onExampleClear() {
  // 保持当前拼装内容，仅取消「匹配示例」高亮（改任一字段即可）
}

function onPartPickSymbol(id) {
  partPickSymbol.value = id
}

function assignPartSymbol() {
  if (!partFeatureId.value || !partPickSymbol.value) return
  partAssignments[partFeatureId.value] = partPickSymbol.value
}

function clearPartAssignment(featId) {
  delete partAssignments[featId]
}

function featureLabel(id) {
  const f = GDT_PART_FEATURES.find((x) => x.id === id)
  return f ? (locale.value === 'en' ? f.labelEn : f.labelZh) : id
}

async function copyFrame() {
  if (!frame.value.ok) return
  try {
    await navigator.clipboard.writeText(frame.value.text)
    ElMessage.success(pf('copied'))
  } catch {
    ElMessage.warning(pf('copyFail'))
  }
}
</script>

<style scoped>
.gdt-symbol-board {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.85rem 1rem;
}

.gdt-symbol-cat + .gdt-symbol-cat {
  padding-top: 0.85rem;
  border-top: 1px solid var(--el-border-color-lighter);
}

.gdt-symbol-cat__title {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--el-text-color-secondary);
}

.gdt-symbol-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .gdt-symbol-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .gdt-symbol-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gdt-symbol-card {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 3.25rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 0.5rem;
  background: transparent;
  text-align: left;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.gdt-symbol-card:hover {
  border-color: var(--el-color-primary);
}

.gdt-symbol-card.is-active {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.gdt-symbol-card__glyph {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.35rem;
  background: var(--el-fill-color-light);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.25rem;
  line-height: 1;
}

.gdt-symbol-card__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.gdt-symbol-card__name {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--el-text-color-primary);
}

.gdt-symbol-card__note {
  font-size: 0.7rem;
  line-height: 1.25;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
