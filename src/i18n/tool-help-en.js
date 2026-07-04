/** English help article overrides for tool-help.js */

/** @type {Record<string, Partial<import('@/constants/tool-help').HelpArticle>>} */

const COMMON_USE_CASES = [
  'Use when you have preliminary dimensions, loads, or material data and need to judge whether the design is adequate.',
  'Use together with the Decision Tools panel at the bottom of the page when comparing alternatives or finding which parameter most affects the result.',
]

const COMMON_INPUTS = [
  {
    name: 'Design objective',
    meaning: 'Life, clearance, safety factor, allowable stress, or pass rate that must be met.',
    source: 'From drawings, customer requirements, company design standards, or assignment specifications.',
  },
  {
    name: 'Geometry',
    meaning: 'Directly governs cross-section area, moment of inertia, moment arm, contact area, or tolerance stack relationships.',
    source: 'From sketches, CAD, standard-part catalogs, or initial sizing; unify units before entry.',
  },
  {
    name: 'Loads and operating conditions',
    meaning: 'The driving inputs for the calculation. Results are more meaningful when loads match real service conditions.',
    source: 'From force analysis, equipment power/torque, test data, or upstream calculations; use worst-case values when uncertain.',
  },
  {
    name: 'Material / allowable values',
    meaning: 'Define strength, stiffness, or life criteria—the benchmark for pass/fail judgement.',
    source: 'From material grade, heat-treatment state, standards handbooks, supplier data, or company allowable-stress tables.',
  },
]

const COMMON_OUTPUTS = [
  {
    name: 'Pass / Fail',
    meaning: 'Preliminary judgement after comparing calculated values with targets or allowables.',
    judgement: 'Pass means the current model and inputs satisfy the criteria; fail means at least one key metric is inadequate.',
  },
  {
    name: 'Key metrics',
    meaning: 'Such as total tolerance, life in hours, stress, safety factor, or pass rate—the primary basis for judgement.',
    judgement: 'Check whether key metrics exceed limits first, then assess margin to the boundary.',
  },
  {
    name: 'Recommendations and sensitivity',
    meaning: 'Indicate which parameter to change next rather than blindly oversizing everything.',
    judgement: 'Parameters with high sensitivity should be verified first and prioritized for optimization.',
  },
]

const COMMON_RELIABILITY = [
  'Results come from explicit formulas, standard simplifications, or engineering models—not AI guesswork. Formulas and key metrics on the page are the basis for judgement.',
  'Reliability depends on realistic inputs, consistent units, and whether the model applies to the actual structure. Failure modes outside the model require separate checks.',
  'Before formal release, verify per company process: drawing dimensions, material batches, load spectra, standard revisions, process capability, and safety factors.',
]

