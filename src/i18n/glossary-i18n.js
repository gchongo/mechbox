/** English glossary entries keyed by term id (symbol stays in source glossary.js) */

export const glossaryEn = {
  position: {
    term: 'Position',
    category: 'GD&T',
    definition:
      'Position controls how far a hole, shaft, or feature may deviate from its ideal location relative to datums. Imagine a perfect center marked on the drawing—the actual machined center may be offset slightly; the position tolerance defines the allowed deviation (typically as a diametral tolerance zone). In hole-pattern assembly, eccentricity of each hole adds up, so tolerance stacks often combine individual hole deviations with locating dimensions to verify final clearance or position.',
    tags: ['GD&T', 'Datum', 'Hole pattern'],
  },
  parallelism: {
    term: 'Parallelism',
    category: 'GD&T',
    definition:
      'Parallelism expresses how much a measured surface deviates from being parallel to a datum. For example, a mounting face should mate flush; tilt or local high spots relative to the datum surface show up as parallelism error. In a 2D tolerance stack, flatness and thickness deviations of related faces can be treated as component rings and summed to estimate overall parallelism or assembly gap variation.',
    tags: ['2D', 'Plane', 'Datum surface'],
  },
  perpendicularity: {
    term: 'Perpendicularity',
    category: 'GD&T',
    definition:
      'Perpendicularity measures whether a feature is sufficiently straight and orthogonal relative to a datum. Typical cases include a shaft shoulder face square to the axis, or two mounting faces that should meet at 90°. Excessive perpendicularity error can prevent assembly or create extra side loads. In stack-up analysis, deviations of perpendicular-related faces and locating dimensions can be combined for evaluation.',
    tags: ['GD&T', 'Perpendicular'],
  },
  coaxiality: {
    term: 'Coaxiality',
    category: 'GD&T',
    definition:
      'Coaxiality describes whether two axes (or cylindrical feature axes) lie on the same centerline. For example, bearing seats and journals may each meet size limits yet misaligned axes cause vibration or assembly difficulty. Coaxiality is often linked to radial runout and hole/shaft fit stacks; RSS can combine radial deviations from multiple segments into total coaxial error.',
    tags: ['Shaft system', 'GD&T'],
  },
  runout: {
    term: 'Runout',
    category: 'GD&T',
    definition:
      'Runout is the radial or end-face variation measured while the part rotates one full revolution. Circular runout looks at radial variation in one cross-section; total runout combines deviation over the entire surface. It reflects roundness, eccentricity, axis tilt, and related effects together. For rotating parts (shafts, gears), excessive runout causes noise, wear, and imbalance; related radial rings should be stacked in tolerance analysis.',
    tags: ['Rotating parts', 'Inspection'],
  },
  flatness: {
    term: 'Flatness',
    category: 'Form tolerances',
    definition:
      'Flatness constrains how flat a single surface is—no datum required. For example, a cover sealing face with local pits or bumps may leak even if thickness dimensions are within spec. The flatness tolerance zone is the volume between two parallel planes. In parallelism and assembly-gap chains, flatness often acts as a component ring in the stack.',
    tags: ['Form', 'Surface'],
  },
  straightness: {
    term: 'Straightness',
    category: 'Form tolerances',
    definition:
      'Straightness indicates how much a line element (e.g., a guide rail edge or shaft generatrix) deviates from a perfect straight line. No datum is required—only the shape of the line itself matters. Excessive straightness error can cause sliding fits to bind. When multiple line elements stack along a length, tolerance stacks can estimate the effect on the closed loop.',
    tags: ['Form', '2D'],
  },
  roundness: {
    term: 'Roundness',
    category: 'Form tolerances',
    definition:
      'Roundness describes how far a circular cross-section deviates from a perfect circle—for example lobing or ovality. It differs from diameter: diameter can be in spec while roundness is not. Critical for bearing fits, seal grooves, and other rotating functional surfaces. Roundness deviations from multiple sections can be combined by radial RSS to assess overall rotational accuracy.',
    tags: ['Form', 'GD&T', 'Rotating parts'],
  },
  profile: {
    term: 'Profile of a surface',
    category: 'GD&T',
    definition:
      'Profile controls deviation of an actual line or surface from the theoretical profile and can constrain form, orientation, and location (when datums are applied). Examples include cam curves and blade airfoils where both shape and position matter. More comprehensive than straightness or flatness alone, it suits overall tolerance control of complex curved parts.',
    tags: ['Profile', 'Curves'],
  },
  datum: {
    term: 'Datum',
    category: 'GD&T',
    definition:
      'A datum is the reference origin for measurement and annotation, used to establish a coordinate system. For example, level on bottom face A, then square to side B, then measure other features relative to that frame. In tolerance stacks, the closed-loop direction usually aligns with a datum direction; increasing and decreasing rings are judged relative to that direction.',
    tags: ['Datum reference frame', 'Assembly'],
  },
  mmc: {
    term: 'Maximum Material Condition (MMC)',
    category: 'GD&T modifiers',
    definition:
      'MMC is the limit size state with the most material: minimum hole diameter or maximum shaft diameter. When position is stated at MMC, if the hole grows or the shaft shrinks (departing from MMC), additional "bonus tolerance" may be gained—the tolerance zone can expand. This preserves worst-case assembly while giving more manufacturing latitude at nominal sizes.',
    tags: ['Bonus tolerance', 'Hole/shaft'],
  },
  lmc: {
    term: 'Least Material Condition (LMC)',
    category: 'GD&T modifiers',
    definition:
      'LMC is the limit state with the least material: maximum hole diameter or minimum shaft diameter. Often used when minimum wall thickness, minimum strength, or minimum interference must be guaranteed. Like MMC, some tolerances may gain bonus at LMC, but MMC is more common for hole-pattern position to relax manufacturing.',
    tags: ['Wall thickness', 'Strength'],
  },
  'closed-loop': {
    term: 'Closed loop',
    category: 'Tolerance stack',
    definition:
      'The closed loop is the dimension or gap that must finally be controlled—usually formed only after assembly, such as clearance between two parts, step height, or overall length. Analysis starts by defining upper and lower limits for the closed loop (design requirements), then checking whether component-ring tolerances are adequate. Step 2 in this tool defines the closed loop.',
    tags: ['Tolerance stack', 'Target'],
  },
  'component-ring': {
    term: 'Component ring',
    category: 'Tolerance stack',
    definition:
      'Component rings are the individual part dimensions or tolerance items that directly affect the closed loop. Increasing ring: a larger dimension increases the closed loop in the same direction; decreasing ring: a larger dimension changes the closed loop in the opposite direction. In "slot width − part width = clearance", slot width may be increasing and part width decreasing. Each ring has a nominal value and tolerance (ES/EI).',
    tags: ['Increasing ring', 'Decreasing ring'],
  },
  'transfer-factor': {
    term: 'Transfer factor',
    category: 'Tolerance stack',
    definition:
      'The transfer factor indicates how strongly a component ring’s deviation affects the closed loop: 1 means full transfer, 0.5 means half. Simple 1D chains are usually 1; in 2D/GD&T or complex geometry, the factor approximates sensitivity. In advanced mode you can edit this factor for weighted RSS or tolerance allocation.',
    tags: ['Weighting', 'RSS'],
  },
  'worst-case': {
    term: 'Worst-case (arithmetic sum)',
    category: 'Statistical methods',
    definition:
      'Worst-case assumes every component ring’s tolerance is simultaneously at its least favorable limit and adds tolerances directly. The result is most conservative—equivalent to 100% assurance that any legal part combination stays within spec. The downside is often overly tight tolerances and higher machining cost. Suitable for safety-critical applications where failure is unacceptable.',
    tags: ['Worst-case', '100%'],
  },
  rss: {
    term: 'RSS method',
    category: 'Statistical methods',
    definition:
      'RSS (Root Sum Square) treats each ring’s tolerance as an independent random error, sums squares, then takes the square root for total tolerance. Compared with worst-case, it better matches batch production and typically corresponds to about 95% conformance. Assumes independent, approximately normal errors. This tool recommends RSS as the default for routine mechanical design.',
    tags: ['Probability', 'Normal'],
  },
  'modified-rss': {
    term: 'Modified RSS',
    category: 'Statistical methods',
    definition:
      'When ring errors are not ideally normal (e.g., uniform, triangular, or skewed distributions), multiply the RSS result by a correction factor k for a more realistic total tolerance. Uniform rings have fixed spread and are "fuller" than normal, so k is often greater than 1. Choose modified RSS in step 4 and specify distribution types.',
    tags: ['Correction', 'Uniform distribution'],
  },
  cpk: {
    term: 'Cpk',
    category: 'Process capability',
    definition:
      'Cpk measures whether a process can stay stably within specification while accounting for centering. USL/LSL are spec limits, μ is process mean, σ is standard deviation. Cpk is the smaller of (distance to USL) and (distance to LSL) divided by 3σ. Cpk ≥ 1.33 is often considered good capability; below 1 indicates excessive variation or offset and higher defect risk. Results pages show current Cpk with reference tables.',
    tags: ['SPC', 'Quality'],
  },
  'sigma-level': {
    term: 'Sigma level',
    category: 'Process capability',
    definition:
      'Sigma level describes how tight process variation is relative to the spec bandwidth—the higher the value, the more stable the process and the fewer defects. Under normal approximation, 3σ ≈ 99.73% yield and 6σ approaches near-zero defects. The tool estimates sigma level from target tolerance and RSS-combined σ, then converts to yield and DPPM (defects per million).',
    tags: ['6σ', 'Yield'],
  },
  'monte-carlo': {
    term: 'Monte Carlo simulation',
    category: 'Statistical methods',
    definition:
      'Monte Carlo randomly generates many samples (e.g., 10,000) of component ring sizes within their tolerance bands, combines them, and counts how often the closed loop falls within specification. It does not rely on normal approximation and suits complex distributions or when you want histograms and yield shown directly. Jump from the editor with current parameters in one click.',
    tags: ['Simulation', 'Random'],
  },
  'distribution-k': {
    term: 'Distribution factor K',
    category: 'Statistical methods',
    definition:
      'Distribution factor K converts tolerance T to standard deviation σ: σ = T/K. K differs by distribution shape—normal often uses K = 6 (±3σ within spec), uniform ≈ 3.46, triangular ≈ 4.24. The 6σ RSS method uses each ring’s K to recover σ before statistical combination, more rigorous than simple RSS.',
    tags: ['Conversion', 'Distribution'],
  },
  'agma-geometry-i': {
    term: 'AGMA geometry factor I',
    category: 'Gears',
    definition:
      'In AGMA 2101 contact stress calculations, I reflects the effect of tooth profile curvature and contact location on Hertzian contact. Unlike ISO 6336 Z factors, I appears directly in the denominator. This tool uses a simplified estimate based on tooth ratio; full values require AGMA charts.',
    tags: ['AGMA', 'Gears', 'Contact'],
  },
  'iso1328-grade': {
    term: 'ISO 1328 accuracy grade',
    category: 'Gears',
    definition:
      'ISO 1328 defines tolerance grades for gear tooth deviations (typically grades 5–12; lower number means higher accuracy). Includes single pitch deviation f_pt, cumulative pitch F_pt, profile f_fα, helix F_β, etc. Accuracy grade directly affects machining difficulty and dynamic load factors in ISO 6336/AGMA.',
    tags: ['ISO 1328', 'Gears', 'Accuracy'],
  },
  'gage-rr': {
    term: 'Gage R&R (repeatability & reproducibility)',
    category: 'Quality',
    definition:
      'Core MSA metric evaluating how much variation from the measurement system and operators contributes to total variation. %GRR < 10% is often acceptable. Repeatability (EV) reflects instrument variation; reproducibility (AV) reflects differences between operators.',
    tags: ['MSA', 'Quality', 'Measurement'],
  },
  aql: {
    term: 'AQL (Acceptable Quality Level)',
    category: 'Quality',
    definition:
      'Upper limit on average defect rate allowed in sampling inspection. With standards such as GB/T 2828.1, lot size and inspection level determine sample size n and acceptance Ac / rejection Re numbers. Smaller AQL means stricter sampling.',
    tags: ['AQL', 'Sampling', 'Quality'],
  },
  'k-factor-sheet': {
    term: 'K-factor (sheet metal bending)',
    category: 'Manufacturing',
    definition:
      'Coefficient for neutral-axis location in bend allowance: BA = (π/180)·θ·(R + K·T). K ≈ 0.33 is common for air bending with R ≈ T; coining uses larger K. Accurate K values require trials or bend software calibration.',
    tags: ['Sheet metal', 'Bend die', 'K-factor'],
  },
  'draft-angle': {
    term: 'Draft angle',
    category: 'Manufacturing',
    definition:
      'Taper on castings so patterns or molds release cleanly from sand or dies. External surfaces, internal cavities, and deep cores need different angles; greater depth and rougher surfaces need larger draft. Insufficient draft causes tearing, sticking, or ejector damage.',
    tags: ['Casting', 'Draft', 'Process'],
  },
  jominy: {
    term: 'Jominy end-quench test',
    category: 'Materials',
    definition:
      'A standard bar is water-quenched at one end; hardness is measured along the length to obtain a hardenability curve. Faster hardness drop with distance from the quenched end indicates lower hardenability. Used to compare steel grades and grain sizes for quench depth.',
    tags: ['Heat treatment', 'Jominy', 'Hardenability'],
  },
  'carbon-equivalent': {
    term: 'Carbon equivalent (CE)',
    category: 'Materials',
    definition:
      'A composite index from chemical composition reflecting hardenability and weld cracking sensitivity. Higher CE tends to give higher hardness on quenching but also demands more preheat and controlled cooling when welding.',
    tags: ['Carbon equivalent', 'Welding', 'Heat treatment'],
  },
  rsm: {
    term: 'Response surface methodology (RSM)',
    category: 'Statistics',
    definition:
      'Fits a mathematical model (often quadratic) between responses and factors via DOE experiments, then uses contour plots to find optimal process windows. Central composite design (CCD) is a common two-factor RSM plan.',
    tags: ['RSM', 'DOE', 'Optimization'],
  },
  iso286: {
    term: 'ISO 286 fits',
    category: 'Tolerances',
    definition:
      'Fit system based on hole/shaft tolerance zone positions. Hole codes are uppercase (e.g., H7), shaft codes lowercase (e.g., g6); H7/g6 is a common precision clearance fit. Fit type is judged by max/min clearance: all positive clearance, all negative interference, or crossing zero for transition.',
    tags: ['ISO286', 'Tolerances', 'Fit'],
  },
  vdi2230: {
    term: 'VDI 2230',
    category: 'Fasteners',
    definition:
      'VDI bolted joint design guideline with calculation steps R0–R13 covering tightening methods, clamp force requirements, embedment and thermal losses, stress, and fatigue. This tool provides a simplified step-by-step wizard for verification.',
    tags: ['VDI2230', 'Bolts', 'Preload'],
  },
  drf: {
    term: 'Datum reference frame (DRF)',
    category: 'GD&T',
    definition:
      'Coordinate system built from primary, secondary, and tertiary datums used to constrain measurement and tolerance stack-up of measured features. Flatness and perpendicularity errors of datum surfaces themselves accumulate into geometric stacks referenced to those datums.',
    tags: ['GD&T', 'Datum', 'DRF'],
  },
}
