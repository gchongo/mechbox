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
      'Critical inputs in Full/Professional: pending fields show amber border and a trailing *; numeric results stay visible while overall status is often review until each field is edited. Simple mode has no gate and no highlight.',
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
    summary:
      'Quality-engineering workflow: run RSS and worst-case checks on many component tolerance lists at once against a closed-loop min/max band. Up to 50 schemes; CSV paste and export supported. Logic matches the Tolerance Stack Editor; summary panel explains methodology and method-risk hints.',
    steps: [
      'Under Target specification, enter closed-loop min and max (mm)—the allowable synthesized size band.',
      'Under Batch input, one row per scheme: name,tol1,tol2,… (comma-separated; optional transfer factors default to 1).',
      'Click Run verification; review per-row RSS/worst tolerance width, pass/fail, and method-risk hints.',
      'Read the summary methodology block; if “RSS pass / worst fail” count > 0, do not release on RSS alone.',
      'Export CSV for records; for formal release, verify ring directions and nominals in the editor.',
    ],
    principle:
      'Batch mode tabularizes editor RSS/worst-case stacking: zero nominal per ring, symmetric band $\\pm T_i/2$, all increasing rings. Pass compares synthesized interval $[L,U]$ to $[\\min,\\max]$, not merely whether total tolerance width fits a budget.',
    formulas: [
      {
        latex: 'T_{\\mathrm{worst}} = \\sum_i T_i f_i',
        note: 'Worst-case total; default $f_i=1$. Band $[L,U]=[-T_{\\mathrm{worst}}/2,\\,+T_{\\mathrm{worst}}/2]$',
      },
      {
        latex: 'T_{\\mathrm{rss}} = \\sqrt{\\sum_i (T_i f_i)^2}',
        note: 'RSS total; band $[L,U]=[-T_{\\mathrm{rss}}/2,\\,+T_{\\mathrm{rss}}/2]$',
      },
      {
        latex: 'L \\ge \\min \\;\\land\\; U \\le \\max \\Rightarrow \\text{pass}',
        note: 'RSS and worst-case judged independently',
      },
      {
        latex: 'R = T_{\\mathrm{worst}} / T_{\\mathrm{rss}}',
        note: 'Method ratio; $R\\ge 1.5$ caution, $R\\ge 2$ warning',
      },
    ],
    notes: [
      '“Fail” = both RSS and worst fail; “RSS pass / worst fail” = RSS OK but worst not—priority review for safety-critical parts.',
      'Row hint “RSS ✓ worst ✗ — do not release on RSS alone” marks critical method gap.',
      'Default closed-loop min = 0 with all-increasing zero-nominal rings often yields negative RSS lower bound—set min/max to match your functional band, not only a tolerance budget.',
      'Sample data with default targets may show all fail due to target setup, not necessarily bad tolerances.',
      'Batch input has no nominals or increasing/decreasing direction—build complex chains in the editor first.',
    ],
    example:
      'Three rings 0.05, 0.04, 0.03 mm ($f_i=1$): $T_{\\mathrm{worst}}=0.12$ mm → $[-0.06,+0.06]$; $T_{\\mathrm{rss}}=0.0707$ mm → $[-0.0354,+0.0354]$. Target $[0,0.10]$ mm: both pass. Target $[0,0.05]$ mm: RSS pass, worst fail—“RSS pass / worst fail” +1 in summary.',
    useCases: [
      'One-shot RSS/worst-case screening of many supplier or internal tolerance proposals.',
      'After allocation or Monte Carlo, batch-check ring lists against the same closed-loop band.',
      'Compare tolerance widths and method-risk ratio across schemes.',
    ],
    inputs: [
      {
        name: 'Closed-loop min / max',
        meaning: 'Allowable synthesized interval (mm); pass requires $L\\ge\\min$ and $U\\le\\max$.',
        source: 'Functional requirement or editor step 2—do not confuse with total tolerance budget only.',
      },
      {
        name: 'Tolerance list $T_i$',
        meaning: 'Full width per ring (mm), comma-separated per row; optional factor column.',
        source: 'Drawings, allocation output, editor component table.',
      },
    ],
    outputs: [
      {
        name: 'RSS / worst tolerance width',
        meaning: '$T_{\\mathrm{rss}}$, $T_{\\mathrm{worst}}$ and synthesized bands.',
        judgement: 'Narrow width ≠ pass—interval must lie inside min/max.',
      },
      {
        name: 'RSS / worst pass',
        meaning: 'Independent pass/fail per method.',
        judgement: 'RSS pass with worst fail is not enough for safety-critical release.',
      },
      {
        name: 'Method-risk hint',
        meaning: 'Ratio warnings, RSS✓worst✗ labels.',
        judgement: 'Critical hints need engineer review—not calculation errors.',
      },
      {
        name: 'Summary counts',
        meaning: 'Total, RSS pass, worst pass, fail, RSS pass/worst fail.',
        judgement: 'Non-zero “RSS pass/worst fail” deserves first review.',
      },
    ],
    reliability: [
      'RSS/worst formulas match the Tolerance Stack Editor and allocation verification.',
      'Model: zero nominal, all increasing, symmetric bands—may differ from real decreasing rings or biased tolerances.',
      'Default min=0 often makes RSS lower bound negative, causing counterintuitive all-fail batches.',
    ],
    beginnerTips: [
      'Validate one chain in the editor and understand min/max before batch paste.',
      'When you see “RSS pass / worst fail”, read the methodology block—don’t only tweak tolerances.',
      'If sample data all fails, check closed-loop min/max first.',
    ],
    professionalChecks: [
      'Safety-critical parts need worst-case pass as conservative baseline; RSS alone is insufficient.',
      'When worst/RSS ratio $\\ge 2$, consider Monte Carlo or measured Cpk.',
      'Confirm all values are mm before CSV export.',
    ],
    keywords: ['batch', 'verification', 'RSS', 'worst-case', 'quality'],
  },

  allocation: {
    title: 'Tolerance Allocation',
    summary:
      'Given a closed-loop RSS target tolerance $T_0$, allocate tolerance across component rings. Supports equal-contribution, equal-tolerance, proportional, minimum-cost, and sensitivity analytical methods, plus genetic algorithm and Pareto multi-objective optimization. Results can be sent to the Tolerance Stack Editor for verification.',
    steps: [
      'Under Allocation parameters, enter target RSS tolerance $T_0$ (mm) and choose a method; the core formula for that method is shown below.',
      'Under Component rings, enter name, transfer factor $f_i$, and nominal size $n_i$; minimum-cost / genetic / Pareto need cost coefficient $c_i$; sensitivity methods need $s_i$.',
      'Click Run allocation to view RSS verification, utilization, allocated tolerance $T_i$, and half-band $\\pm T_i/2$.',
      'Use Method comparison to compare RSS, utilization, min/max tolerance, and cost index; click a row to switch the active method.',
      'After selecting a scheme, use Apply to editor, then verify closed-loop min/max and ring directions before release.',
    ],
    principle:
      'Tolerance allocation is the inverse of stacking: forward stacking computes RSS from ring $T_i$; here $T_0$ is given and ring $T_i$ are solved. All RSS analytical methods enforce $T_{\\mathrm{stack}}=\\sqrt{\\sum (T_i f_i)^2}\\le T_0$. Proportional allocation follows worst-case sizing logic and does not guarantee full RSS budget use. Half-band $\\pm T_i/2$ is the symmetric manufacturing band—it is not summed in the RSS formula.',
    formulas: [
      {
        latex: 'T_{\\mathrm{stack}} = \\sqrt{\\sum_i (T_i f_i)^2}',
        note: 'RSS verification (same as Tolerance Stack Editor RSS method); $f_i$ = transfer factor',
      },
      {
        latex: 'T_{\\mathrm{stack}} \\le T_0 \\quad\\Rightarrow\\quad \\text{utilization} = \\frac{T_{\\mathrm{stack}}}{T_0}\\times 100\\%',
        note: 'Pass criterion: stacked RSS must not exceed target (allows $10^{-9}$ mm numerical tolerance)',
      },
      {
        latex: 'T_i = \\frac{T_0}{f_i \\sqrt{n}}',
        note: 'Equal RSS contribution: each $(T_i f_i)^2$ equal; $n$ = ring count. When all $f_i=1$, simplifies to $T_i=T_0/\\sqrt{n}$',
      },
      {
        latex: 'T_i = \\frac{T_0}{\\sqrt{n}}',
        note: 'Equal tolerance RSS: same $T_i$ per ring (ignores $f_i$ differences, then verifies RSS)',
      },
      {
        latex: 'T_i = T_0 \\cdot \\frac{n_i}{\\sum_j n_j}',
        note: 'Proportional: by nominal size ratio; worst-case reference—RSS utilization often below 100%',
      },
      {
        latex: 'T_i = \\frac{T_0 \\sqrt{c_i}}{f_i \\sqrt{\\sum_j c_j}}',
        note: 'Minimum-cost RSS: higher cost coefficient $c_i$ → smaller allocated tolerance',
      },
      {
        latex: 'T_i = \\frac{T_0 \\cdot s_i}{f_i \\sqrt{\\sum_j s_j^2}}',
        note: 'Sensitivity RSS: larger $s_i$ → larger allocation; iterative method updates $s_i$ over several rounds',
      },
      {
        latex: '\\text{cost index} = \\sum_i \\frac{c_i}{T_i}',
        note: 'Method comparison sort key: lower index usually means lower manufacturing cost',
      },
    ],
    notes: [
      'Round allocated values to achievable tolerance grades (e.g. IT bands), then re-verify RSS in the editor or batch tool.',
      'Equal-contribution / equal-tolerance / min-cost / sensitivity RSS methods target the $T_0$ budget; proportional allocation may show low utilization by design.',
      'When $f_i>1$, allocated tolerance should shrink for the same RSS share; tests confirm $f_A=1, f_B=2$ gives $T_A\\approx 2T_B$ under equal contribution.',
      'Genetic algorithm minimizes $\\sum c_i n_i/T_i$ subject to $T_{\\mathrm{stack}}\\le T_0$; Pareto returns non-dominated cost vs utilization trade-offs.',
      'Apply to editor loads example closed-loop min/max—you must replace them with drawing values before sign-off.',
    ],
    example:
      'Example: $T_0=0.10$ mm, three rings with $f_i=1$. Equal RSS contribution gives $T_i=0.10/\\sqrt{3}\\approx 0.0577$ mm, half-band $\\pm 0.0289$ mm; RSS check $=\\sqrt{3\\times 0.0577^2}=0.1000$ mm, 100% utilization. Proportional allocation (nominals 40/15/55.25 mm) yields RSS $\\approx 0.051$ mm, $\\approx 51%$ utilization—expected, not an error.',
    useCases: [
      'Closed-loop RSS budget is fixed and must be split onto component drawings.',
      'Compare equal-contribution, minimum-cost, and sensitivity strategies for manufacturability vs budget use.',
      'Support scheme selection via method comparison and Pareto front (quality/cost trade-off).',
    ],
    inputs: [
      {
        name: 'Target RSS tolerance $T_0$',
        meaning: 'Allowed total RSS bandwidth for the closed loop—the core budget.',
        source: 'Functional requirement, upstream stack result, or design specification.',
      },
      {
        name: 'Transfer factor $f_i$',
        meaning: 'Sensitivity of closed loop to ring $i$; enters RSS as $(T_i f_i)^2$.',
        source: 'Usually 1 for 1D chains; derive from geometry for levers/projections.',
      },
      {
        name: 'Nominal size $n_i$',
        meaning: 'Used in proportional allocation and in GA/Pareto cost $c_i n_i/T_i$.',
        source: 'Drawing nominal; proportional weight $n_i/\\sum n_j$.',
      },
      {
        name: 'Cost coefficient $c_i$',
        meaning: 'Manufacturing difficulty; higher $c_i$ tends to receive tighter allocation in min-cost RSS.',
        source: 'Process assessment or company cost model; default 1 = equal cost.',
      },
      {
        name: 'Sensitivity $s_i$',
        meaning: 'Weight in sensitivity RSS / iterative sensitivity methods.',
        source: 'Monte Carlo tornado, analytic partials, or engineering judgement; default 1.',
      },
    ],
    outputs: [
      {
        name: 'Allocated tolerance $T_i$',
        meaning: 'Suggested full tolerance width per ring (mm).',
        judgement: 'Round to standard grades then re-verify; larger $f_i$ should get smaller $T_i$ (equal contribution).',
      },
      {
        name: 'Half-band $\\pm T_i/2$',
        meaning: 'Symmetric band for ES/EI entry.',
        judgement: 'Manufacturing band only—not used in RSS sum; confirm direction and datum on drawings.',
      },
      {
        name: 'RSS verification',
        meaning: '$T_{\\mathrm{stack}}=\\sqrt{\\sum(T_i f_i)^2}$.',
        judgement: 'Must be $\\le T_0$; analytical RSS methods usually $\\approx T_0$; proportional often well below.',
      },
      {
        name: 'Utilization',
        meaning: '$T_{\\mathrm{stack}}/T_0\\times 100\\%$.',
        judgement: '100% = budget fully used; low values may be intentional (e.g. proportional method).',
      },
      {
        name: 'Method comparison / cost index',
        meaning: 'Cross-method RSS, min/max $T_i$, and $\\sum c_i/T_i$.',
        judgement: 'Lowest cost index is not automatically best—check utilization and manufacturability.',
      },
      {
        name: 'Pareto / GA cost',
        meaning: 'Alternative schemes from multi-objective or constrained search.',
        judgement: 'GA may be approximate; Pareto points require engineer selection—not auto sign-off.',
      },
    ],
    reliability: [
      'RSS stacking matches the Tolerance Stack Editor and batch verification: $T_{\\mathrm{stack}}=\\sqrt{\\sum(T_i f_i)^2}$.',
      'Analytical RSS allocators target $T_{\\mathrm{stack}}\\le T_0$; always read verification and utilization for proportional / GA / Pareto results.',
      'Allocation does not enforce worst-case budget $\\sum T_i$; safety-critical parts must check worst-case in the editor too.',
      'RSS assumes independent random errors—use Monte Carlo or measured Cpk when rings correlate or processes drift.',
    ],
    keywords: ['tolerance allocation', 'RSS', 'equal contribution', 'Pareto', 'genetic algorithm'],
  },

  fit: {
    title: 'ISO 286 Fit Lookup',
    summary:
      'Compute limit sizes, max/min clearance or interference, fit quality index, and optional assembly ΔT effects from hole/shaft codes (e.g. H7/g6, H7/n6). For preliminary sizing only—verify against GB/T 1800 / ISO 286-2 tables before release.',
    steps: [
      'Enter nominal size (1–500 mm) and hole/shaft codes, or click a cell in the hole-basis / shaft-basis tables on the tool page.',
      'Optionally enter assembly ΔT vs 20°C; equal default materials give zero thermal shift.',
      'Review limit sizes, clearances (μm), mean clearance, quality index Q, and fit type.',
      'Read check status and assumptions—“Review” means engineer verification, not automatic fail.',
      'For transition/interference fits and temperature service, cross-check every deviation against the standard handbook.',
    ],
    principle:
      'The tool follows ISO 286 structure: letter = zone position, number = IT grade. Hole $EI$ and shaft $es$ come from built-in fundamental-deviation tables by size segment; $IT$ width uses the continuous unit $i$ formula (not segment-rounded standard tables). Clearances are differences of limit sizes. Compared with GB/T 1800 / ISO 286-2, common clearance fits (H + g/f/h) are usually close; some positive-deviation shaft letters (n, k, p) may disagree with the standard at certain sizes—manual verification required.',
    formulas: [
      {
        latex: 'i = 0.45 \\cdot D^{1/3} + 0.001 \\cdot D \\quad (\\mu m)',
        note: 'Tolerance unit; $D$ = nominal (mm). Bandwidth $IT = k \\cdot i / 1000$ (mm), $k$ = IT5–IT11 factor (e.g. IT7→16, IT6→10)',
      },
      {
        latex: 'ES = EI + IT \\; (\\text{hole}), \\quad ei = es - IT \\; (\\text{shaft})',
        note: 'H hole $EI=0$; h shaft $es=0$; other letters from built-in tables by size segment',
      },
      {
        latex: 'D_{\\max} = D_{\\mathrm{nom}} + ES, \\quad D_{\\min} = D_{\\mathrm{nom}} + EI',
        note: 'Limit sizes (mm) shown as “hole H7 / shaft n6” ranges',
      },
      {
        latex: 'X_{\\max} = D_{\\mathrm{hole,max}} - D_{\\mathrm{shaft,min}} = ES - ei',
        note: 'Maximum clearance (mm)',
      },
      {
        latex: 'X_{\\min} = D_{\\mathrm{hole,min}} - D_{\\mathrm{shaft,max}} = EI - es',
        note: 'Minimum clearance (mm); negative = interference ($|X_{\\min}|$ = max interference)',
      },
      {
        latex: 'X_{\\min} \\ge 0 \\Rightarrow \\text{clearance}; \\; X_{\\max} \\le 0 \\Rightarrow \\text{interference}; \\; \\text{else transition}',
        note: 'Fit type classification',
      },
      {
        latex: 'Q = \\frac{X_{\\max} + X_{\\min}}{2\\,(X_{\\max} - X_{\\min})}',
        note: 'Fit quality index; 0.5 = centered in band—for comparison only',
      },
      {
        latex: '\\Delta X_{\\mathrm{th}} = \\alpha_h L \\Delta T - \\alpha_s L \\Delta T',
        note: 'Thermal clearance shift; default equal steel $\\alpha$ → 0; unlike materials not configurable on this page',
      },
    ],
    notes: [
      'Vs standard tables: $IT$ uses continuous $i$ at nominal $D$; standard uses segment values (e.g. Ø11 IT7 ≈16.2 μm here vs 18 μm in tables; Ø25 IT7 ≈21.5 vs 21 μm).',
      'Shaft n deviation: Small sizes match ISO 286-2 reasonably; at Ø25 H7/n6 tool may give shaft $es$ +8 μm vs standard +15 μm—clearances can differ by ~20 μm. Transition/interference fits must use the handbook.',
      'Check “Review”: Without thermal failure, status is estimateOnly (not a failed fit). Assumptions state results are for classification when functional targets are not entered.',
      'H7/g6: g deviations are reliable in common ranges; IT formula error typically ~10%.',
      'Diagram labels like (+8/-5) vs handbook (+28/+15) reflect deviation data difference—compare limit sizes and clearances to the standard.',
      'When comparing to external calculators or handbooks, clearance formulas $X_{\\max}=ES-ei$, $X_{\\min}=EI-es$ are the same; differences come from IT formula or shaft n/k/p deviation tables, not different fit math.',
      'Nominal >500 mm unsupported; IT grades 5–11 only; letter set is a common subset, not full ISO 286.',
      'Help page Appendix D3-3 lists typical uses of preferred fits; D4-1 maps IT grades to processes—verify shop capability after selecting a fit.',
    ],
    example:
      'Ex.1 — Ø11 H7/g6 (clearance, close to standard): Tool hole 11.000–11.0162 mm, shaft 10.9829–10.9930 mm, $X_{\\max}\\approx 33.3\\ \\mu m$, $X_{\\min}\\approx 7.0\\ \\mu m$, mean clearance $\\approx 20.2\\ \\mu m$, $Q\\approx 0.77$ (comparison only). Standard IT7=18 μm gives $X_{\\max}\\approx 36\\ \\mu m$—IT formula gap. Ex.2 — Ø25 H7/n6 (transition, large vs standard calculators): Standard hole +21/0, shaft +28/+15 μm → $X_{\\max}=+6\\ \\mu m$, $X_{\\min}=-28\\ \\mu m$. Tool shaft n fundamental deviation +8 μm (not +15 μm) → shaft ~+8/−5 μm, $X_{\\max}\\approx 26.9\\ \\mu m$, $X_{\\min}\\approx -8\\ \\mu m$—max interference underestimated by ~20 μm. Use GB/T 1800 for transition/interference fits.',
    useCases: [
      'Screen fit codes (H7/g6, H7/n6) for clearance/interference magnitude and fit type.',
      'Compare tolerance-zone combinations before locking part tolerances.',
      'Rough thermal direction check with optional ΔT (zero shift for same material is expected).',
    ],
    inputs: [
      {
        name: 'Nominal size $D$',
        meaning: 'Basic size (mm); sets segment and $i$; range 1–500 mm.',
        source: 'Drawing nominal; >500 mm rejected by tool.',
      },
      {
        name: 'Hole / shaft code',
        meaning: 'e.g. H7, n6—letter = fundamental deviation, number = IT grade.',
        source: 'Design selection or company standard; built-in letter set is a subset.',
      },
      {
        name: 'Assembly ΔT',
        meaning: 'Temperature change vs 20°C reference; $\\Delta X_{\\mathrm{th}}=\\alpha_h L\\Delta T-\\alpha_s L\\Delta T$.',
        source: 'Assembly/service conditions; default equal $\\alpha$ shows 0 μm.',
      },
    ],
    outputs: [
      {
        name: 'Limit sizes',
        meaning: 'Hole/shaft $D_{\\min}$–$D_{\\max}$ (mm).',
        judgement: 'Compare ES/EI, es/ei to handbook; n/k/p shafts may diverge at some sizes.',
      },
      {
        name: 'Max / min clearance',
        meaning: '$X_{\\max}$, $X_{\\min}$ (μm); negative = interference.',
        judgement: 'Functional clearance/interference is a separate design requirement.',
      },
      {
        name: 'Fit type',
        meaning: 'Clearance / transition / interference.',
        judgement: 'Trust type only when deviations match the standard; otherwise use handbook.',
      },
      {
        name: 'Fit quality $Q$',
        meaning: 'Complete/Professional; mean position in clearance band.',
        judgement: 'Comparison metric only—not a release criterion.',
      },
      {
        name: 'Check: Review / Pass',
        meaning: '“Review” = estimateOnly—engineer must verify, not a calculation error.',
        judgement: 'Formal release requires GB/T 1800 and functional checks.',
      },
      {
        name: 'Thermal clearance shift',
        meaning: 'Professional mode; 0 for equal default materials.',
        judgement: 'Dissimilar materials not configurable on this page.',
      },
    ],
    reliability: [
      'Clearance formulas match ISO conventions; deviation data = simplified tables + continuous $i$, not a full GB/T 1800 reproduction.',
      'H hole + g/f/h clearance fits: usually reliable in common segments; IT ~±10% formula tolerance.',
      'n, k, p shafts: known mismatch with ISO 286-2 at some sizes (e.g. Ø25 n6)—handbook mandatory for transition/interference.',
      '“Review” is product disclaimer (estimateOnly), not a failed H7/g6 fit.',
      'Professional hint mentions Monte Carlo but this page has no MC; equal default $\\alpha$ → 0 thermal shift at any ΔT is expected.',
    ],
    beginnerTips: [
      'Start with H7/g6 presets; when switching to n6 or p6, compare immediately to the handbook.',
      '“Review” means read assumptions—not automatic unqualified fit.',
      'Clearances are μm; limit sizes are mm—watch units.',
    ],
    professionalChecks: [
      'Verify hole ES/EI and shaft es/ei and IT width against GB/T 1800 / ISO 286-2, especially n/k/p and IT rounding.',
      'For transition fits, check max interference $|X_{\\min}|$ against press force, stress, and torque transfer.',
      'Thermal service: dissimilar materials need separate $\\Delta X_{\\mathrm{th}}$; equal material means unchanged relative clearance.',
      'Recompute after rounding to IT bands; form error, ovality, taper not in this model.',
    ],
    keywords: ['fit', 'H7', 'g6', 'n6', 'ISO286', 'clearance', 'interference', 'transition'],
  },

  'gdt-stack': {
    title: 'GD&T Tolerance Stack',
    summary:
      'Stack position, flatness, coaxiality, and other geometric tolerances with RSS/worst-case methods; supports MMC/LMC bonus, datum accumulation, and contribution breakdown. For early geometric budget and design comparison—formal release requires ASME Y14.5 and measured state review.',
    useCases: [
      'Hole pattern position, multi-face flatness, bearing coaxiality accumulate in assembly—estimate whether combined effect stays within drawing allowance.',
      'Compare how locating tolerances, datum face accuracy, or MMC bonus affect assemblability during concept design.',
      'Identify which component rings contribute most to tighten key processes or revise datum order.',
      'For critical fits or must-pass single parts, use Professional mode worst-case margin in addition to RSS.',
    ],
    steps: [
      'Choose mode: Simplified (stack only) / Full (+contributions+datums) / Professional (+worst margin). Do not release on Simplified alone when datums are entered.',
      'Select GD&T type (position, flatness, coaxiality, etc.) and stack method (RSS / worst / modified RSS).',
      'Enter closed max $T_{closed}$ (budget band lower bound is 0); add ring tolerances and factor; position requires X/Y direction.',
      'Mark size features (hole/shaft) with featureKind and sizeTolerance for MMC/LMC auto bonus; non-size features excluded.',
      'Optionally add datums with flatness/perpendicularity; Full/Professional computes combined with-datum value.',
      'Review stacked tolerance, contributions, with-datum total, worst margin (Professional), and pass status.',
      'Import rings from the size-chain editor; export PDF report for records.',
    ],
    principle:
      'Geometric tolerances accumulate along assembly and inspection chains. Unlike 1D stacks, most GD&T stacks use budget band $[0, T_{closed}]$ (nominal ≈ 0), not symmetric $\\pm$ half-tolerance bands. Position is 2D: X/Y deviations RSS per axis, then $T_{pos}=2\\sqrt{(T_x/2)^2+(T_y/2)^2}$. Datum scheme adds accumulation via weighted RSS (primary 1.0, secondary 0.7, tertiary 0.5). Under MMC, departure from maximum material grants bonus tolerance; auto mode uses full FOS size tolerance—conservative/teaching. RSS pass does not imply worst-case safety—Professional mode adds worst-case margin.',
    formulas: [
      {
        latex: 'T_{pos} = 2\\sqrt{\\left(\\frac{T_x}{2}\\right)^2 + \\left(\\frac{T_y}{2}\\right)^2}',
        note: 'Position RSS; $T_x$, $T_y$ = per-axis RSS of rings (with factor)',
      },
      {
        latex: 'T_{pos}^{worst} = T_x + T_y',
        note: 'Position worst-case: sum within axis, then between axes',
      },
      {
        latex: 'T_{rad} = \\sqrt{\\sum (f_i T_i)^2}',
        note: 'Coaxiality/runout/roundness radial RSS',
      },
      {
        latex: 'T_{datum} = \\sqrt{\\sum (w_i T_i)^2}',
        note: 'Datum accumulation; $w_i$ = primary 1.0 / secondary 0.7 / tertiary 0.5',
      },
      {
        latex: 'T_{combined} = \\sqrt{T_{stack}^2 + T_{datum}^2}',
        note: 'Full/Professional: stack and datum RSS combined',
      },
      {
        latex: 'T_{eff} = T_{stack} - bonus',
        note: 'MMC/LMC reduces effective stack; MMC full bonus, LMC half (simplified)',
      },
      {
        latex: 'M_{worst} = T_{closed} - T_{stack}^{worst}',
        note: 'Professional worst margin; require $M_{worst}\\ge 0$',
      },
    ],
    notes: [
      'Closed zone is $[0, T_{closed}]$ budget band; symmetric size-chain min/max changes pass semantics to band mode.',
      'Simplified mode with datums entered ignores datum accumulation—marked estimate-only; use Full or Professional.',
      'Contributions: 2D position RSS splits 50% variance per axis; 1D/radial by $T_i^2/\\sum T_j^2$.',
      'factor = sensitivity; hole size on X often uses 0.5—not item-by-item standard bonus.',
      'Non-size features excluded from MMC/LMC bonus; auto bonus uses full size tolerance—use measured MMC departure for precision.',
      'Modified RSS needs distribution parameters; sigma6-rss available on some stack types.',
      'Early budget tool—not CMM/GD&T simulation; pattern position, simultaneous, DRF shift need dedicated review or software.',
    ],
    example:
      'Hole pattern preset (Professional · RSS · RFS): X loc 0.0500, Y 0.0400, hole 0.0200×0.5 (X); max 0.1500; datum A 0.0200 (primary), B 0.0300 (secondary). Stack $T_{pos}\\approx 0.0648$ mm; contributions Y 50.0%, X 48.1%, hole 1.9%; with datums $\\approx 0.0710$ mm; worst $T_{pos}^{worst}=0.10$ mm, margin 0.05 mm—all pass. Optimize Y loc > X loc >> hole; datum tolerance growth exhausts margin before main stack.',
    standards: ['ASME Y14.5', 'ISO 1101 (conceptual reference)'],
    inputs: [
      {
        name: 'Calculation mode',
        meaning: 'Simplified: main stack only; Full: +contributions+datums; Professional: +worst margin. Do not release on Simplified with datums.',
        source: 'By design phase and risk; critical parts use Professional.',
      },
      {
        name: 'Geometric tolerance type',
        meaning: 'Stack model: 2d-position / form-direct / radial / form-linear / 1d-weighted.',
        source: 'Drawing GD&T frames and functional requirements.',
      },
      {
        name: 'Closed max',
        meaning: 'Maximum allowable combined geometric tolerance $T_{closed}$; lower bound fixed at 0 (budget).',
        source: 'Position frame value, functional analysis, or allocation result.',
      },
      {
        name: 'Rings and factor',
        meaning: 'Error source tolerances, direction (X/Y for position), sensitivity factor.',
        source: 'Process capability, gage repeatability, locating dimensions, bearing clearance, etc.',
      },
      {
        name: 'Datums (optional)',
        meaning: 'Datum face flatness/perpendicularity and priority (primary/secondary/tertiary).',
        source: 'Drawing datum scheme A|B|C and associated geometric tolerances.',
      },
      {
        name: 'Material condition and FOS',
        meaning: 'RFS / MMC / LMC; hole/shaft needs sizeTolerance for auto bonus.',
        source: 'M/L/S modifier and hole/shaft size tolerance band.',
      },
    ],
    outputs: [
      {
        name: 'Stacked tolerance',
        meaning: 'Main stack RSS/worst result $T_{stack}$.',
        judgement: 'Must be $\\le T_{closed}$; position is diameter-zone magnitude.',
      },
      {
        name: 'Contributions',
        meaning: 'Percent of combined variance (or worst share); longer bar = more sensitive.',
        judgement: 'Tighten top-ranked rings first; 2D position often Y/X dominated.',
      },
      {
        name: 'With-datum total',
        meaning: '$\\sqrt{T_{stack}^2+T_{datum}^2}$—total budget including datum faces.',
        judgement: 'Full/Professional must pass; datum margin often exhausts before main stack.',
      },
      {
        name: 'Worst-case margin',
        meaning: 'Professional: $T_{closed}-T_{stack}^{worst}$.',
        judgement: 'Must be $\\ge 0$; fail even if RSS passes when margin negative.',
      },
      {
        name: 'Bonus / effective tolerance',
        meaning: 'MMC/LMC bonus deducted from stack and resulting $T_{eff}$.',
        judgement: 'Auto bonus is conservative; formal judgement uses measured size vs MMC.',
      },
    ],
    reliability: [
      'Formulas and stack models are documented on page and in this help—explicit engineering approximations, not AI guesses.',
      'Datum accumulation, auto MMC bonus, and hole factor are simplified vs full ASME Y14.5 simulation.',
      'RSS assumes independent, identically distributed errors; correlated sources may under- or over-estimate risk.',
      'Imported ring directions and typeId from editor must be manually verified against drawing GD&T.',
    ],
    professionalChecks: [
      'Critical or must-pass parts: check Professional worst margin, not RSS stack alone.',
      'With datums entered: confirm with-datum pass in Full/Professional; Simplified result cannot release.',
      'With MMC: verify bonus from measured hole/shaft size, not auto full allowance alone.',
      'Pattern position: tool does not handle pattern/simultaneous—analyze per standard or dedicated software.',
      'After optimization, reconcile with size-chain editor or batch verification for 1D budget consistency.',
    ],
    keywords: ['GD&T', 'position', 'flatness', 'coaxiality', 'MMC', 'datum', 'RSS', 'contribution'],
  },

  units: {
    title: 'Unit Conversion',
    summary: 'Convert common mechanics, length, and area units to avoid mixing MPa with psi or mm with in.',
    steps: [
      'Select quantity type (length, area, stress, force, etc.).',
      'Enter value and source unit; choose target unit.',
      'Copy result into other calculation tools.',
    ],
    principle: 'Conversion factors between unit systems are constants (e.g. 1 in = 25.4 mm, 1 ksi ≈ 6.895 MPa, 1 MPa = 1 N/mm²).',
    notes: [
      'Unit mix-ups are a leading cause of engineering errors—sanity-check magnitude after conversion.',
      'Stress units include MPa, N/mm², ksi; area includes mm²/m², hectare, Chinese mu/fen/qing, and ft²/yd²/acre/mi².',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['units', 'MPa', 'N/mm²', 'psi', 'area', 'mu'],
  },

  'interference-fit': {
    title: 'Interference Fit',
    summary:
      'Estimate contact pressure, hoop stress, press force, and transmissible torque from interference using Lame thick-cylinder theory (DIN 7190 approach). Full/Professional modes add hoop checks and critical-input confirmation; Professional adds thermal interference correction.',
    useCases: [
      'Press/shrink fit of shaft in hub: judge if interference transmits design torque and if press force fits equipment.',
      'Compare with ISO 286 /fit interference limits before elastic pressure/stress estimate.',
      'Hollow shaft or thin hub: compare solid vs hollow compliance effect on pressure.',
      'Service temperature or dissimilar materials: estimate whether effective interference shrinks or becomes clearance (Professional).',
    ],
    steps: [
      'Choose mode: Simplified (magnitude only, pass always false) / Full (hollow shaft + hoop + confirm gate) / Professional (+ thermal).',
      'Enter shaft d, bore D (interference i=d−D shown), hub OD D_A, fit length L, friction μ.',
      'Full/Professional: shaft bore d_i (0=solid), E/ν, hoop allowables; use Recommend ~1.8d for D_A.',
      'Professional: ΔT and α for shaft/hub (physical α, steel ~11.5×10⁻⁶/°C—unlike the ×10⁻⁶ entry on the thermal-expansion page); α=0 disables thermal correction.',
      'Full/Professional: edit and confirm each critical field. Pending fields show amber border and *; results stay visible while overall status is review (releaseBlocked)—see help gate table.',
      'Review p, hoopPass, press force F, torque T vs design torque and press capacity.',
      'If i is mm-scale on cm-scale diameters, verify bore D before trusting stress results.',
    ],
    principle:
      'Interference creates radial overlap Δr=i/2; Lame thick-cylinder theory gives contact pressure p from hub compliance C_h and shaft compliance C_s (solid or hollow). Friction torque T=πpd²Lμ/2, press force F=πpdL(μ+0.02). Full/Professional compare hoop stress to allowables (hoopPass). Full/Professional also require critical-input confirmation before pass—prefilled defaults are not auto-confirmed; numeric results remain visible while blocked. Professional adjusts i\'=i+α_s dΔT−α_h DΔT.',
    formulas: [
      { latex: 'i = d - D', note: 'Interference (mm); require i>0' },
      { latex: 'p = \\frac{i/2}{r_i(C_h+C_s)}', note: 'r_i=D/2; C_h,C_s from E, ν, radii' },
      {
        latex: 'C_h = \\frac{1}{E_h}\\left(\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}+\\nu_h\\right)',
        note: 'Hub compliance; r_o=D_A/2',
      },
      { latex: 'C_s = \\frac{1-\\nu_s}{E_s}', note: 'Solid shaft; hollow in help tables' },
      {
        latex: '\\sigma_{t,h} = p\\frac{r_o^2+r_i^2}{r_o^2-r_i^2},\\quad \\sigma_{t,s} \\approx p',
        note: 'Hoop check (Full/Professional)',
      },
      { latex: 'F = \\pi p d L(\\mu+0.02)', note: 'Press force (N)' },
      { latex: 'T = \\frac{\\pi p d^2 L \\mu}{2}', note: 'Torque (N·mm); UI in N·m' },
      {
        latex: "i' = i + \\alpha_s d\\Delta T - \\alpha_h D\\Delta T",
        note: 'Professional thermal interference',
      },
    ],
    notes: [
      'Typical ISO interference is **μm to tens of μm**; mm-scale i often means wrong bore (e.g. 45.98 vs 49.98).',
      'Simplified mode **pass always false** (estimateOnly)—even if hoopPass passes.',
      'Full/Professional: **releaseBlocked** until critical fields confirmed—results stay visible with amber border + * on pending fields; intentional design.',
      'Switching calc mode **clears** confirmations.',
      'Thin wall: (D_A−D)/2 < 0.1d → thinWallWarning; small D_A overestimates p.',
      'Professional UI mentions roughness—not implemented; thermal correction only.',
      'Use with /fit and /thermal-expansion for tolerance band and α.',
    ],
    example:
      'Example — Ø50 press fit (d=50, D=49.975, i=0.025 mm): p≈39 MPa, hoop ~66/39 MPa (<350 MPa allow.), F≈3.4×10⁵ N, T≈180 N·m (L=40, μ=0.12). Full mode needs confirmed critical inputs to clear releaseBlocked (values already visible). Counterexample — D=45.98 → i=4 mm: GPa-scale p, hoopPass fails—likely typo.',
    standards: ['DIN 7190 (reference)', 'ISO 286 (interference from /fit)'],
    inputs: [
      {
        name: 'Shaft d / bore D',
        meaning: 'Interface dimensions; interference i=d−D must be positive.',
        source: 'Drawing; use /fit for H7/p6 etc. limits (μm).',
      },
      {
        name: 'Hub OD D_A',
        meaning: 'Hub compliance and hoop amplification; too small → thin-wall warning.',
        source: 'Structure; recommend ~1.8d.',
      },
      {
        name: 'Fit length L, friction μ',
        meaning: 'Directly scale F and T.',
        source: 'Hub geometry; μ from DIN 7190 or shop practice (~0.1–0.2 press).',
      },
      {
        name: 'E, ν, bore d_i',
        meaning: 'Elastic constants; d_i>0 hollow shaft lowers p (Full/Professional).',
        source: 'Handbook; steel E≈210 GPa, ν≈0.3.',
      },
      {
        name: 'Hoop allowables',
        meaning: 'Full/Professional hoopPass; default 350 MPa—adjust per material.',
        source: 'Yield, heat treat, company standards.',
      },
      {
        name: 'ΔT, α (Professional)',
        meaning: 'Thermal correction to i\'; different α changes fit tightness.',
        source: '/thermal-expansion; steel α≈11.5×10⁻⁶/°C.',
      },
    ],
    outputs: [
      {
        name: 'Contact pressure p',
        meaning: 'Interface radial pressure (MPa)—main Lame result.',
        judgement: 'Too high → plasticity/press difficulty; too low → insufficient torque.',
      },
      {
        name: 'Hoop stress / hoopPass',
        meaning: 'Hub σ_t,h / shaft σ_t,s; ✓/✗ in Full/Professional.',
        judgement: 'Either over allowable → hoopPass=false, pass fails.',
      },
      {
        name: 'Press force F',
        meaning: 'Axial press-in force (N).',
        judgement: 'Compare with press, guide, lubrication capability.',
      },
      {
        name: 'Torque capacity T',
        meaning: 'Friction transmissible torque (N·m).',
        judgement: 'Must meet design torque with safety margin.',
      },
      {
        name: 'releaseBlocked',
        meaning: 'Process gate when critical inputs unconfirmed (Full/Professional): overall status = review; numeric results still shown.',
        judgement: 'Not a math error—amber border + * mark pending fields; edit to clear. Simplified has no gate but pass always false.',
      },
    ],
    reliability: [
      'Lame plane-stress elastic solution—no plasticity, fretting, fatigue, or 3D effects.',
      'Constant μ; roughness/lubrication not split out (roughness in UI not implemented).',
      'Critical-input gate prevents release on unreviewed defaults; mode switch clears confirmations.',
    ],
    professionalChecks: [
      'Cross-check i with /fit: μm normal, mm suspect wrong bore.',
      'Full/Professional: confirm all critical fields before pass; or use Simplified to preview magnitudes.',
      'Thermal: do not leave α=0 in Professional (physical α on this page); use material values for dissimilar pairs.',
      'On thin-wall warning, increase D_A or verify thick-cylinder applicability.',
      'After F/T comparison, still follow company process or full DIN 7190 for release.',
    ],
    keywords: ['interference', 'press fit', 'Lame', 'contact pressure', 'torque', 'releaseBlocked'],
  },

  'thermal-expansion': {
    title: 'Thermal Expansion',
    summary: 'Estimate dimensional change from temperature and its effect on clearance/interference fits.',
    steps: [
      'Choose mode: Simplified (linear ΔL) / Full (dual-material fit change) / Professional (assembly vs service ΔT steps).',
      'Enter length and ΔT; enter α as a **×10⁻⁶ value** (steel ≈ 11.5 meaning 11.5×10⁻⁶/°C).',
      'Full/Professional: shaft/bore diameters and second-material α; Professional adds assembly/service ΔT. Pending critical fields show amber border and *.',
      'Review ΔL; for fits, check interference change and whether clearance appears.',
    ],
    principle: 'Most metals expand when heated: ΔL = α L ΔT (α in formulas is the physical value). Different hole/shaft materials change fit tightness with temperature.',
    formulas: [
      { latex: '\\Delta L = \\alpha L \\Delta T', note: 'Linear expansion; UI α is entered as ×10⁻⁶ then scaled' },
    ],
    notes: [
      'UI α is the ×10⁻⁶ magnitude (e.g. 11.5), not 11.5×10⁻⁶ typed as a tiny decimal; steel physical α ≈ 1.2×10⁻⁵/°C.',
      'Interference-fit Professional α uses physical values (e.g. 11.5×10⁻⁶)—different from this page.',
      'Full/Professional critical-input gate: unconfirmed → review status with values still shown; Simple mode has no gate.',
      'High-temperature equipment must include hot-state clearance in tolerance stacks.',
    ],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['thermal expansion', 'temperature', 'alpha', '×10⁻⁶'],
  },

  fatigue: {
    title: 'Fatigue Life',
    summary:
      'Basquin S-N and Miner damage D. Full/Professional add spectrum; Professional adds Goodman/Soderberg, ka·kb, and Se′. With spectrum, overall pass = D<1 only; right-panel single-level is reference. See help page tutorials.',
    useCases: [
      'Estimate cycles or check Miner D<1 from stress amplitude or load spectrum.',
      'Compare multi-level duty cycles (start/steady/brake) with Miner spectrum.',
      'Significant mean tensile stress: Professional Goodman/Soderberg on each Miner block.',
      'Distinct from shaft/beam/key assessComponentFatigue—this page has Miner, those do not.',
    ],
    steps: [
      'Choose mode: Simplified (pass always false) / Full (+Miner) / Professional (+Goodman+ka,kb).',
      'Select material; enter Sa (min σ−1) and N_target for single-level reference.',
      'Full/Professional: spectrum lines «Sa(MPa), cycles».',
      'Professional: Sm, ka, kb; Miner blocks use Sa,eff vs Se′.',
      'With spectrum, **overall pass = Miner D<1 only**; single-level panel does not drive overall pass.',
      'Review Miner n/Nf, share of D, D, S-N chart (chart uses input Sa).',
    ],
    principle:
      'Basquin + Miner. Professional: Goodman/Soderberg and Se′=ka·kb·σ−1. Overall pass with spectrum = D<1. Single-level check (N≥N_target and Sa,eff≤Se′) is reference only. Full Miner uses raw Sa + σ−1; Professional uses Sa,eff,i + Se′—D can differ greatly for the same spectrum.',
    formulas: [
      { latex: 'S(N) = S_f\' \\cdot N^b \\quad (N < N_{ref})', note: 'Then S=σ−1' },
      { latex: 'N = \\left(\\frac{S_a}{S_f\'}\\right)^{1/b}', note: 'Sa≤σ−1 → N=∞' },
      { latex: 'D = \\sum_i \\frac{n_i}{N_{f,i}}', note: 'Miner; overall pass requires D<1' },
      { latex: 'S_{a,eff} = \\frac{S_a}{1 - S_m / \\sigma_u}', note: 'Professional Goodman' },
      { latex: "\\sigma'_{-1} = k_a k_b \\sigma_{-1}", note: 'Se′ adjusted endurance' },
    ],
    notes: [
      'Five built-in curves are approximations—not your part S-N data.',
      'Full Miner: raw Sa; Professional: Goodman + Se′ per block—same inputs can flip pass.',
      'Overall pass with spectrum is Miner-only; single-level ✓/✗ may disagree (see help FAQ).',
      'Simplified pass always false; min Sa=σ−1 but Professional single-level checks Se′—often impossible at min Sa when ka·kb<1.',
      'Professional Miner assumes constant Sm across blocks.',
      'No Kt—use shaft/key assessComponentFatigue for concentration.',
    ],
    example:
      '45 steel same spectrum: Full D≈0.27 pass, Professional (Sm=100, ka·kb=0.765) D≈2.67 fail—expected. Single-level: Sa=280 (UI min) with Se′=70 may fail goodmanPass despite adequate life.',
    standards: ['Basquin S-N', 'Miner (reference)', 'GB/T 3077 (material reference)'],
    inputs: [
      { name: 'Material', meaning: 'Five built-in Basquin sets (sf, b, σ−1, Nref).', source: 'Approximate match; use test S-N for release.' },
      { name: 'Stress amplitude Sa', meaning: 'Alternating stress (MPa); min σ−1, max N=10² endpoint.', source: 'FEA, nominal×Kt, or measured loads.' },
      { name: 'Miner spectrum', meaning: 'Full/Pro: lines Sa,n; overall pass=D<1 when spectrum present.', source: 'Duty stats; Pro applies Goodman per block vs Se′.' },
      { name: 'Sm, ka, kb, N_target (Pro)', meaning: 'Goodman/Soderberg; Se′=ka·kb·σ−1; N_target drives single-level panel.', source: 'Mean stress; handbook factors; design life.' },
    ],
    outputs: [
      { name: 'Life N', meaning: 'Single-level Basquin; knee at σ−1 (Full) or Se′ (Pro).', judgement: 'Does not drive overall pass when Miner present.' },
      { name: 'Miner damage D', meaning: 'Σ ni/Nf,i; D<1 pass, 0.8≤D<1 warn.', judgement: 'Primary overall pass when spectrum loaded.' },
      { name: 'Single-level / goodmanPass', meaning: 'Right panel: N≥N_target and (Pro) Sa,eff≤Se′.', judgement: 'Does not drive overall pass with spectrum.' },
      { name: 'Share of D', meaning: 'Each row n/Nf as fraction of total D.', judgement: 'Find dominant damage levels.' },
    ],
    reliability: [
      'Classic Basquin+Miner—no Kt, sequence; Pro Miner assumes constant Sm.',
      'Full vs Pro Miner chains differ—D can differ by orders of magnitude.',
      'Do not mix assessComponentFatigue pass with this page Miner pass.',
      'Min Sa=σ−1 vs Se′ single-level criterion mismatch when ka·kb<1.',
    ],
    professionalChecks: [
      'With Miner spectrum, judge overall pass by D—not left life or single-level alone.',
      'Full pass + Professional fail: check Sm and ka·kb—expected, not a bug.',
      'D between 0.8 and 1 may still pass—treat as warning.',
      'Single-level fail + D<1: OK if spectrum governs; align left Sa with spectrum duty.',
    ],
    keywords: ['fatigue', 'Miner', 'S-N', 'Goodman', 'Basquin', 'single-level'],
  },

  gear: {
    title: 'Gear Strength',
    summary: 'Mode selects the path: Simplified Lewis, Full ISO 6336, Professional ISO+AGMA side-by-side.',
    steps: [
      'Choose mode: Simplified = Lewis estimate; Full = ISO 6336; Professional = ISO and AGMA in parallel (no separate standard tabs).',
      'Enter module, tooth count, face width, power/torque, speed, and material allowables; Full/Professional can adjust load factors and accuracy grade.',
      'Review contact/bending stresses and safety factors; Professional requires all four ISO/AGMA sub-checks (bothPass) for overall pass.',
    ],
    principle:
      'Common gear failures are pitting (contact fatigue) and tooth breakage (bending fatigue). Check flank and root separately; include load factors, dynamic load, and accuracy. Mode is the standard path—there is no separate ISO/AGMA tab switch.',
    formulas: [
      { latex: '\\sigma_H \\le \\sigma_{HP}', note: 'Contact stress within allowable' },
      { latex: '\\sigma_F \\le \\sigma_{FP}', note: 'Root bending stress within allowable' },
    ],
    notes: [
      'Lewis Simplified is for magnitude only; use Full ISO or Professional dual-standard for design.',
      'Professional AGMA vs ISO stresses can differ 10–30% for the same inputs; bothPass requires both suites.',
      'Accuracy grade and mounting errors strongly affect dynamic load; poor lubrication cuts contact life.',
    ],
    standards: ['ISO 6336', 'ISO 1328', 'AGMA 2101', 'GB/T 3480'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['gear', 'contact', 'bending', 'Lewis', 'ISO6336', 'AGMA'],
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
      'Calculate equivalent dynamic load and L₁₀ life per ISO 281; supports X/Y lookup, reliability factor, preload, and duplex mounting.',
    steps: [
      'Choose mode: simplified (manual X/Y) or full (auto lookup by series).',
      'Enter C, C₀, Fr, Fa, speed, and target life.',
      'Full mode: optional bearing series/model, aISO life adjustment, reliability.',
      'Optional mounting (single / DB / DF / DT) and axial preload F₀.',
      'Review equivalent load P, life in hours, and static safety factor.',
    ],
    principle:
      'Rolling bearing life follows a power law with load. Equivalent dynamic load combines radial and axial load into one value comparable to rated dynamic load C. L₁₀ is basic rating life at 90% reliability.',
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
        name: 'C / C₀',
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
        name: 'L₁₀ / L₁₀h',
        meaning: 'Basic rating life at 90% reliability—in million rev or hours.',
        judgement: 'Pass when L₁₀h ≥ target life; higher reliability requirements reduce adjusted life.',
      },
      {
        name: 'S₀ static safety',
        meaning: 'Ratio of C₀ to static equivalent load.',
        judgement: 'Do not rely on life alone for shock or slow heavy load—check S₀.',
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
      'L₁₀ is statistical—not every bearing will reach that hour count.',
    ],
    keywords: ['bearing', 'L₁₀', 'L10', 'ISO281'],
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

  'worm-gear': {
    title: 'Worm Gear',
    summary: 'Textbook-level ratio, sliding efficiency, and output torque with Simple/Full/Pro modes—not ISO 14521.',
    steps: [
      'Enter module, starts, teeth, diameter factor q, friction, and load.',
      'Review i, γ, η, T₂; in Full/Pro compare rough strength flags.',
    ],
    principle: 'Crossed-axis sliding mesh; efficiency is dominated by lead angle and friction.',
    formulas: [
      { latex: 'i = z_2/z_1', note: 'Ratio' },
      { latex: '\\tan\\gamma = z_1/q', note: 'Lead angle' },
      { latex: '\\eta = \\dfrac{\\tan\\gamma}{\\tan(\\gamma+\\rho)}', note: 'Worm driving' },
      { latex: 'T_2 = T_1 i \\eta', note: 'Output torque' },
    ],
    notes: ['γ≤ρ may self-lock (advisory). Bronze wheels: see tin bronze in materials.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['worm', 'worm gear', 'efficiency'],
  },

  'bevel-gear': {
    title: 'Bevel Gear',
    summary: 'Σ=90° straight bevel pitch angles, force split, and rough strength — not ISO 10300.',
    steps: [
      'Enter module, teeth, and torque/speed.',
      'Review δ, R, Ft/Fr/Fa; Full/Pro check bending and contact.',
    ],
    principle: 'Orthogonal bevel gears; forces at mean pitch diameter; strength via virtual spur approximation.',
    formulas: [
      { latex: '\\tan\\delta_1=z_1/z_2', note: 'Pinion pitch angle' },
      { latex: 'R=\\dfrac{m}{2}\\sqrt{z_1^2+z_2^2}', note: 'Outer cone distance' },
      { latex: 'F_r=F_t\\tan\\alpha\\cos\\delta,\\ F_a=F_t\\tan\\alpha\\sin\\delta', note: 'Force split' },
    ],
    notes: ['Shaft angle 90° only; use ISO 10300 / vendor software for release.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['bevel', 'bevel gear'],
  },

  'pipe-flow': {
    title: 'Pipe Pressure Drop',
    summary: 'Darcy-Weisbach friction loss, local losses, and velocity/Δp limit checks.',
    steps: [
      'Pick a fluid preset and enter diameter, length, flow rate, and roughness.',
      'Full mode adds local loss K and Hazen-Williams friction compare.',
      'Professional mode checks max velocity and allowable Δp.',
    ],
    principle: 'ΔP = f(L/D)(ρv²/2); turbulent f via Swamee-Jain approximation of Colebrook.',
    formulas: [
      { latex: '\\Delta P = f \\cdot \\frac{L}{D} \\cdot \\frac{\\rho v^2}{2}', note: 'Darcy-Weisbach' },
    ],
    notes: ['Single straight-run estimate; no full fitting library or detailed compressible model.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['pressure drop', 'pipe', 'Darcy'],
  },
  'plate-buckling': {
    title: 'Plate Buckling',
    summary: 'Elastic critical stress, imperfection reduction, and safety-factor screening for plates.',
    steps: [
      'Choose edge condition and enter thickness, width, length, and applied stress.',
      'Full mode includes transverse stress and imperfection factor.',
      'Professional mode can check in-plane shear and post-buckling capacity.',
    ],
    principle: 'σ_cr = k π²E / [12(1−ν²)] (t/b)² with tabulated edge k.',
    formulas: [
      { latex: '\\sigma_{cr} = k \\cdot \\frac{\\pi^2 E}{12(1-\\nu^2)}\\left(\\frac{t}{b}\\right)^2', note: 'Elastic plate buckling' },
    ],
    notes: ['Default SF≥2; length a does not refine half-wave count.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['buckling', 'plate'],
  },
  'column-buckling': {
    title: 'Column Buckling',
    summary: 'Euler critical load, slenderness, and Rankine correction for intermediate columns.',
    steps: [
      'Choose end restraints and section; enter length and axial force.',
      'Full mode uses yield strength and Rankine when λ is below the limit.',
      'Professional mode can include eccentric amplification.',
    ],
    principle: 'P_e = π²EI/(μL)²; λ=μL/i; Rankine for intermediate columns.',
    formulas: [
      { latex: 'P_e = \\frac{\\pi^2 E I}{(\\mu L)^2}', note: 'Euler critical load' },
      { latex: '\\lambda = \\mu L / i', note: 'Slenderness' },
    ],
    notes: ['Simple mode is Euler estimate only; verify end restraints and imperfections for release.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['column', 'buckling', 'Euler'],
  },
  'pin-retainer': {
    title: 'Pin / Retaining Ring',
    summary: 'Pin shear/bearing and shaft circlip axial capacity (simplified).',
    steps: [
      'Select pin or ring tab and enter load/geometry.',
      'Full mode adjusts allowables and safety factor.',
      'Pro: pin-hole Kt; ring speed derating.',
    ],
    principle: 'Pin: τ=4F/(nπd²), σ_b=F/(d t); ring: simplified hoop shear and groove bearing.',
    formulas: [
      { latex: '\\tau = \\frac{4F}{n\\pi d^2}', note: 'Pin shear' },
      { latex: '\\tau \\approx F/(\\pi d s)', note: 'Ring shear (simplified)' },
    ],
    notes: ['Ring formulas are engineering simplifications—use manufacturer catalogs for release.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['pin', 'circlip', 'retaining ring'],
  },
  'modal-freq': {
    title: 'Natural Frequency',
    summary: 'SDOF / first-mode beam frequency, resonance margin, and transmissibility.',
    steps: [
      'Choose model (SDOF / simply supported / cantilever) and enter parameters.',
      'Enter excitation frequency or rpm to review resonance margin.',
      'Professional mode uses damping ratio for H(r).',
    ],
    principle: 'Beam fn from EI, ρA, span, and supports; margin M=|f_n−f_exc|/f_n.',
    formulas: [
      { latex: 'f_n = \\frac{\\pi}{2L^2}\\sqrt{\\frac{EI}{\\rho A}}', note: 'Simply supported first mode' },
    ],
    notes: ['First-mode pre-check only—not a substitute for full modal analysis.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['natural frequency', 'modal', 'resonance'],
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
    summary: 'Machining allowance, casting draft, cutting params, Ra–fit lookup, and injection DFM.',
    steps: [
      'Pick process type (allowance / draft / cutting / roughness / injection).',
      'Enter size, material, and process inputs.',
      'Review allowances, power, lookup tables, or DFM checklist.',
    ],
    principle: 'Stock needs machining allowance; castings need draft; cutting force≈kc·ap·f; injection geometry follows wall/draft rules of thumb.',
    notes: ['Excess allowance wastes time; cutting and DFM are textbook estimates, not formal process specs.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['allowance', 'draft', 'cutting', 'roughness', 'injection'],
  },

  'standards-ref': {
    title: 'Standard Parts Lookup',
    summary: 'Key sections, pin diameters/fits, O-ring CS series, and shaft retaining-ring grooves.',
    steps: [
      'Pick key / pin-ring / O-ring tab.',
      'Look up by shaft or pin diameter, then jump to the matching strength/seal calc.',
    ],
    principle: 'Common-size lookup to bridge selection and dedicated checks.',
    notes: ['Not a full standards text; groove tolerances and AS568 dash numbers follow official catalogs.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['key', 'pin', 'O-ring', 'retaining ring'],
  },

  'vibration-isolation': {
    title: 'Vibration Isolation',
    summary: 'SDOF isolation: natural frequency, ratio, transmissibility TR, and isolation-region checks.',
    steps: [
      'Enter mass, stiffness, damping ratio, and excitation frequency.',
      'Full mode checks r>√2 and target TR; Pro also checks isolation dB.',
    ],
    principle: 'Force/displacement transmissibility depends on r=f/fn and ζ; isolation usually needs r>√2.',
    formulas: [
      { latex: 'f_n=\\dfrac{1}{2\\pi}\\sqrt{k/m}', note: 'Natural frequency' },
      { latex: 'TR=\\dfrac{\\sqrt{1+(2\\zeta r)^2}}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}}', note: 'Transmissibility' },
    ],
    notes: ['Ideal SDOF; no multi-support coupling or nonlinear mounts.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['isolation', 'transmissibility', 'vibration'],
  },

  'heat-transfer': {
    title: 'Simple Heat Transfer',
    summary: 'Conduction, convection, and series-resistance heat rate and temperature-rise estimates.',
    steps: [
      'Pick conduction / convection / series and enter geometry plus ΔT.',
      'Full mode checks cooling capacity; Pro also checks equivalent surface rise.',
    ],
    principle: 'Steady 1-D: conduction Q=kAΔT/L, convection Q=hAΔT, resistances add in series.',
    formulas: [
      { latex: 'Q=k A \\Delta T / L', note: 'Conduction' },
      { latex: 'Q=h A \\Delta T', note: 'Convection' },
      { latex: 'R_{\\mathrm{th}}=L/(kA)\\ \\mathrm{or}\\ 1/(hA)', note: 'Thermal resistance' },
    ],
    notes: ['Radiation and transients ignored; use simulation/test for release.'],
    useCases: COMMON_USE_CASES,
    inputs: COMMON_INPUTS,
    outputs: COMMON_OUTPUTS,
    reliability: COMMON_RELIABILITY,
    keywords: ['heat transfer', 'conduction', 'convection'],
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