export const toolHelpEnById = {
  'getting-started': {
    title: 'Getting Started',
    summary:
      'MechBox turns common mechanical design calculations into linked tools. Start with a tolerance stack or the powertrain design chain, then drill into individual strength and life tools.',
    steps: [
      'On the home page, choose a tool group: Design Chains, Tolerance & Strength, Drives & Structures, or Materials & Process.',
      'After opening a tool, review Calculation Mode: Simplified / Full / Professional. Beginners can use Simplified or Full.',
      'Fill in the input section; results and pass/fail status update in real time on the right.',
      'For reverse calculation, design comparison, or sensitivity analysis, use the Decision Tools panel at the bottom (see the Decision Tools article on this page).',
      'For multi-tool workflows, use the Powertrain Design Chain or Bolt Joint Design Chain—shared parameters sync automatically.',
      'Look up unfamiliar terms in the Glossary; use the Formula Manual for equations. This page provides full operating instructions.',
    ],
    principle:
      'The general engineering workflow is: define design goals (life, safety factor, clearance, etc.) → build a simplified model → apply loads and material data → compare with allowables → resize or change material if needed. MechBox embeds this workflow in each tool and links upstream/downstream parameters in design chains.',
    formulas: [
      { latex: 'S = \\frac{[\\sigma]}{\\sigma}', note: 'Safety factor: allowable stress / working stress; typically require S ≥ target value' },
    ],
    notes: [
      'Site results are for learning and preliminary sizing only. Formal products must be verified per company standards and complete code requirements.',
      'Keep units consistent: force in N, stress in MPa, length in mm, speed in rpm.',
      'Pass only means the built-in criteria are met for current inputs—it does not guarantee assembly or manufacturability.',
    ],
    useCases: [
      'First time using MechBox and unsure where to begin.',
      'Coursework, capstone projects, or preliminary design needing an explainable calculation workflow.',
      'Engineers who need a quick check on whether a concept is worth refining.',
    ],
    inputs: [
      {
        name: 'Objective',
        meaning: 'State clearly what you must guarantee: life, clearance, strength, safety factor, or pass rate.',
        source: 'Drawing requirements, design brief, customer spec, or assignment statement.',
      },
      {
        name: 'Tool selection',
        meaning: 'Pick the tool closest to the problem—tolerance stack for assembly clearance, shaft strength for torque shafts, bearing life for rolling bearings.',
        source: 'See “When to use” in help; start from a design chain if unsure.',
      },
      {
        name: 'Input data',
        meaning: 'Dimensions, loads, materials, and operating conditions. Unreliable inputs yield unreliable results.',
        source: 'CAD, handbooks, catalogs, tests, upstream calculations.',
      },
    ],
    outputs: [
      {
        name: 'Result judgement',
        meaning: 'Check pass/fail first, then see which metric is closest to the limit.',
        judgement: 'Designs near the boundary should not be released without added margin or model review.',
      },
      {
        name: 'Formulas and assumptions',
        meaning: 'Shows why the tool computes as it does.',
        judgement: 'When formula applicability conditions are not met, results are reference only—not final conclusions.',
      },
    ],
    reliability: [
      'MechBox is an explainable preliminary engineering platform: every result maps to a formula, standard simplification, or explicit model.',
      'It suits concept screening, teaching, and early design checks; it does not replace full standard calculation packages, testing, or company sign-off.',
    ],
    keywords: ['getting started', 'beginner', 'student', 'help'],
  },

  'decision-tools': {
    title: 'Decision Tools',
    summary:
      'The Decision Tools panel at the bottom of most calculation pages supports design comparison, reverse solving, and sensitivity analysis—turning a single run into a design decision.',
    steps: [
      'Fill the main form with baseline parameters and confirm pass/fail in the primary results area.',
      'Open the Decision Tools panel below. Three tabs: Compare Designs, Reverse Solve, Sensitivity.',
      'Compare Designs: adjust parameters and click Save Current as Design to compare key metrics side by side; delete unwanted designs.',
      'Reverse Solve: choose a target (e.g. minimum shaft diameter, dynamic load C for required life), click Solve, then Apply to Form when satisfied.',
      'Sensitivity: select a tracked metric (e.g. life, total tolerance), set perturbation (±5%–±30%), click Run Analysis, and read the tornado chart—longer bars mean greater influence.',
      'Use Export Enhanced Report to archive assumptions, recommendations, and sensitivity summary as PDF.',
    ],
    principle:
      'Reverse calculation is the inverse of forward analysis: fix pass criteria and search for a critical input. Sensitivity perturbs each input slightly (default ±10%) and compares output swing to find the most influential parameters for tightening tolerances or adding margin.',
    formulas: [
      {
        latex: '\\text{swing}\\% = \\frac{|y_{+\\delta}-y_{-\\delta}|}{|y_0|}\\times 100\\%',
        note: 'Sensitivity swing: percentage change in output between high/low perturbation relative to baseline',
      },
    ],
    notes: [
      'Sensitivity charts appear only after Run Analysis; rerun after changing main form inputs.',
      'Perturbation is a percentage of the current baseline, not an absolute tolerance band.',
      'Reverse results are numerical—round up to standard sizes (shaft diameters, key lengths, bearing part numbers).',
      'Not every tool defines reverse targets; the Reverse Solve tab is disabled when none are configured.',
      'Tolerance stack editor sensitivity often tracks totalTolerance, perturbing each component ring tolerance.',
    ],
    example:
      'On the bearing page: track lifeHours. If the Fr bar is longest after sensitivity analysis, load reduction or higher C is more effective than fine-tuning speed.',
    useCases: [
      'You have a result but want to compare several design alternatives.',
      'You know the target (e.g. life ≥ 10,000 h) but not the minimum required input.',
      'You want to find which parameter matters most so you change the right thing.',
    ],
    inputs: [
      {
        name: 'Baseline form',
        meaning: 'Parameters already filled on the main tool page—the starting point for compare, reverse, and sensitivity.',
        source: 'Complete the main calculation first, then open Decision Tools.',
      },
      {
        name: 'Tracked metric',
        meaning: 'The output you care about—life, total tolerance, stress, or safety factor.',
        source: 'Choose from the dropdown; usually the metric that governs pass/fail.',
      },
      {
        name: 'Perturbation magnitude',
        meaning: 'Percentage up/down change applied to each input in sensitivity analysis.',
        source: 'Start with ±10%; try ±20% or ±30% when process variation is large.',
      },
    ],
    outputs: [
      {
        name: 'Design comparison table',
        meaning: 'Records key metrics for multiple designs instead of relying on memory.',
        judgement: 'When all pass, prefer adequate margin, lower cost, and easier manufacturing.',
      },
      {
        name: 'Reverse solution',
        meaning: 'Critical input value that meets the target.',
        judgement: 'Round to standard sizes before applying—standard shaft diameters, key lengths, bearing models.',
      },
      {
        name: 'Sensitivity bar chart',
        meaning: 'Shows how much each parameter changes the result when perturbed.',
        judgement: 'Longer bars mean higher priority for control or verification.',
      },
    ],
    keywords: ['decision', 'sensitivity', 'reverse', 'design comparison', 'tornado'],
  },

  'design-projects': {
    title: 'Design Projects',
    summary: 'Archive multiple design chains as projects for comparison and later access.',
    steps: [
      'Open Design Projects and create a new project with a name.',
      'Link existing powertrain or bolt joint chains, or start empty and create chains from their pages.',
      'Rename or delete projects as needed; open a project to jump to its design chain.',
    ],
    principle:
      'Design projects are an organization layer—they do not perform strength calculations but manage snapshots of design chains so different product concepts can coexist.',
    notes: [
      'Data is stored locally in the browser; clearing site data will lose it—export reports or back up important designs.',
      'Create design chains first, then archive to projects for clearer workflow.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['project', 'archive', 'design'],
  },

  'design-powertrain': {
    title: 'Powertrain Design Chain',
    summary:
      'Link shaft strength → bearing life → parallel key connection on one page, sharing torque, speed, shaft diameter, and related inputs.',
    steps: [
      'Click New Chain and fill shared inputs: torque, speed, shaft diameter, material yield strength, bearing loads and target life, key dimensions, etc.',
      'Review real-time results on three step cards (pass/fail and key metrics).',
      'When a step fails, use One-Click Reverse to write back suggested sizes (minimum shaft diameter, key length, bearing dynamic load).',
      'Click Open Tool to refine parameters on individual tool pages; sync back via the chain banner after edits.',
      'When all steps pass, export the chain-level report.',
    ],
    principle:
      'Shaft system design typically sets torque and speed first, then shaft diameter (torsion/combined bending-torsion), then bearings (life and static load), then key connection (crushing and shear). Shared shaft diameter and torque avoid inconsistent manual entry across three tools.',
    formulas: [
      { latex: '\\tau = \\frac{16T}{\\pi d^3}', note: 'Shaft torsional shear stress (simplified)' },
      { latex: 'L_{10h} = \\frac{10^6}{60n}\\left(\\frac{C}{P}\\right)^\\varepsilon', note: 'Bearing life (hours)' },
    ],
    notes: [
      'Changing a shared parameter updates all three steps together.',
      'Bearing step defaults to simplified mode; use full/professional mode on the bearing page for preload or paired mounting.',
      'Reverse results are suggestions—round to standard part sizes.',
    ],
    standards: ['ISO 281 (bearings)', 'GB/T 1095 (parallel keys)'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: [
      'The design chain links single tools and keeps shared parameters consistent; each step still uses that tool’s calculation basis.',
      'Chain-level “all pass” only means simplified shaft, bearing, and key checks passed—not full machine vibration, thermal, fatigue, or assembly validation.',
    ],
    keywords: ['powertrain', 'design chain', 'linked'],
  },

  'design-bolt-joint': {
    title: 'Bolt Joint Design Chain',
    summary:
      'Link bolt preload → bolt group load distribution → weld strength, sharing preload, bolt diameter, and external load.',
    steps: [
      'Create a new chain; enter bolt diameter, pitch, preload, external load, grip length, bolt count and bolt circle radius, weld size, etc.',
      'Review three cards: separation under preload, bolt group allowables, weld adequacy.',
      'Use one-click reverse to adjust preload, bolt count, or fillet weld leg size.',
      'Export chain-level report for records.',
    ],
    principle:
      'Tension bolt joints first ensure no separation under preload, then check the most critical bolt under eccentric loading; welds may carry part or all structural load. Preload affects both separation margin and clamp friction for shear.',
    formulas: [
      { latex: 'F_{M\\min} \\ge F_A \\frac{1-\\Phi}{\\Phi}', note: 'Minimum preload to prevent separation (illustrative; Φ is load factor)' },
    ],
    notes: [
      'Preload is strongly tied to tightening torque; surface condition (μ) has large effect.',
      'Bolt group allowables must match material grade and safety factors.',
    ],
    standards: ['VDI 2230 (preload reference)', 'GB simplified weld strength'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: [
      'The chain keeps preload, bolt group, and weld parameters synchronized, but each step remains a simplified engineering model.',
      'Chain pass does not guarantee freedom from loosening or fatigue—critical joints need full code checks and testing.',
    ],
    keywords: ['bolt', 'preload', 'weld', 'design chain'],
  },

  editor: {
    title: 'Tolerance Stack Editor',
    summary:
      'Build closed and component rings; use worst-case / RSS / modified RSS / 6σ methods to judge whether assembly meets tolerance requirements.',
    steps: [
      'Select analysis type (1D clearance, position, flatness, etc.).',
      'Define the closed ring: name, min/max allowable values, direction, and units.',
      'Add component rings: nominal size, upper deviation ES, lower deviation EI; increasing/decreasing rings are inferred from direction.',
      'Enable advanced mode to enter transfer coefficient k when needed.',
      'For GD&T types, mark size features as hole/shaft (FOS) in the component table; size tolerance can sync from ES/EI.',
      'Step 5 GD&T: choose MMC/LMC; “Auto bonus” sums FOS size tolerances by default, or disable and enter bonus manually.',
      'Select stack method; review pass/fail, contribution, and sigma metrics; use Decision Tools for tolerance sensitivity.',
      'Jump to Monte Carlo or GD&T Stack for further analysis.',
    ],
    principle:
      'A tolerance stack describes closed dimensional relationships in assembly. The closed ring is the final clearance or position to guarantee; component rings are part dimensions. Worst-case assumes errors align in the most unfavorable direction; RSS treats errors as independent random variables and estimates total tolerance via root-sum-square, closer to batch production.',
    formulas: [
      { latex: 'T_{\\text{worst}} = \\sum |\\xi_i| T_i', note: 'Worst-case total tolerance' },
      { latex: 'T_{\\text{RSS}} = \\sqrt{\\sum (\\xi_i T_i)^2}', note: 'RSS total tolerance' },
    ],
    notes: [
      'Use worst-case for safety-critical parts; RSS for general assembly—but do not release high-risk parts on RSS alone.',
      'Increasing rings enlarge the closed ring when they grow; decreasing rings do the opposite—sketching helps verify direction.',
      'Tighten tolerances on rings with highest contribution for best cost-effectiveness.',
    ],
    standards: ['ASME Y14.5 (GD&T bonus tolerance concept)'],
    example: 'Clearance chain: housing bore spacing is an increasing ring, shaft segment length is decreasing; closed ring is assembly clearance.',
    useCases: [
      'Verify assembly clearance, stacked tolerances, position/flatness against drawing requirements.',
      'Compare worst-case vs RSS to judge whether tolerances are too tight or too loose.',
      'Find the largest contributing ring to guide tolerance tightening or process control.',
    ],
    inputs: [
      {
        name: 'Closed ring',
        meaning: 'The result to guarantee—clearance, total length, positional error, or flatness error.',
        source: 'Functional dimensions on drawings, assembly requirements, or GD&T feature control frames.',
      },
      {
        name: 'Component rings',
        meaning: 'Part dimensions or form errors in the stack. Each ring needs nominal value and tolerance.',
        source: 'Part drawings, tolerance tables, measurement data; enter ES/EI as upper/lower deviation.',
      },
      {
        name: 'Increasing / decreasing / direction',
        meaning: 'Whether the closed ring grows or shrinks when this ring increases.',
        source: 'Sketch the chain along the closed-ring direction; the tool assists from direction settings.',
      },
      {
        name: 'Transfer coefficient k',
        meaning: 'Multiplier for closed-ring change per unit change in a component ring.',
        source: 'Usually 1 for simple 1D sizes; derive from geometry for levers, angles, or projections.',
      },
      {
        name: 'FOS and size tolerance',
        meaning: 'Hole/shaft size features under GD&T for MMC/LMC auto bonus tolerance.',
        source: 'Drawing size features and their tolerances; can sync from ES/EI.',
      },
    ],
    outputs: [
      {
        name: 'Total tolerance',
        meaning: 'Closed-ring variation after stacking component rings by the selected method.',
        judgement: 'Total tolerance must be less than the allowable closed-ring range to have a chance to pass.',
      },
      {
        name: 'Upper / lower bounds',
        meaning: 'Predicted minimum and maximum closed-ring results.',
        judgement: 'Must fall within target min/max; if worst-case fails but RSS passes, assess risk level.',
      },
      {
        name: 'Contribution',
        meaning: 'Each ring’s share of total variation.',
        judgement: 'Highest contribution rings are the first optimization targets.',
      },
      {
        name: 'Cpk / pass rate',
        meaning: 'Process capability estimate under statistical assumptions.',
        judgement: 'Depends on normality, independence, and process centering—not equal to actual batch yield.',
      },
    ],
    reliability: [
      'Worst-case is a conservative bound model—suited to safety-critical parts and strong regulatory contexts.',
      'RSS assumes independent random rings—suited to stable batch production; use Monte Carlo or measured data when rings correlate or processes drift.',
      'GD&T auto bonus estimates from FOS size tolerance for early assessment; formal inspection should use actual size departure and gage rules.',
    ],
    keywords: ['tolerance stack', 'RSS', 'GD&T', 'clearance'],
  },

  batch: {
    title: 'Batch Verification',
    summary: 'Run RSS/worst-case checks on many tolerance stack datasets at once—suited to tabular design comparison.',
    steps: [
      'Prepare multiple rows of component ring data per page format (or paste from a spreadsheet).',
      'Select check method and closed-ring requirements.',
      'Run batch calculation and review pass/fail per row.',
      'Export results for records.',
    ],
    principle: 'Same stacking formulas as the single-chain editor, with batch-oriented input and output.',
    notes: ['Validate one chain in the editor first to confirm direction and units.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['batch', 'verification'],
  },

  allocation: {
    title: 'Tolerance Allocation',
    summary:
      'When closed-ring tolerance is given, allocate tolerance reasonably across component rings (equal contribution, proportional, optimization, etc.).',
    steps: [
      'Enter closed-ring allowable tolerance and each ring’s nominal size/weight.',
      'Choose allocation method (equal RSS contribution, proportional, etc.).',
      'Compare result tables from several methods and pick a manufacturable set.',
      'Bring results back to the Tolerance Stack Editor for verification.',
    ],
    principle:
      'Tolerance allocation is the inverse of stacking: given total tolerance, find component tolerances. Equal-contribution methods balance variance share; weighting by cost or size is also common.',
    formulas: [
      { latex: 'T_i = \\frac{T_0}{\\sqrt{n}}', note: 'Equal RSS contribution simplified form with n rings and |ξ|=1' },
    ],
    notes: [
      'Round allocated tolerances to achievable grades (e.g. IT classes).',
      'Relax cost-sensitive rings; tighten easy-to-hold rings.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['tolerance allocation', 'Pareto'],
  },

  fit: {
    title: 'ISO 286 Fits',
    summary:
      'Look up upper/lower deviations from hole/shaft tolerance zone codes (e.g. H7/g6) and determine clearance or interference range.',
    steps: [
      'Enter basic size (nominal diameter).',
      'Select hole and shaft tolerance zones (or common fit pairs).',
      'Review hole/shaft ES/EI, es/ei, and max/min clearance (or interference).',
      'Judge fit type (clearance/transition/interference) against design intent.',
    ],
    principle:
      'ISO 286 defines deviations by zone letter (position) and grade (magnitude). Hole basis commonly uses H; shaft basis uses h. Fit type follows relative hole/shaft zone positions.',
    formulas: [
      { latex: 'X_{\\max} = ES - ei', note: 'Maximum clearance (clearance fit)' },
      { latex: 'Y_{\\max} = es - EI', note: 'Maximum interference (interference fit; sign per tool display)' },
    ],
    notes: [
      'Same code yields different deviation values in different size segments.',
      'Transition fits may be clearance or interference—consider assembly process.',
    ],
    standards: ['ISO 286'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['fit', 'H7', 'g6', 'ISO286'],
  },

  'gdt-stack': {
    title: 'GD&T Tolerance Stack',
    summary:
      'Stack position, flatness, coaxiality, and other geometric tolerances; supports MMC/LMC bonus tolerance.',
    steps: [
      'Select GD&T mode (position, flatness, coaxiality, etc.).',
      'Add feature tolerances with direction/coefficients; mark hole/shaft size features and size tolerance.',
      'Choose material condition RFS / MMC / LMC; auto bonus sums FOS size tolerance when enabled.',
      'Check whether stack result lies within allowable zone and review contribution breakdown.',
    ],
    principle:
      'Geometric tolerances accumulate in assembly. Under MMC, position tolerance gains bonus when size departs from maximum material—aligning assemblability judgement with ASME Y14.5.',
    formulas: [
      { latex: 'T_{\\text{eff}} = T_{\\text{stack}} + T_{\\text{bonus}}', note: 'Effective tolerance zone = stacked tolerance + bonus' },
    ],
    notes: [
      'Non-size features (e.g. flatness only) do not participate in size bonus.',
      'Auto bonus uses full size tolerance—conservative/teaching-oriented; use actual inspection state for precision work.',
    ],
    standards: ['ASME Y14.5'],
    useCases: COMMON_USE_CASES,
    inputs: [
      {
        name: 'Geometric tolerance type',
        meaning: 'Whether stacking position, flatness, coaxiality, or another error model.',
        source: 'Drawing GD&T frames and functional requirements.',
      },
      {
        name: 'Datums and component features',
        meaning: 'Define error sources and stack direction.',
        source: 'Datum scheme, locating dimensions, inspection plan.',
      },
      {
        name: 'Material condition and FOS',
        meaning: 'Whether MMC/LMC bonus tolerance applies.',
        source: 'M/L/S symbols on drawings and hole/shaft size tolerances.',
      },
    ],
    outputs: [
      {
        name: 'Stacked tolerance',
        meaning: 'Combined effect of geometric errors by the selected method.',
        judgement: 'Compare with target tolerance zone for functional adequacy.',
      },
      {
        name: 'Bonus tolerance',
        meaning: 'Extra usable tolerance when size departs from MMC/LMC.',
        judgement: 'Auto bonus is for early assessment; formal judgement uses measured size state.',
      },
    ],
    reliability: COMMON_RELIABILITY,
    keywords: ['GD&T', 'position', 'MMC'],
  },

  units: {
    title: 'Unit Conversion',
    summary: 'Convert common mechanics and length units to avoid mixing MPa with psi or mm with in.',
    steps: [
      'Select quantity type (length, stress, force, etc.).',
      'Enter value and source unit; choose target unit.',
      'Copy result into other calculation tools.',
    ],
    principle: 'Conversion factors between unit systems are constants (e.g. 1 in = 25.4 mm, 1 ksi ≈ 6.895 MPa).',
    notes: ['Unit mix-ups are a leading cause of engineering errors—sanity-check magnitude after conversion.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['units', 'MPa', 'psi'],
  },

  'interference-fit': {
    title: 'Interference Fit',
    summary:
      'Estimate contact pressure and transmissible torque from interference using thick-cylinder theory (DIN 7190 approach).',
    steps: [
      'Enter bore/shaft diameters, interference, elastic moduli and Poisson ratios, and engagement length.',
      'Review contact pressure, stresses, and transmissible torque.',
      'Compare with design torque to judge whether interference is adequate or excessive (assembly difficulty/plasticity risk).',
    ],
    principle:
      'Interference creates radial pressure at the interface; friction transmits torque or axial force. Larger interference raises pressure but also assembly force and bore stress.',
    formulas: [
      { latex: 'T = \\pi p \\mu d^2 L / 2', note: 'Friction transmissible torque (illustrative)' },
    ],
    notes: [
      'Surface roughness, lubrication, and temperature also matter.',
      'Large interference requires plasticity and assembly checks (press/shrink fit).',
    ],
    standards: ['DIN 7190 (reference)'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['interference', 'press fit'],
  },

  'thermal-expansion': {
    title: 'Thermal Expansion',
    summary: 'Estimate dimensional change from temperature and its effect on clearance/interference fits.',
    steps: [
      'Enter original length, linear expansion coefficient, and temperature rise (or operating vs assembly temperature).',
      'Review elongation; for fits, compute differential thermal deformation of hole and shaft separately.',
    ],
    principle: 'Most metals expand when heated: ΔL = α L ΔT. Different hole/shaft materials change fit tightness with temperature.',
    formulas: [
      { latex: '\\Delta L = \\alpha L \\Delta T', note: 'Linear thermal expansion' },
    ],
    notes: [
      'α varies by material; steel is roughly 1.2×10⁻⁵ /°C.',
      'High-temperature equipment must include hot-state clearance in tolerance stacks.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['thermal expansion', 'temperature'],
  },

  fatigue: {
    title: 'Fatigue Life',
    summary: 'Estimate life under alternating stress using S-N curves and Miner linear damage accumulation.',
    steps: [
      'Enter material fatigue parameters or select approximate S-N data.',
      'Enter stress amplitude, load spectrum levels, and cycle counts.',
      'Review estimated life and Miner damage sum D; check D < 1.',
    ],
    principle:
      'Fatigue failure arises from cyclic stress—even when peak stress is below static strength. S-N curves relate stress to life; multi-level loading uses Miner’s rule to accumulate damage.',
    formulas: [
      { latex: 'D = \\sum \\frac{n_i}{N_i}', note: 'Miner damage sum; typically require D < 1' },
    ],
    notes: [
      'Surface finish, stress concentration, and corrosion greatly reduce fatigue life.',
      'Miner’s rule is simplified—safety-critical parts need larger margin or test validation.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['fatigue', 'Miner', 'S-N'],
  },

  gear: {
    title: 'Gear Strength',
    summary: 'Check contact and bending strength per ISO 6336 / AGMA approaches.',
    steps: [
      'Enter module, tooth count, face width, power/torque, speed, and material allowables.',
      'Select standard system (ISO / AGMA) and calculation mode.',
      'Review contact stress, bending stress, and safety factors.',
    ],
    principle:
      'Common gear failures are pitting (contact fatigue) and tooth breakage (bending fatigue). Check flank and root separately; include load factors, dynamic load, and accuracy.',
    formulas: [
      { latex: '\\sigma_H \\le \\sigma_{HP}', note: 'Contact stress within allowable' },
      { latex: '\\sigma_F \\le \\sigma_{FP}', note: 'Root bending stress within allowable' },
    ],
    notes: [
      'Accuracy grade and mounting errors strongly affect dynamic load.',
      'Poor lubrication significantly reduces contact fatigue life.',
    ],
    standards: ['ISO 6336', 'AGMA'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['gear', 'contact', 'bending'],
  },

  thread: {
    title: 'Thread Strength',
    summary: 'Check thread tension and shear and estimate tightening torque vs axial force.',
    steps: [
      'Enter nominal diameter, pitch, engaged length, material allowables, and axial load.',
      'Review root tensile stress, shear stress, and safety margin.',
      'Review torque–preload conversion when needed.',
    ],
    principle:
      'External load is shared by engaged threads. The root section is in tension, flanks in shear; during tightening, torque overcomes thread friction and generates preload.',
    formulas: [
      { latex: '\\sigma_t = \\frac{F}{A_s}', note: 'Tensile stress on thread stress area (simplified)' },
    ],
    notes: [
      'Short engagement makes shear more critical.',
      'Preload scatter is large when friction coefficient is uncertain.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['thread', 'strength'],
  },

  'bolt-preload': {
    title: 'Bolt Preload',
    summary:
      'Convert between preload and tightening torque; check separation and bolt stress under service load.',
    steps: [
      'Choose mode: torque from preload, or preload from torque.',
      'Enter diameter, pitch, property class, friction coefficients, grip length, and external load.',
      'Review preload, torque, working stress, and separation conclusion.',
      'Professional mode adds embedment, stiffness split, etc.',
    ],
    principle:
      'Preload compresses the joint and stretches the bolt. Under external load, bolt force increment and clamped-part unloading split by stiffness. Insufficient preload causes separation; excessive preload yields the bolt or strips threads.',
    formulas: [
      { latex: 'T = F_M (0.16 p + 0.58 \\mu_G d_2 + 0.5 \\mu_K D_K)', note: 'Torque–preload approximation (VDI approach)' },
    ],
    notes: [
      'Use handbook or test values for μ; lubrication and surface treatment have major effect.',
      'Preload at the same torque can vary by ±20% or more—critical joints need tighter control methods.',
    ],
    standards: ['VDI 2230 (reference)'],
    useCases: [
      'Known target preload—estimate required tightening torque.',
      'Known torque—estimate likely preload and check separation prevention.',
    ],
    inputs: [
      {
        name: 'Bolt diameter / pitch / grade',
        meaning: 'Governs stress area, strength, and thread lead angle.',
        source: 'Standard fastener spec, drawing, or selection table.',
      },
      {
        name: 'Friction coefficients μG / μK',
        meaning: 'Determine how much torque becomes preload—the largest uncertainty.',
        source: 'Lubrication, surface finish, test data; use conservative ranges when unknown.',
      },
      {
        name: 'Grip length and external load',
        meaning: 'Govern stiffness split and separation risk.',
        source: 'Assembly geometry, force analysis, service loads.',
      },
    ],
    outputs: [
      {
        name: 'Preload / torque',
        meaning: 'Target values for assembly control.',
        judgement: 'Must satisfy both no separation and no overload.',
      },
      {
        name: 'Working stress',
        meaning: 'Bolt stress under preload plus external load.',
        judgement: 'Must not exceed material allowable or yield limit.',
      },
      {
        name: 'Separation check',
        meaning: 'Whether clamped parts remain in contact under external load.',
        judgement: 'Separation leads to fatigue, loosening, or seal failure—avoid first.',
      },
    ],
    reliability: [
      'Torque-controlled preload has large scatter; actual preload can vary significantly at the same torque.',
      'Critical joints should be verified with VDI 2230, friction tests, torque-angle, or direct tension methods.',
    ],
    keywords: ['preload', 'torque', 'VDI'],
  },

  bearing: {
    title: 'Bearing Life',
    summary:
      'Calculate equivalent dynamic load and L10 life per ISO 281; supports X/Y lookup, reliability factor, preload, and duplex mounting.',
    steps: [
      'Choose mode: simplified (manual X/Y) or full (auto lookup by series).',
      'Enter C, C0, Fr, Fa, speed, and target life.',
      'Full mode: optional bearing series/model, aISO life adjustment, reliability.',
      'Optional mounting (single / DB / DF / DT) and axial preload F0.',
      'Review equivalent load P, life in hours, and static safety factor.',
    ],
    principle:
      'Rolling bearing life follows a power law with load. Equivalent dynamic load combines radial and axial load into one value comparable to rated dynamic load C. L10 is basic rating life at 90% reliability.',
    formulas: [
      { latex: 'P = X F_r + Y F_a', note: 'Equivalent dynamic load' },
      { latex: 'L_{10} = (C/P)^\\varepsilon', note: 'Life in million revolutions; ε=3 for ball bearings, 10/3 for roller bearings' },
      { latex: 'L_{10h} = \\frac{10^6}{60 n} L_{10}', note: 'Life in hours' },
    ],
    notes: [
      'Preload increases effective axial load—life usually drops but stiffness rises.',
      'Tandem DT counts two bearings for C; back-to-back/face-to-face often adjust Y for pairing.',
      'Contamination and temperature shorten life; professional mode uses aISO and temperature factors.',
    ],
    standards: ['ISO 281:2007'],
    example: 'Motor shaft: Fr=5000 N, Fa=1000 N, n=1500 rpm, C=35000 N, target 10000 h.',
    useCases: [
      'Known bearing loads and speed—check whether life meets target hours.',
      'Compare bearing models, rated C, life factors, preload, or mounting on life.',
    ],
    inputs: [
      {
        name: 'C / C0',
        meaning: 'Rated dynamic and static loads—basis for life and static safety.',
        source: 'Bearing catalog, manufacturer tables, or standard listings.',
      },
      {
        name: 'Fr / Fa',
        meaning: 'Radial and axial loads—determine equivalent dynamic load P.',
        source: 'Shaft force analysis, gear/belt/chain loads, tests, or upstream simulation.',
      },
      {
        name: 'X / Y or bearing series',
        meaning: 'Load factors combining Fr/Fa into P.',
        source: 'Full mode auto lookup by series; simplified mode from catalog or standard.',
      },
      {
        name: 'Speed n and target life',
        meaning: 'Convert million-rev life to hours and form pass criteria.',
        source: 'Equipment speed, duty cycle, maintenance interval, or specification.',
      },
      {
        name: 'Mounting and preload',
        meaning: 'DB/DF/DT and axial preload change equivalent load, rated load, or stiffness.',
        source: 'Bearing layout, preload design, manufacturer recommendations.',
      },
    ],
    outputs: [
      {
        name: 'P equivalent dynamic load',
        meaning: 'Combined load used in the life formula.',
        judgement: 'Higher P sharply reduces life—verify load direction and X/Y first.',
      },
      {
        name: 'L10 / L10h',
        meaning: 'Basic rating life at 90% reliability—in million rev or hours.',
        judgement: 'Pass when L10h ≥ target life; higher reliability requirements reduce adjusted life.',
      },
      {
        name: 'S0 static safety',
        meaning: 'Ratio of C0 to static equivalent load.',
        judgement: 'Do not rely on life alone for shock or slow heavy load—check S0.',
      },
      {
        name: 'Stiffness estimate',
        meaning: 'Rough radial stiffness in professional mode for comparing preload/layout.',
        judgement: 'For design comparison only—not a substitute for manufacturer stiffness curves.',
      },
    ],
    reliability: [
      'Life follows ISO 281 rating models; actual life also depends on lubrication, contamination, mounting error, temperature, shock, and sealing.',
      'X/Y lookup and series selection must be correct; consult catalogs for angular-contact pairs, preload, and load direction.',
      'L10 is statistical—not every bearing will reach that hour count.',
    ],
    keywords: ['bearing', 'L10', 'ISO281'],
  },

  beam: {
    title: 'Beam Deflection',
    summary:
      'Compute maximum deflection and bending moment for simply supported and cantilever beams under point or uniform load—hand calculation before FEA.',
    steps: [
      'Select beam type and loading.',
      'Enter span, load, second moment of area, and elastic modulus.',
      'Review max deflection and moment vs allowable deflection.',
    ],
    principle:
      'In strength of materials, beam deflection is governed by moment and EI. Common cases have closed-form formulas for quick stiffness checks.',
    formulas: [
      { latex: '\\delta_{\\max} = \\frac{F L^3}{48 EI}', note: 'Simply supported beam, center point load' },
    ],
    notes: ['Formulas assume small deflection, linear elasticity, negligible shear (short deep beams need separate check).'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['beam', 'deflection'],
  },

  'sheet-metal': {
    title: 'Sheet Metal Unfold',
    summary: 'Calculate developed length using K-factor or bend deduction for nesting.',
    steps: [
      'Enter sheet thickness, bend radius, bend angle, and straight leg lengths.',
      'Choose K-factor or empirical deduction method.',
      'Obtain total unfold length for laser cutting or shearing.',
    ],
    principle: 'During bending the neutral axis is not mid-thickness; K-factor locates the neutral layer for arc segment development.',
    formulas: [
      { latex: 'BA = 2\\pi \\frac{A}{360}(R + K t)', note: 'Bend allowance (illustrative)' },
    ],
    notes: ['K-factor depends on material, tooling, and process—verify critical parts by trial bend.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['sheet metal', 'K-factor', 'unfold'],
  },

  'o-ring': {
    title: 'O-Ring Sealing',
    summary: 'Check groove compression and fill ratio to judge under- or over-compression.',
    steps: [
      'Enter O-ring cross-section, inner diameter, and groove dimensions.',
      'Review compression and fill ratio vs recommended ranges.',
    ],
    principle: 'Elastic compression creates contact stress for sealing. Insufficient compression leaks; excessive compression hampers assembly and accelerates aging.',
    notes: ['Media and temperature dictate elastomer; dynamic seals usually use lower compression than static.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['O-ring', 'seal'],
  },

  shaft: {
    title: 'Shaft Strength',
    summary: 'Check solid round shaft torsion; full mode adds combined bending-torsion and safety factor.',
    steps: [
      'Enter shaft diameter, torque, and material yield strength.',
      'In full mode add bending moment etc.; review combined stress and safety factor.',
      'If inadequate, increase diameter or higher-strength material; use Decision Tools to reverse minimum diameter.',
    ],
    principle:
      'Torque produces shear stress inversely proportional to diameter cubed. With bending, combine per third or fourth strength theory.',
    formulas: [
      { latex: '\\tau = \\frac{16T}{\\pi d^3}', note: 'Torsional shear stress' },
      { latex: 'S = \\frac{\\sigma_s / \\sqrt{3}}{\\tau}', note: 'Safety factor from shear yield estimate (illustrative)' },
    ],
    notes: [
      'Keyways and steps cause stress concentration—actual diameter often exceeds pure-torsion sizing.',
      'Units: use N·mm or N·m consistently with the tool.',
    ],
    useCases: [
      'Verify shaft diameter for torque transmission or reverse minimum diameter.',
      'First step in the powertrain design chain—provides shared diameter for bearing and key steps.',
    ],
    inputs: [
      {
        name: 'Torque T',
        meaning: 'Primary load when transmitting power.',
        source: 'From power and speed, or motor/reducer output torque.',
      },
      {
        name: 'Shaft diameter d',
        meaning: 'Governs torsional section modulus—the most sensitive geometric parameter.',
        source: 'Initial layout, standard shaft sizes, or rounded reverse result.',
      },
      {
        name: 'Material yield strength',
        meaning: 'Strength benchmark for yield check.',
        source: 'Material grade and heat treatment; prefer allowable stress or company standard.',
      },
      {
        name: 'Bending moment / length (full mode)',
        meaning: 'Combined bending-torsion—not pure torsion alone.',
        source: 'Bearing reactions, gear/pulley/sprocket loads, free-body diagram.',
      },
    ],
    outputs: [
      {
        name: 'Shear / equivalent stress',
        meaning: 'Nominal stress on the shaft section under working load.',
        judgement: 'Must be below allowable; account for keyways, steps, and stress concentration.',
      },
      {
        name: 'Safety factor',
        meaning: 'Margin of material strength or allowable vs working stress.',
        judgement: 'Closer to 1 is riskier; shock, fatigue, or critical parts need higher factors.',
      },
      {
        name: 'Recommended diameter',
        meaning: 'Theoretical size from reverse calculation meeting target.',
        judgement: 'Round up to standard diameter; consider fits, bearing bore, and keyway weakening.',
      },
    ],
    reliability: [
      'Pure torsion suits quick sizing; real shafts often have bending, steps, keyways, fatigue, and deflection limits.',
      'Strength pass does not imply stiffness, critical speed, or fatigue life pass.',
    ],
    keywords: ['shaft', 'torsion'],
  },

  key: {
    title: 'Parallel Key Connection',
    summary: 'Check key side crushing and key shear strength.',
    steps: [
      'Enter torque, shaft diameter, key width, height, length, and allowable crushing/shear stress.',
      'Verify crushing and shear stress vs allowables.',
      'If fail, lengthen key or larger section per standard key series.',
    ],
    principle: 'Torque transfers through key side crushing to the hub; the key also shears across its width.',
    formulas: [
      { latex: '\\sigma_p = \\frac{4T}{d h L}', note: 'Crushing stress (common simplification)' },
      { latex: '\\tau = \\frac{2T}{d b L}', note: 'Shear stress (common simplification)' },
    ],
    notes: [
      'Key length seldom exceeds ~1.5d–2d; longer keys carry load non-uniformly.',
      'Select standard b×h per GB/T 1095.',
    ],
    standards: ['GB/T 1095', 'GB/T 1096'],
    useCases: COMMON_USE_CASES,
    inputs: [
      {
        name: 'T, d, b, h, L',
        meaning: 'Torque, shaft diameter, key width, height, and length govern shear and crushing stress.',
        source: 'Shaft design, standard key sizes, and hub length.',
      },
      {
        name: 'Allowable shear / crushing stress',
        meaning: 'Benchmark for key and hub material adequacy.',
        source: 'Material handbook, company standard, or assignment allowables.',
      },
    ],
    outputs: [
      {
        name: 'Shear stress',
        meaning: 'Risk of key shearing along the section.',
        judgement: 'Shear stress must be below allowable shear stress.',
      },
      {
        name: 'Crushing stress',
        meaning: 'Contact pressure on key sides vs hub/shaft keyway.',
        judgement: 'Crushing often governs for parallel keys.',
      },
    ],
    reliability: [
      'Formulas use nominal uniform load along key length; long keys carry load non-uniformly.',
      'Also check keyway weakening of shaft, hub wall thickness, and fit.',
    ],
    keywords: ['parallel key', 'crushing'],
  },

  weld: {
    title: 'Weld Strength',
    summary: 'Static strength check for fillet welds; full mode compares simplified results from multiple codes.',
    steps: [
      'Enter leg size, weld length, load, and steel grade.',
      'Review calculated stress vs allowable and pass/fail.',
    ],
    principle: 'Fillet welds are often checked on throat section stress. Eccentric load adds bending-induced stress.',
    formulas: [
      { latex: '\\tau = \\frac{F}{0.7 h_f L}', note: 'Fillet weld shear simplified (throat ≈ 0.7 hf)' },
    ],
    notes: ['Actual strength depends on process and inspection level—calculation is nominal strength.'],
    useCases: COMMON_USE_CASES,
    inputs: [
      {
        name: 'Leg size / weld length',
        meaning: 'Determine effective throat area.',
        source: 'Weld drawing or initial design; throat ≈ 0.7 hf for fillet welds.',
      },
      {
        name: 'Load and eccentricity',
        meaning: 'Shear and added bending moment on the weld.',
        source: 'Structural analysis, connection location, moment arm.',
      },
      {
        name: 'Steel / allowable stress',
        meaning: 'Strength benchmark for weld check.',
        source: 'Base metal, filler, welding specification, or company allowables.',
      },
    ],
    outputs: [
      {
        name: 'Weld stress',
        meaning: 'Nominal stress on effective throat.',
        judgement: 'Must be below allowable; consider weld class and load type.',
      },
      {
        name: 'Pass / Fail',
        meaning: 'Preliminary check per current simplified code criteria.',
        judgement: 'If fail, increase leg size, extend weld, or change layout.',
      },
    ],
    reliability: [
      'Weld calculation does not replace WPS/PQR, NDE, or fatigue assessment.',
      'Dynamic, low-temperature, thick-plate restraint, and defect-sensitive structures need fuller code checks.',
    ],
    keywords: ['weld', 'fillet'],
  },

  'bolt-group': {
    title: 'Bolt Group',
    summary: 'Compute bolt forces under eccentric loading; find critical bolt and compare to allowable.',
    steps: [
      'Enter bolt count, bolt circle radius, shear, moment/torque, and single-bolt allowable.',
      'If friction shear from preload applies, enter related parameters.',
      'Review per-bolt forces and whether maximum exceeds limit.',
    ],
    principle:
      'A bolt group carries resultant force and moment at the centroid. Direct shear splits among bolts (or via friction); moment assigns force proportional to distance from centroid—outer bolts are often critical.',
    formulas: [
      { latex: 'F_{iM} \\propto r_i', note: 'Bolt force from moment proportional to radius' },
    ],
    notes: ['Symmetric layout reduces eccentricity.', 'Friction connections rely on preload—after slip, behavior becomes bearing-type.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['bolt group', 'eccentric'],
  },

  spring: {
    title: 'Spring Design',
    summary: 'Calculate coil spring stiffness and shear stress; judge load–deflection requirements.',
    steps: [
      'Enter wire diameter, mean coil diameter, active coils, shear modulus, and load.',
      'Review spring rate, deflection, and shear stress.',
    ],
    principle:
      'Helical springs convert axial force to wire torsion and shear; stiffness scales with wire diameter to the fourth power and inversely with mean diameter cubed.',
    formulas: [
      { latex: 'k = \\frac{G d^4}{8 D^3 n}', note: 'Cylindrical helical compression/tension spring rate' },
    ],
    notes: ['Check solid height and fatigue under alternating load.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['spring', 'stiffness'],
  },

  clutch: {
    title: 'Clutch',
    summary: 'Estimate transmissible torque of a friction clutch.',
    steps: [
      'Enter friction surface dimensions, count, clamp force, and friction coefficient.',
      'Check transmissible torque vs working torque.',
    ],
    principle: 'Friction surfaces under normal force produce friction torque; multiple discs increase capacity.',
    formulas: [
      { latex: 'T = n \\mu F R_m', note: 'Friction torque illustrative; Rm is equivalent friction radius' },
    ],
    notes: ['μ varies with temperature and wear—design with margin.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['clutch', 'friction'],
  },

  belt: {
    title: 'Belt Drive',
    summary: 'Calculate belt length, wrap angle, speed, and required belt count.',
    steps: [
      'Enter pulley diameters, center distance, power, and speed.',
      'Review belt length, wrap angle, belt speed, and limit checks.',
    ],
    principle: 'Belts transmit by friction; small wrap angle on the driver pulley promotes slip; high belt speed reduces effective clamp from centrifugal force.',
    notes: ['Open vs crossed drive use different length formulas—select per page option.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['belt', 'belt drive'],
  },

  chain: {
    title: 'Chain Drive',
    summary: 'Calculate chain length, center distance, and chain tension.',
    steps: [
      'Enter sprocket teeth, pitch, power, and speed.',
      'Review chain speed, tension, and recommended center distance.',
    ],
    principle: 'Chain drive is positive engagement with accurate average ratio; polygon effect causes speed fluctuation.',
    notes: ['Lubrication and sag affect life and noise.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['chain drive', 'pitch'],
  },

  structural: {
    title: 'Structure / Fluids',
    summary: 'Collection of structure and fluid estimates: pressure drop, column buckling, simple modes, etc.',
    steps: [
      'Choose sub-function (pressure drop / buckling / modes, etc.).',
      'Enter geometry and material parameters as prompted.',
      'Review critical load or pressure drop results.',
    ],
    principle:
      'Column buckling follows Euler theory for slender members; pipe pressure drop relates to velocity and friction loss coefficients.',
    formulas: [
      { latex: 'F_{cr} = \\frac{\\pi^2 EI}{(\\mu L)^2}', note: 'Euler critical load' },
    ],
    notes: ['Euler applies to slender columns; short stocky columns need other empirical formulas.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['buckling', 'pressure drop', 'modes'],
  },

  'material-selection': {
    title: 'Material Selection',
    summary: 'Score and rank candidate materials by strength, density, cost, and other metrics.',
    steps: [
      'Set weights for criteria (strength, cost, weight, etc.).',
      'Pick candidates from library or enter properties.',
      'Review composite score and shortlist for detailed checks.',
    ],
    principle: 'Material selection is multi-objective: weighted scoring normalizes different units for comparison.',
    notes: ['Scoring does not replace strength verification or manufacturability assessment.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['material selection'],
  },

  'heat-treatment': {
    title: 'Heat Treatment Hardness',
    summary: 'Estimate hardenability (Jominy), carbon equivalent, and tempered hardness indicators.',
    steps: [
      'Enter composition or select steel-related parameters.',
      'Review hardening depth trend, weldability hint from carbon equivalent, tempered hardness estimate.',
    ],
    principle:
      'Hardenability describes hardened depth after quenching; high carbon equivalent increases cold-cracking risk in welding; tempering lowers hardness and raises toughness.',
    notes: ['Actual heat-treatment curves should follow process trials and standard charts.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['heat treatment', 'Jominy', 'tempering'],
  },

  manufacturing: {
    title: 'Manufacturing Process',
    summary: 'Estimate machining allowance, casting draft angle, and related process parameters.',
    steps: [
      'Select process type (machining / casting, etc.).',
      'Enter part size and accuracy requirements.',
      'Obtain suggested allowance or draft angle.',
    ],
    principle: 'Stock needs machining allowance for final size and surface quality; castings need draft for mold release.',
    notes: ['Excess allowance wastes material and time; too little may not remove casting skin.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['allowance', 'draft angle'],
  },

  cylinder: {
    title: 'Hydraulic / Pneumatic Cylinder',
    summary: 'Calculate cylinder force, speed, and required flow.',
    steps: [
      'Enter bore, rod diameter, working pressure, and flow (or speed).',
      'Review rod-side and cap-side force and speed.',
    ],
    principle: 'Force comes from pressure on effective piston area; speed follows flow and area.',
    formulas: [
      { latex: 'F = p A', note: 'Theoretical force (efficiency not included)' },
      { latex: 'v = Q / A', note: 'Speed vs flow (watch unit conversion)' },
    ],
    notes: ['Multiply by cylinder efficiency for actual force; seal friction reduces output.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['hydraulic', 'cylinder', 'force'],
  },

  materials: {
    title: 'Materials Library',
    summary: 'Look up strength, elastic modulus, and other properties for use in other calculators.',
    steps: [
      'Search or browse the material list.',
      'Review yield, tensile, elastic modulus, etc.',
      'Enter values into shaft, bolt, beam, and other tools.',
    ],
    principle:
      'The library provides typical handbook values for teaching and preliminary sizing; properties vary greatly by grade and heat treatment.',
    notes: ['Use mill certificates or national standards for formal work—library values are typical.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['materials library', 'strength'],
  },

  statistics: {
    title: 'Statistics Tools',
    summary:
      'Tolerance vs standard deviation, RSS stacking, sigma/Cpk, and distribution plots—support statistical interpretation of tolerance stacks.',
    steps: [
      'On the statistics page, choose sub-tool: tolerance conversion, RSS, sigma, or distribution plot.',
      'Enter tolerance or σ, component ring tolerances, etc.',
      'Interpret Cpk, pass rate, and whether the distribution is centered.',
    ],
    principle:
      'If dimensions are approximately normal, tolerance bands are often interpreted as ±3σ or ±nσ. Cpk reflects both spread and offset; RSS statistically combines multiple tolerances.',
    formulas: [
      { latex: 'C_{pk} = \\min\\!\\left(\\frac{USL-\\mu}{3\\sigma},\\frac{\\mu-LSL}{3\\sigma}\\right)', note: 'Process capability index' },
    ],
    notes: ['Statistical conclusions depend on normality and independence—be cautious with small batches.'],
    useCases: COMMON_USE_CASES,
    inputs: [
      {
        name: 'Tolerance T / standard deviation σ',
        meaning: 'Link drawing tolerance to process variation.',
        source: 'Drawing tolerance, measurement data, or capability report.',
      },
      {
        name: 'Spec limits USL/LSL and mean μ',
        meaning: 'Judge process centering and capability.',
        source: 'Drawing limits and measured sample statistics.',
      },
    ],
    outputs: [
      {
        name: 'Cp / Cpk',
        meaning: 'Process capability; Cpk includes both spread and offset.',
        judgement: 'Cpk ≥ 1.33 is common—but follow customer/company requirements.',
      },
      {
        name: 'Pass rate',
        meaning: 'Probability within spec under normal assumption.',
        judgement: 'Do not over-trust when data are non-normal or sample size is small.',
      },
    ],
    reliability: COMMON_RELIABILITY,
    keywords: ['Cpk', 'RSS', 'sigma'],
  },

  'monte-carlo': {
    title: 'Monte Carlo Simulation',
    summary: 'Random sampling on tolerance stacks to estimate pass rate and sensitivity (tornado chart).',
    steps: [
      'Import chain from editor or enter ring tolerances and distributions manually.',
      'Set iteration count and run simulation.',
      'Review pass rate, histogram, and sensitivity ranking.',
    ],
    principle:
      'Each component ring is sampled from its distribution; closed ring is computed repeatedly to build a statistical distribution. Handles non-normal and nonlinear cases better than RSS alone.',
    notes: [
      'Too few samples yield unstable results.',
      'If input distributions do not match real process, precise simulation is meaningless.',
    ],
    useCases: [
      'RSS assumptions are uncertain—use random simulation to see closed-ring distribution.',
      'Component distributions are not simple normal, or you need pass rate and sensitivity.',
    ],
    inputs: [
      {
        name: 'Component distributions',
        meaning: 'Random variation model for each dimension in production.',
        source: 'Capability data, measurement records; assume normal or uniform when data are missing.',
      },
      {
        name: 'Iteration count',
        meaning: 'Number of random samples—more stable but slower.',
        source: 'Start with 10,000; increase for rare tail probabilities.',
      },
      {
        name: 'Spec upper/lower limits',
        meaning: 'Boundaries for pass/fail on each simulation.',
        source: 'Closed-ring min/max or drawing requirements.',
      },
    ],
    outputs: [
      {
        name: 'Distribution / histogram',
        meaning: 'Shows where closed-ring results concentrate.',
        judgement: 'Center near target with thin tails is more robust.',
      },
      {
        name: 'Pass rate / PPM',
        meaning: 'Fraction of samples within specification.',
        judgement: 'Estimate based on assumed distributions—not a production guarantee.',
      },
      {
        name: 'Sensitivity ranking',
        meaning: 'Which inputs most affect the closed ring.',
        judgement: 'Control highest-ranked parameters first.',
      },
    ],
    reliability: [
      'Monte Carlo credibility depends mainly on whether input distributions match real manufacturing.',
      'Simulation handles nonlinearity and non-normality but cannot fix wrong models or bad data.',
    ],
    keywords: ['Monte Carlo', 'simulation'],
  },

  quality: {
    title: 'MSA / SPC / FMEA',
    summary: 'Entry points for measurement system analysis, control charts, and failure mode analysis.',
    steps: [
      'Choose MSA, SPC, or FMEA submodule.',
      'Enter repeatability/reproducibility data or control chart samples per form.',
      'Interpret %GRR, control limits, or RPN.',
    ],
    principle:
      'MSA evaluates measurement error acceptability; SPC monitors process control; FMEA systematically identifies failure risk and prioritizes improvement.',
    notes: ['Quality tools support process improvement—they need field data, not one-off calculation alone.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['MSA', 'SPC', 'FMEA'],
  },

  analytics: {
    title: 'Regression / DOE / RSM',
    summary: 'Fit regression models, orthogonal experiments, and response surfaces for process optimization.',
    steps: [
      'Prepare factor and response data.',
      'Choose regression, orthogonal array, or response surface method.',
      'Review fit quality, main effects, and optimum direction.',
    ],
    principle: 'DOE estimates factor effects with fewer runs; regression and RSM turn test data into predictive approximate models.',
    notes: ['Models are reliable within the experimental domain—extrapolate cautiously.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['DOE', 'regression', 'response surface'],
  },
}

/**
 * @param {import('@/constants/tool-help').HelpArticle | null} article
 * @param {import('@/i18n').Locale} locale
 */
export function localizeHelpArticle(article, locale) {
  if (!article || locale !== 'en') return article
  const en = toolHelpEnById[article.id]
  if (!en) return article
  return {
    ...article,
    ...en,
    id: article.id,
    path: article.path,
    groupId: article.groupId,
    level: article.level,
    related: article.related,
  }
}
