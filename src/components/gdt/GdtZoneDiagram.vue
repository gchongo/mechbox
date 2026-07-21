<template>
  <div class="gdt-zone">
    <header class="mb-2 flex items-center justify-between gap-2">
      <h4 class="text-sm font-semibold">{{ title }}</h4>
      <span class="font-mono text-xs text-gray-500">t={{ localTol.toFixed(2) }}</span>
    </header>
    <svg class="gdt-zone__svg" viewBox="0 0 320 200" role="img" :aria-label="aria">
      <!-- 直线度：线要素在两平行线之间 -->
      <g v-if="sid === 'straightness'">
        <line x1="40" y1="70" x2="280" y2="70" class="zone" />
        <line x1="40" y1="130" x2="280" y2="130" class="zone" />
        <path :d="`M45 ${100 - wobble} L100 ${100 + wobble / 2} L180 ${100 - wobble} L275 ${100 + wobble / 3}`" class="actual" fill="none" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.straightness }}</text>
      </g>

      <!-- 平面度：面在两平行平面之间 -->
      <g v-else-if="sid === 'flatness'">
        <!-- 两个相互平行、间距为 t 的边界平面 -->
        <polygon :points="flatTopPlane" class="zone-plane" />
        <polygon :points="flatBottomPlane" class="zone-plane zone-plane--lower" />

        <!-- 被测实际表面，须全部落在两个边界平面之间 -->
        <path :d="flatActualBackPath" class="actual" fill="none" />
        <path :d="flatActualFrontPath" class="actual" fill="none" />
        <line :x1="72" :y1="flatActualBackLeftY" :x2="52" :y2="flatActualFrontLeftY" class="actual actual-light" />
        <line :x1="248" :y1="flatActualBackRightY" :x2="228" :y2="flatActualFrontRightY" class="actual actual-light" />

        <line x1="274" :y1="flatTopY" x2="274" :y2="flatBottomY" class="tol-mark" />
        <line x1="270" :y1="flatTopY" x2="278" :y2="flatTopY" class="tol-mark" />
        <line x1="270" :y1="flatBottomY" x2="278" :y2="flatBottomY" class="tol-mark" />
        <text x="284" :y="(flatTopY + flatBottomY) / 2 + 3" class="tol-label">t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.flatness }}</text>
      </g>

      <!-- 圆度：截面两同心圆 -->
      <g v-else-if="sid === 'circularity'">
        <circle cx="160" cy="105" :r="circularityOuterRadius" class="zone" fill="none" />
        <circle cx="160" cy="105" :r="circularityInnerRadius" class="zone" fill="none" />
        <path :d="circularityActualPath" class="actual" fill="none" />
        <line
          x1="160"
          y1="105"
          :x2="160 + circularityOuterRadius"
          y2="105"
          stroke="#94a3b8"
          stroke-dasharray="3 2"
        />
        <line
          :x1="160 + circularityInnerRadius"
          y1="101"
          :x2="160 + circularityInnerRadius"
          y2="109"
          class="tol-mark"
        />
        <line
          :x1="160 + circularityOuterRadius"
          y1="101"
          :x2="160 + circularityOuterRadius"
          y2="109"
          class="tol-mark"
        />
        <line
          :x1="160 + circularityInnerRadius"
          y1="105"
          :x2="160 + circularityOuterRadius"
          y2="105"
          class="tol-mark"
        />
        <text :x="160 + (circularityInnerRadius + circularityOuterRadius) / 2" y="97" text-anchor="middle" class="tol-label">t</text>
        <line x1="40" y1="105" x2="60" y2="105" stroke="#64748b" />
        <text x="28" y="108" class="lbl-sm">截面</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.circularity }}</text>
      </g>

      <!-- 圆柱度：全长位于半径差为 t 的两同轴圆柱面之间 -->
      <g v-else-if="sid === 'cylindricity'">
        <line x1="52" y1="100" x2="268" y2="100" class="axis" />

        <!-- 外边界圆柱面 -->
        <ellipse cx="80" cy="100" rx="23" :ry="cylOuterRadius" class="zone" fill="none" />
        <ellipse cx="240" cy="100" rx="23" :ry="cylOuterRadius" class="zone" fill="none" />
        <line x1="80" :y1="100 - cylOuterRadius" x2="240" :y2="100 - cylOuterRadius" class="zone" />
        <line x1="80" :y1="100 + cylOuterRadius" x2="240" :y2="100 + cylOuterRadius" class="zone" />

        <!-- 内边界圆柱面；与外边界的半径差为 t -->
        <ellipse cx="80" cy="100" rx="18" :ry="cylInnerRadius" class="zone zone-inner" fill="none" />
        <ellipse cx="240" cy="100" rx="18" :ry="cylInnerRadius" class="zone zone-inner" fill="none" />
        <line x1="80" :y1="100 - cylInnerRadius" x2="240" :y2="100 - cylInnerRadius" class="zone zone-inner" />
        <line x1="80" :y1="100 + cylInnerRadius" x2="240" :y2="100 + cylInnerRadius" class="zone zone-inner" />

        <!-- 实际圆柱面（全长形状误差示意） -->
        <path :d="cylActualTopPath" class="actual" fill="none" />
        <path :d="cylActualBottomPath" class="actual" fill="none" />
        <ellipse cx="80" cy="100" rx="20" :ry="cylActualLeftRadius" class="actual" fill="none" />
        <ellipse cx="240" cy="100" rx="20" :ry="cylActualRightRadius" class="actual" fill="none" />

        <line x1="264" :y1="100 - cylOuterRadius" x2="264" :y2="100 - cylInnerRadius" class="tol-mark" />
        <line x1="260" :y1="100 - cylOuterRadius" x2="268" :y2="100 - cylOuterRadius" class="tol-mark" />
        <line x1="260" :y1="100 - cylInnerRadius" x2="268" :y2="100 - cylInnerRadius" class="tol-mark" />
        <text x="274" :y="100 - (cylOuterRadius + cylInnerRadius) / 2 + 3" class="tol-label">t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.cylindricity }}</text>
      </g>

      <!-- 线轮廓度：沿名义曲线的等距带（2D） -->
      <g v-else-if="sid === 'profile_line'">
        <path :d="profileLineNominalPath" class="nominal" fill="none" />
        <path :d="profileLineUpperPath" class="zone" fill="none" />
        <path :d="profileLineLowerPath" class="zone" fill="none" />
        <path :d="profileLineActualPath" class="actual" fill="none" />
        <line
          :x1="profileLineMarker.lower.x"
          :y1="profileLineMarker.lower.y"
          :x2="profileLineMarker.upper.x"
          :y2="profileLineMarker.upper.y"
          class="tol-mark"
        />
        <text :x="profileLineMarker.label.x" :y="profileLineMarker.label.y" class="tol-label">t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.profile_line }}</text>
      </g>

      <!-- 面轮廓度：名义曲面 + 法向等距壳（示意网格） -->
      <g v-else-if="sid === 'profile_surface'">
        <path :d="profileSurfaceNominalFront" class="nominal" fill="none" />
        <path :d="profileSurfaceNominalBack" class="nominal" fill="none" />
        <line x1="48" y1="130" x2="70" y2="114" class="nominal" />
        <line x1="250" y1="78" x2="272" y2="62" class="nominal" />

        <path :d="profileSurfaceUpperFront" class="zone" fill="none" />
        <path :d="profileSurfaceLowerFront" class="zone" fill="none" />
        <path :d="profileSurfaceUpperBack" class="zone zone-inner" fill="none" />
        <path :d="profileSurfaceLowerBack" class="zone zone-inner" fill="none" />
        <line :x1="profileSurfaceStart.upperFront.x" :y1="profileSurfaceStart.upperFront.y" :x2="profileSurfaceStart.upperBack.x" :y2="profileSurfaceStart.upperBack.y" class="zone" />
        <line :x1="profileSurfaceStart.lowerFront.x" :y1="profileSurfaceStart.lowerFront.y" :x2="profileSurfaceStart.lowerBack.x" :y2="profileSurfaceStart.lowerBack.y" class="zone" />

        <path :d="profileSurfaceActualFront" class="actual" fill="none" />
        <path :d="profileSurfaceActualBack" class="actual actual-light" fill="none" />
        <line
          :x1="profileSurfaceMarker.lower.x"
          :y1="profileSurfaceMarker.lower.y"
          :x2="profileSurfaceMarker.upper.x"
          :y2="profileSurfaceMarker.upper.y"
          class="tol-mark"
        />
        <text :x="profileSurfaceMarker.label.x" :y="profileSurfaceMarker.label.y" class="tol-label">t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.profile_surface }}</text>
      </g>

      <!-- 平行度：相对基准面的平行带 -->
      <g v-else-if="sid === 'parallelism'">
        <!-- 基准平面 A -->
        <polygon points="48,153 242,153 272,136 78,136" class="datum-plane" />
        <line x1="78" y1="136" x2="272" y2="136" class="datum-edge" />
        <text x="55" y="170" class="lbl-sm">A</text>

        <!-- 与基准 A 平行、间距为 t 的两个边界平面 -->
        <polygon :points="parallelTopPlane" class="zone-plane" />
        <polygon :points="parallelBottomPlane" class="zone-plane zone-plane--lower" />

        <!-- 实际被测表面 -->
        <path :d="parallelActualBackPath" class="actual" fill="none" />
        <path :d="parallelActualFrontPath" class="actual" fill="none" />
        <line x1="75" :y1="parallelActualBackLeftY" x2="55" :y2="parallelActualFrontLeftY" class="actual actual-light" />
        <line x1="251" :y1="parallelActualBackRightY" x2="231" :y2="parallelActualFrontRightY" class="actual actual-light" />

        <line x1="278" :y1="parallelTopY" x2="278" :y2="parallelBottomY" class="tol-mark" />
        <line x1="274" :y1="parallelTopY" x2="282" :y2="parallelTopY" class="tol-mark" />
        <line x1="274" :y1="parallelBottomY" x2="282" :y2="parallelBottomY" class="tol-mark" />
        <text x="288" :y="(parallelTopY + parallelBottomY) / 2 + 3" class="tol-label">t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.parallelism }}</text>
      </g>

      <!-- 垂直度：相对基准的垂直带 / 圆柱带示意 -->
      <g v-else-if="sid === 'perpendicularity'">
        <!-- 基准平面 A -->
        <polygon points="42,157 238,157 274,137 78,137" class="datum-plane" />
        <line x1="78" y1="137" x2="274" y2="137" class="datum-edge" />
        <text x="48" y="174" class="lbl-sm">A</text>

        <!-- 两个互相平行、与基准 A 垂直、间距为 t 的边界平面 -->
        <polygon :points="perpendicularLeftPlane" class="zone-plane-vertical" />
        <polygon :points="perpendicularRightPlane" class="zone-plane-vertical zone-plane--lower" />
        <line
          :x1="perpendicularLeftX"
          y1="50"
          :x2="perpendicularRightX"
          y2="50"
          class="tol-mark"
        />
        <line :x1="perpendicularLeftX" y1="46" :x2="perpendicularLeftX" y2="54" class="tol-mark" />
        <line :x1="perpendicularRightX" y1="46" :x2="perpendicularRightX" y2="54" class="tol-mark" />
        <text :x="(perpendicularLeftX + perpendicularRightX) / 2" y="42" text-anchor="middle" class="tol-label">t</text>

        <!-- 实际被测面，完整位于两边界平面之间 -->
        <path :d="perpendicularActualFrontPath" class="actual" fill="none" />
        <path :d="perpendicularActualBackPath" class="actual actual-light" fill="none" />
        <line
          :x1="perpendicularActualBottomX"
          y1="137"
          :x2="perpendicularActualBottomX + 18"
          y2="127"
          class="actual actual-light"
        />
        <line
          :x1="perpendicularActualTopX"
          y1="55"
          :x2="perpendicularActualTopX + 18"
          y2="45"
          class="actual actual-light"
        />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.perpendicularity }}</text>
      </g>

      <!-- 倾斜度：相对基准成角度的带 -->
      <g v-else-if="sid === 'angularity'">
        <polygon points="42,164 242,164 274,147 74,147" class="datum-plane" />
        <line x1="74" y1="147" x2="274" y2="147" class="datum-edge" />
        <text x="48" y="181" class="lbl-sm">A</text>

        <!-- 理论正确方向由基本角 α 确定 -->
        <line
          :x1="angularNominalStart.x"
          :y1="angularNominalStart.y"
          :x2="angularNominalEnd.x"
          :y2="angularNominalEnd.y"
          class="nominal"
        />
        <!-- 两边界平面沿法向相距 t -->
        <polygon :points="angularUpperPlane" class="zone-plane" />
        <polygon :points="angularLowerPlane" class="zone-plane zone-plane--lower" />
        <path :d="angularActualFrontPath" class="actual" fill="none" />
        <path :d="angularActualBackPath" class="actual actual-light" fill="none" />

        <line
          :x1="angularMarker.lower.x"
          :y1="angularMarker.lower.y"
          :x2="angularMarker.upper.x"
          :y2="angularMarker.upper.y"
          class="tol-mark"
        />
        <text :x="angularMarker.label.x" :y="angularMarker.label.y" class="tol-label">t</text>
        <path d="M82 147 A30 30 0 0 1 108 131" class="angle-arc" fill="none" />
        <text x="104" y="143" class="lbl-sm">α</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.angularity }}</text>
      </g>

      <!-- 位置度：孔系相对基准的 Ø 圆柱带 -->
      <g v-else-if="sid === 'position'">
        <!-- 零件轮廓及基准 -->
        <rect x="48" y="48" width="224" height="126" class="part-outline" />
        <line x1="48" y1="174" x2="272" y2="174" class="datum-edge" />
        <line x1="48" y1="48" x2="48" y2="174" class="datum-edge datum-edge-secondary" />
        <text x="42" y="190" class="lbl-sm">A</text>
        <text x="278" y="178" class="lbl-sm">B</text>

        <!-- 理论正确位置：由基本尺寸确定，不带 ± 公差 -->
        <line x1="130" y1="74" x2="190" y2="74" class="true-position" />
        <line x1="160" y1="44" x2="160" y2="104" class="true-position" />
        <circle cx="160" cy="74" r="24" class="feature-outline" />

        <!-- 孔轴线的位置公差带：直径为 Øt 的圆柱；此处为轴向俯视 -->
        <circle cx="160" cy="74" :r="positionZoneRadius" class="position-zone" />
        <circle :cx="positionActualX" :cy="positionActualY" r="3.5" class="actual-axis" />
        <line
          :x1="positionActualX"
          :y1="positionActualY"
          :x2="positionActualX + 34"
          :y2="positionActualY + 20"
          class="actual-leader"
        />
        <text :x="positionActualX + 38" :y="positionActualY + 24" class="actual-label">实际轴线</text>

        <line :x1="160 - positionZoneRadius" y1="118" :x2="160 + positionZoneRadius" y2="118" class="tol-mark" />
        <line :x1="160 - positionZoneRadius" y1="114" :x2="160 - positionZoneRadius" y2="122" class="tol-mark" />
        <line :x1="160 + positionZoneRadius" y1="114" :x2="160 + positionZoneRadius" y2="122" class="tol-mark" />
        <text x="160" y="112" text-anchor="middle" class="tol-label">⌀t</text>
        <text x="160" y="143" text-anchor="middle" class="lbl-sm">轴线公差带（沿轴向观察）</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.position }}</text>
      </g>

      <!-- 同轴度：相对基准轴线的同轴圆柱带 -->
      <g v-else-if="sid === 'concentricity'">
        <!-- 基准轴 A -->
        <line x1="42" y1="100" x2="278" y2="100" class="axis" />
        <text x="42" y="91" class="lbl-sm">基准轴 A</text>

        <!-- 与基准轴 A 同轴、直径为 ⌀t 的圆柱公差带 -->
        <ellipse cx="82" cy="100" rx="11" :ry="coaxialZoneRadius" class="position-zone" />
        <ellipse cx="238" cy="100" rx="11" :ry="coaxialZoneRadius" class="position-zone" />
        <line x1="82" :y1="100 - coaxialZoneRadius" x2="238" :y2="100 - coaxialZoneRadius" class="zone" />
        <line x1="82" :y1="100 + coaxialZoneRadius" x2="238" :y2="100 + coaxialZoneRadius" class="zone" />

        <!-- 被测要素导出中线必须完整落在圆柱带内 -->
        <path :d="coaxialDerivedAxisPath" class="actual actual-axis-line" fill="none" />
        <circle :cx="coaxialAxisMid.x" :cy="coaxialAxisMid.y" r="3" class="actual-axis" />

        <!-- 被测圆柱面仅作对象示意 -->
        <ellipse cx="82" cy="100" rx="20" ry="34" class="feature-outline feature-muted" />
        <ellipse cx="238" cy="100" rx="20" ry="34" class="feature-outline feature-muted" />
        <line x1="82" y1="66" x2="238" y2="66" class="feature-outline feature-muted" />
        <line x1="82" y1="134" x2="238" y2="134" class="feature-outline feature-muted" />

        <line x1="264" :y1="100 - coaxialZoneRadius" x2="264" :y2="100 + coaxialZoneRadius" class="tol-mark" />
        <line x1="260" :y1="100 - coaxialZoneRadius" x2="268" :y2="100 - coaxialZoneRadius" class="tol-mark" />
        <line x1="260" :y1="100 + coaxialZoneRadius" x2="268" :y2="100 + coaxialZoneRadius" class="tol-mark" />
        <text x="274" y="104" class="tol-label">⌀t</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.concentricity }}</text>
      </g>

      <!-- 对称度：相对中心平面的对称带 -->
      <g v-else-if="sid === 'symmetry'">
        <rect x="70" y="50" width="180" height="110" fill="none" stroke="#64748b" />
        <line x1="160" y1="45" x2="160" y2="170" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 2" />
        <text x="168" y="42" class="lbl-sm">中心面</text>
        <rect :x="160 - band" y="70" :width="band * 2" height="70" fill="rgba(64,158,255,0.15)" stroke="#409eff" />
        <rect :x="100 + wobble / 2" y="85" width="40" height="40" fill="none" class="actual" />
        <rect :x="180 - wobble / 2" y="85" width="40" height="40" fill="none" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.symmetry }}</text>
      </g>

      <!-- 圆跳动：单截面相对旋转基准 -->
      <g v-else-if="sid === 'circular_runout'">
        <!-- 基准轴 A 穿过公差带中心 -->
        <line x1="42" y1="100" x2="278" y2="100" class="axis" />
        <line x1="160" y1="38" x2="160" y2="162" class="axis axis-light" />
        <text x="42" y="92" class="lbl-sm">基准轴 A</text>

        <!-- 任一正截面内，半径差为 t 的两同心圆 -->
        <circle cx="160" cy="100" :r="runoutOuterRadius" class="zone" fill="none" />
        <circle cx="160" cy="100" :r="runoutInnerRadius" class="zone zone-inner" fill="none" />
        <circle
          :cx="runoutActualCenterX"
          :cy="runoutActualCenterY"
          :r="runoutActualRadius"
          class="actual"
          fill="none"
        />
        <circle cx="160" cy="100" r="2.5" class="true-center" />
        <circle :cx="runoutActualCenterX" :cy="runoutActualCenterY" r="2.5" class="actual-axis" />

        <line
          :x1="160 + runoutInnerRadius"
          y1="100"
          :x2="160 + runoutOuterRadius"
          y2="100"
          class="tol-mark"
        />
        <line :x1="160 + runoutInnerRadius" y1="96" :x2="160 + runoutInnerRadius" y2="104" class="tol-mark" />
        <line :x1="160 + runoutOuterRadius" y1="96" :x2="160 + runoutOuterRadius" y2="104" class="tol-mark" />
        <text :x="160 + (runoutInnerRadius + runoutOuterRadius) / 2" y="92" text-anchor="middle" class="tol-label">t</text>
        <text x="202" y="53" class="rotation-label">↻</text>
        <text x="210" y="65" class="lbl-sm">单截面旋转</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.circular_runout }}</text>
      </g>

      <!-- 全跳动：全长扫掠带 -->
      <g v-else-if="sid === 'total_runout'">
        <!-- 基准轴 A -->
        <line x1="42" y1="100" x2="278" y2="100" class="axis" />
        <text x="42" y="92" class="lbl-sm">基准轴 A</text>

        <!-- 外边界圆柱面 -->
        <ellipse cx="88" cy="100" rx="22" :ry="totalOuterRadius" class="zone" fill="none" />
        <ellipse cx="232" cy="100" rx="22" :ry="totalOuterRadius" class="zone" fill="none" />
        <line x1="88" :y1="100 - totalOuterRadius" x2="232" :y2="100 - totalOuterRadius" class="zone" />
        <line x1="88" :y1="100 + totalOuterRadius" x2="232" :y2="100 + totalOuterRadius" class="zone" />

        <!-- 内边界圆柱面；与外边界半径差为 t -->
        <ellipse cx="88" cy="100" rx="17" :ry="totalInnerRadius" class="zone zone-inner" fill="none" />
        <ellipse cx="232" cy="100" rx="17" :ry="totalInnerRadius" class="zone zone-inner" fill="none" />
        <line x1="88" :y1="100 - totalInnerRadius" x2="232" :y2="100 - totalInnerRadius" class="zone zone-inner" />
        <line x1="88" :y1="100 + totalInnerRadius" x2="232" :y2="100 + totalInnerRadius" class="zone zone-inner" />

        <!-- 实际圆柱面：旋转并沿全长连续扫掠 -->
        <ellipse cx="88" cy="100" rx="19" :ry="totalActualLeftRadius" class="actual" fill="none" />
        <ellipse cx="232" cy="100" rx="19" :ry="totalActualRightRadius" class="actual" fill="none" />
        <path :d="totalActualTopPath" class="actual" fill="none" />
        <path :d="totalActualBottomPath" class="actual" fill="none" />

        <line x1="260" :y1="100 - totalOuterRadius" x2="260" :y2="100 - totalInnerRadius" class="tol-mark" />
        <line x1="256" :y1="100 - totalOuterRadius" x2="264" :y2="100 - totalOuterRadius" class="tol-mark" />
        <line x1="256" :y1="100 - totalInnerRadius" x2="264" :y2="100 - totalInnerRadius" class="tol-mark" />
        <text x="270" :y="100 - (totalOuterRadius + totalInnerRadius) / 2 + 3" class="tol-label">t</text>
        <text x="210" y="47" class="rotation-label">↻</text>
        <text x="160" y="162" text-anchor="middle" class="lbl-sm">旋转 + 沿全长连续扫掠</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.total_runout }}</text>
      </g>

      <g v-else>
        <text x="160" y="100" text-anchor="middle" class="lbl">—</text>
      </g>
    </svg>
    <el-slider v-model="localTol" :min="0.02" :max="0.4" :step="0.01" :show-tooltip="true" />
    <p class="mt-1 text-xs text-gray-500">{{ hint || captions[sid] }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  symbolId: { type: String, default: 'flatness' },
  tolerance: { type: Number, default: 0.1 },
  title: { type: String, default: '' },
  hint: { type: String, default: '' },
  aria: { type: String, default: 'Tolerance zone diagram' },
  /** 可选：覆盖各符号图内标题；缺省用内置中文 */
  captions: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:tolerance'])

const DEFAULT_CAPTIONS = {
  straightness: '两平行线之间（线要素）',
  flatness: '整个表面位于间距为 t 的两平行平面之间',
  circularity: '截面内半径差为 t 的两同心圆之间',
  cylindricity: '全长位于半径差为 t 的两同轴圆柱面之间',
  profile_line: '沿名义曲线的等距带',
  profile_surface: '沿名义曲面的法向等距壳',
  parallelism: '相对基准 A、间距为 t 的两平行平面之间',
  perpendicularity: '与基准 A 垂直、间距为 t 的两平行平面之间',
  angularity: '相对基准 A 的倾斜带',
  position: '轴线位于理论正确位置处直径为 ⌀t 的圆柱内',
  concentricity: '相对基准轴的同轴圆柱带',
  symmetry: '相对中心平面的对称带',
  circular_runout: '任一截面位于相对基准轴 A、半径差为 t 的两同心圆之间',
  total_runout: '整个圆柱面位于相对基准轴 A、半径差为 t 的两同轴圆柱面之间',
}

const captions = computed(() => ({ ...DEFAULT_CAPTIONS, ...props.captions }))
const sid = computed(() => props.symbolId || 'flatness')

const localTol = ref(props.tolerance)
watch(
  () => props.tolerance,
  (v) => {
    if (v !== localTol.value) localTol.value = v
  },
)
watch(localTol, (v) => emit('update:tolerance', v))

const band = computed(() => 6 + localTol.value * 40)
const wobble = computed(() => Math.min(band.value * 0.7, 14))

/** 图上将公差 t 映射为两边界的间距；不是 ±t。 */
const toleranceGap = computed(() => 5 + localTol.value * 20)

/**
 * 生成理论轮廓及其法向偏置线。offsetFn 的返回值是沿局部单位法向的偏移，
 * 因而两个 ±t/2 边界之间的法向总距离严格为 t（图上比例映射）。
 */
function profilePoint(u, {
  x0 = 42,
  width = 236,
  baseY = 105,
  amplitude = 34,
  phase = -0.12,
  offset = 0,
  shiftX = 0,
  shiftY = 0,
} = {}) {
  const angle = Math.PI * 2 * (u + phase)
  const x = x0 + width * u
  const y = baseY + amplitude * Math.sin(angle)
  const dx = width
  const dy = amplitude * Math.PI * 2 * Math.cos(angle)
  const length = Math.hypot(dx, dy)
  const nx = -dy / length
  const ny = dx / length
  return {
    x: x + nx * offset + shiftX,
    y: y + ny * offset + shiftY,
    nx,
    ny,
  }
}

function sampledProfilePath(options = {}, offsetFn = () => 0) {
  const points = 72
  const commands = []
  for (let i = 0; i <= points; i += 1) {
    const u = i / points
    const p = profilePoint(u, { ...options, offset: offsetFn(u) })
    commands.push(`${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
  }
  return commands.join(' ')
}

const profileHalfWidth = computed(() => toleranceGap.value / 2)
const profileLineNominalPath = computed(() => sampledProfilePath())
const profileLineUpperPath = computed(() => sampledProfilePath({}, () => -profileHalfWidth.value))
const profileLineLowerPath = computed(() => sampledProfilePath({}, () => profileHalfWidth.value))
const profileLineActualPath = computed(() =>
  sampledProfilePath({}, (u) => profileHalfWidth.value * 0.45 * Math.sin(5 * Math.PI * u + 0.3)),
)
const profileLineMarker = computed(() => {
  const u = 0.68
  const upper = profilePoint(u, { offset: -profileHalfWidth.value })
  const lower = profilePoint(u, { offset: profileHalfWidth.value })
  return {
    upper,
    lower,
    label: { x: (upper.x + lower.x) / 2 + 7, y: (upper.y + lower.y) / 2 },
  }
})

const surfaceOptions = { x0: 48, width: 202, baseY: 104, amplitude: 27, phase: -0.1 }
const surfaceBackShift = { shiftX: 22, shiftY: -16 }
const profileSurfaceNominalFront = computed(() => sampledProfilePath(surfaceOptions))
const profileSurfaceNominalBack = computed(() => sampledProfilePath({ ...surfaceOptions, ...surfaceBackShift }))
const profileSurfaceUpperFront = computed(() =>
  sampledProfilePath(surfaceOptions, () => -profileHalfWidth.value),
)
const profileSurfaceLowerFront = computed(() =>
  sampledProfilePath(surfaceOptions, () => profileHalfWidth.value),
)
const profileSurfaceUpperBack = computed(() =>
  sampledProfilePath({ ...surfaceOptions, ...surfaceBackShift }, () => -profileHalfWidth.value),
)
const profileSurfaceLowerBack = computed(() =>
  sampledProfilePath({ ...surfaceOptions, ...surfaceBackShift }, () => profileHalfWidth.value),
)
const profileSurfaceActualFront = computed(() =>
  sampledProfilePath(
    surfaceOptions,
    (u) => profileHalfWidth.value * 0.38 * Math.sin(4 * Math.PI * u + 0.5),
  ),
)
const profileSurfaceActualBack = computed(() =>
  sampledProfilePath(
    { ...surfaceOptions, ...surfaceBackShift },
    (u) => profileHalfWidth.value * 0.32 * Math.sin(4 * Math.PI * u - 0.25),
  ),
)
const profileSurfaceStart = computed(() => ({
  upperFront: profilePoint(0, { ...surfaceOptions, offset: -profileHalfWidth.value }),
  lowerFront: profilePoint(0, { ...surfaceOptions, offset: profileHalfWidth.value }),
  upperBack: profilePoint(0, { ...surfaceOptions, ...surfaceBackShift, offset: -profileHalfWidth.value }),
  lowerBack: profilePoint(0, { ...surfaceOptions, ...surfaceBackShift, offset: profileHalfWidth.value }),
}))
const profileSurfaceMarker = computed(() => {
  const u = 0.67
  const upper = profilePoint(u, { ...surfaceOptions, offset: -profileHalfWidth.value })
  const lower = profilePoint(u, { ...surfaceOptions, offset: profileHalfWidth.value })
  return {
    upper,
    lower,
    label: { x: (upper.x + lower.x) / 2 + 7, y: (upper.y + lower.y) / 2 },
  }
})

const planePoints = (frontLeftX, frontRightX, frontY, depthX = 20, depthY = 14) =>
  `${frontLeftX},${frontY} ${frontRightX},${frontY} ${frontRightX + depthX},${frontY - depthY} ${frontLeftX + depthX},${frontY - depthY}`

// 平面度：两个边界平面之间的法向距离表示 t（图上作比例映射）。
const flatTopY = 78
const flatBottomY = computed(() => flatTopY + toleranceGap.value)
const flatTopPlane = computed(() => planePoints(52, 228, flatTopY))
const flatBottomPlane = computed(() => planePoints(52, 228, flatBottomY.value))
const flatMidY = computed(() => (flatTopY + flatBottomY.value) / 2)
const flatSurfaceError = computed(() => toleranceGap.value * 0.24)
const flatActualBackLeftY = computed(() => flatMidY.value - 14 - flatSurfaceError.value * 0.3)
const flatActualBackRightY = computed(() => flatMidY.value - 14 + flatSurfaceError.value * 0.2)
const flatActualFrontLeftY = computed(() => flatMidY.value + flatSurfaceError.value * 0.25)
const flatActualFrontRightY = computed(() => flatMidY.value - flatSurfaceError.value * 0.2)
const flatActualBackPath = computed(() =>
  `M72 ${flatActualBackLeftY.value} C120 ${flatActualBackLeftY.value + flatSurfaceError.value} 200 ${flatActualBackRightY.value - flatSurfaceError.value} 248 ${flatActualBackRightY.value}`,
)
const flatActualFrontPath = computed(() =>
  `M52 ${flatActualFrontLeftY.value} C105 ${flatActualFrontLeftY.value - flatSurfaceError.value} 175 ${flatActualFrontRightY.value + flatSurfaceError.value} 228 ${flatActualFrontRightY.value}`,
)

// 面平行度：边界平面与基准平面 A 平行，二者间距为 t。
const parallelTopY = 76
const parallelBottomY = computed(() => parallelTopY + toleranceGap.value)
const parallelTopPlane = computed(() => planePoints(55, 231, parallelTopY))
const parallelBottomPlane = computed(() => planePoints(55, 231, parallelBottomY.value))
const parallelMidY = computed(() => (parallelTopY + parallelBottomY.value) / 2)
const parallelSurfaceError = computed(() => toleranceGap.value * 0.2)
const parallelActualBackLeftY = computed(() => parallelMidY.value - 14 - parallelSurfaceError.value * 0.2)
const parallelActualBackRightY = computed(() => parallelMidY.value - 14 + parallelSurfaceError.value * 0.25)
const parallelActualFrontLeftY = computed(() => parallelMidY.value + parallelSurfaceError.value * 0.2)
const parallelActualFrontRightY = computed(() => parallelMidY.value - parallelSurfaceError.value * 0.15)
const parallelActualBackPath = computed(() =>
  `M75 ${parallelActualBackLeftY.value} C125 ${parallelActualBackLeftY.value + parallelSurfaceError.value} 205 ${parallelActualBackRightY.value - parallelSurfaceError.value} 251 ${parallelActualBackRightY.value}`,
)
const parallelActualFrontPath = computed(() =>
  `M55 ${parallelActualFrontLeftY.value} C108 ${parallelActualFrontLeftY.value - parallelSurfaceError.value} 180 ${parallelActualFrontRightY.value + parallelSurfaceError.value} 231 ${parallelActualFrontRightY.value}`,
)

// 面倾斜度：两个边界平面相对基准 A 成基本角 α，法向间距为 t。
const angularRad = (28 * Math.PI) / 180
const angularTangent = { x: Math.cos(angularRad), y: -Math.sin(angularRad) }
const angularNormal = { x: Math.sin(angularRad), y: Math.cos(angularRad) }
const angularNominalStart = { x: 76, y: 147 }
const angularNominalEnd = {
  x: angularNominalStart.x + angularTangent.x * 188,
  y: angularNominalStart.y + angularTangent.y * 188,
}
const angularPoint = (u, normalOffset = 0, depth = false) => ({
  x: angularNominalStart.x
    + angularTangent.x * 188 * u
    + angularNormal.x * normalOffset
    + (depth ? 18 : 0),
  y: angularNominalStart.y
    + angularTangent.y * 188 * u
    + angularNormal.y * normalOffset
    + (depth ? -10 : 0),
})
const angularPlanePoints = (normalOffset) => {
  const start = angularPoint(0, normalOffset)
  const end = angularPoint(1, normalOffset)
  const backEnd = angularPoint(1, normalOffset, true)
  const backStart = angularPoint(0, normalOffset, true)
  return `${start.x},${start.y} ${end.x},${end.y} ${backEnd.x},${backEnd.y} ${backStart.x},${backStart.y}`
}
const angularUpperPlane = computed(() => angularPlanePoints(-toleranceGap.value / 2))
const angularLowerPlane = computed(() => angularPlanePoints(toleranceGap.value / 2))
const angularActualFrontPath = computed(() => {
  const start = angularPoint(0.03, -toleranceGap.value * 0.08)
  const end = angularPoint(0.97, toleranceGap.value * 0.12)
  return `M${start.x} ${start.y} L${end.x} ${end.y}`
})
const angularActualBackPath = computed(() => {
  const start = angularPoint(0.03, -toleranceGap.value * 0.08, true)
  const end = angularPoint(0.97, toleranceGap.value * 0.12, true)
  return `M${start.x} ${start.y} L${end.x} ${end.y}`
})
const angularMarker = computed(() => {
  const u = 0.72
  const upper = angularPoint(u, -toleranceGap.value / 2)
  const lower = angularPoint(u, toleranceGap.value / 2)
  return {
    upper,
    lower,
    label: { x: (upper.x + lower.x) / 2 + 8, y: (upper.y + lower.y) / 2 },
  }
})

// 面垂直度：两边界平面与基准 A 成精确 90°，间距为 t。
const perpendicularLeftX = computed(() => 151 - toleranceGap.value / 2)
const perpendicularRightX = computed(() => 151 + toleranceGap.value / 2)
const verticalPlanePoints = (x) => `${x},137 ${x},55 ${x + 18},45 ${x + 18},127`
const perpendicularLeftPlane = computed(() => verticalPlanePoints(perpendicularLeftX.value))
const perpendicularRightPlane = computed(() => verticalPlanePoints(perpendicularRightX.value))
const perpendicularSurfaceError = computed(() => toleranceGap.value * 0.22)
const perpendicularActualBottomX = computed(() => 151 - perpendicularSurfaceError.value * 0.35)
const perpendicularActualTopX = computed(() => 151 + perpendicularSurfaceError.value * 0.45)
const perpendicularActualFrontPath = computed(() =>
  `M${perpendicularActualBottomX.value} 137 C${151 - perpendicularSurfaceError.value} 112 ${151 + perpendicularSurfaceError.value} 78 ${perpendicularActualTopX.value} 55`,
)
const perpendicularActualBackPath = computed(() =>
  `M${perpendicularActualBottomX.value + 18} 127 C${169 - perpendicularSurfaceError.value} 102 ${169 + perpendicularSurfaceError.value} 68 ${perpendicularActualTopX.value + 18} 45`,
)

// 位置度：数值 t 是圆柱公差带的直径，不是半径。
const positionZoneRadius = computed(() => 6 + localTol.value * 20)
const positionActualOffset = computed(() => positionZoneRadius.value * 0.42)
const positionActualX = computed(() => 160 + positionActualOffset.value * 0.8)
const positionActualY = computed(() => 74 - positionActualOffset.value * 0.6)

// 同轴度：t 为与基准轴 A 同轴的圆柱公差带直径。
const coaxialZoneRadius = computed(() => 5 + localTol.value * 18)
const coaxialAxisError = computed(() => coaxialZoneRadius.value * 0.38)
const coaxialDerivedAxisPath = computed(() =>
  `M82 ${100 - coaxialAxisError.value * 0.3} C125 ${100 + coaxialAxisError.value} 195 ${100 - coaxialAxisError.value} 238 ${100 + coaxialAxisError.value * 0.35}`,
)
const coaxialAxisMid = computed(() => ({
  x: 160,
  y: 100 + coaxialAxisError.value * 0.1,
}))

// 圆跳动：任一截面的公差带相对基准轴 A 同心，半径差为 t。
const runoutOuterRadius = 52
const runoutInnerRadius = computed(() => runoutOuterRadius - toleranceGap.value)
const runoutActualRadius = computed(() => (runoutOuterRadius + runoutInnerRadius.value) / 2)
const runoutEccentricity = computed(() => toleranceGap.value * 0.18)
const runoutActualCenterX = computed(() => 160 + runoutEccentricity.value * 0.8)
const runoutActualCenterY = computed(() => 100 - runoutEccentricity.value * 0.6)

// 全跳动（径向圆柱面）：相对基准轴 A 的两同轴圆柱面半径差为 t。
const totalOuterRadius = 40
const totalInnerRadius = computed(() => totalOuterRadius - toleranceGap.value)
const totalMidRadius = computed(() => (totalOuterRadius + totalInnerRadius.value) / 2)
const totalSurfaceError = computed(() => toleranceGap.value * 0.2)
const totalActualLeftRadius = computed(() => totalMidRadius.value - totalSurfaceError.value)
const totalActualRightRadius = computed(() => totalMidRadius.value + totalSurfaceError.value * 0.75)
const totalActualTopPath = computed(() => {
  const left = 100 - totalActualLeftRadius.value
  const right = 100 - totalActualRightRadius.value
  return `M88 ${left} C130 ${left - totalSurfaceError.value} 195 ${right + totalSurfaceError.value} 232 ${right}`
})
const totalActualBottomPath = computed(() => {
  const left = 100 + totalActualLeftRadius.value
  const right = 100 + totalActualRightRadius.value
  return `M88 ${left} C130 ${left + totalSurfaceError.value} 195 ${right - totalSurfaceError.value} 232 ${right}`
})

const circularityOuterRadius = 58
const circularityInnerRadius = computed(() => circularityOuterRadius - toleranceGap.value)
const circularityActualPath = computed(() => {
  const centerRadius = (circularityOuterRadius + circularityInnerRadius.value) / 2
  const amplitude = toleranceGap.value * 0.28
  const points = 96
  const coords = []
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * Math.PI * 2
    const radius = centerRadius
      + amplitude * (0.5 * Math.sin(2 * angle + 0.35) + 0.3 * Math.sin(3 * angle - 0.6))
    coords.push(`${i === 0 ? 'M' : 'L'}${160 + radius * Math.cos(angle)} ${105 + radius * Math.sin(angle)}`)
  }
  return `${coords.join(' ')} Z`
})

const cylOuterRadius = 44
const cylInnerRadius = computed(() => cylOuterRadius - toleranceGap.value)
const cylMidRadius = computed(() => (cylOuterRadius + cylInnerRadius.value) / 2)
const cylError = computed(() => toleranceGap.value * 0.22)
const cylActualLeftRadius = computed(() => cylMidRadius.value - cylError.value)
const cylActualRightRadius = computed(() => cylMidRadius.value + cylError.value * 0.7)
const cylActualTopPath = computed(() => {
  const left = 100 - cylActualLeftRadius.value
  const right = 100 - cylActualRightRadius.value
  const bow = cylError.value
  return `M80 ${left} C120 ${left - bow} 200 ${right + bow} 240 ${right}`
})
const cylActualBottomPath = computed(() => {
  const left = 100 + cylActualLeftRadius.value
  const right = 100 + cylActualRightRadius.value
  const bow = cylError.value
  return `M80 ${left} C120 ${left + bow} 200 ${right - bow} 240 ${right}`
})

</script>

<style scoped>
.gdt-zone__svg {
  width: 100%;
  max-width: 320px;
  display: block;
  margin: 0 auto;
}
.lbl {
  fill: #64748b;
  font-size: 11px;
}
.lbl-sm {
  fill: #409eff;
  font-size: 11px;
  font-weight: 600;
}
.zone {
  stroke: #409eff;
  stroke-width: 2;
  fill: none;
}
.zone-inner {
  stroke-dasharray: 4 2;
}
.zone-plane {
  fill: rgb(64 158 255 / 0.08);
  stroke: #409eff;
  stroke-width: 1.6;
}
.zone-plane--lower {
  fill: rgb(64 158 255 / 0.14);
  stroke-dasharray: 4 2;
}
.zone-plane-vertical {
  fill: rgb(64 158 255 / 0.1);
  stroke: #409eff;
  stroke-width: 1.6;
}
.actual {
  stroke: #f59e0b;
  stroke-width: 2;
  fill: none;
}
.actual-light {
  stroke-width: 1.3;
  opacity: 0.8;
}
.datum-plane {
  fill: rgb(14 165 233 / 0.3);
  stroke: #0284c7;
  stroke-width: 1.4;
}
.datum-edge {
  stroke: #0284c7;
  stroke-width: 2;
}
.datum-edge-secondary {
  stroke-dasharray: 4 2;
}
.part-outline {
  fill: rgb(148 163 184 / 0.06);
  stroke: #64748b;
  stroke-width: 1.4;
}
.feature-outline {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 1.3;
}
.feature-muted {
  opacity: 0.55;
}
.true-position {
  stroke: #64748b;
  stroke-width: 1;
  stroke-dasharray: 4 2;
}
.position-zone {
  fill: rgb(64 158 255 / 0.18);
  stroke: #409eff;
  stroke-width: 1.8;
}
.actual-axis {
  fill: #f59e0b;
  stroke: #b45309;
  stroke-width: 1;
}
.actual-axis-line {
  stroke-dasharray: 5 3;
}
.actual-leader {
  stroke: #b45309;
  stroke-width: 1;
}
.actual-label {
  fill: #b45309;
  font-size: 10px;
}
.true-center {
  fill: #64748b;
}
.rotation-label {
  fill: #f59e0b;
  font-size: 20px;
  font-weight: 600;
}
.axis {
  stroke: #94a3b8;
  stroke-width: 1;
  stroke-dasharray: 5 3;
}
.axis-light {
  opacity: 0.65;
}
.tol-mark {
  stroke: #2563eb;
  stroke-width: 1.2;
}
.tol-label {
  fill: #2563eb;
  font-size: 11px;
  font-weight: 600;
}
.nominal {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.angle-arc {
  stroke: #64748b;
  stroke-width: 1.2;
}
.datum-fill {
  fill: #0ea5e9;
  opacity: 0.35;
}
</style>
