/** English quiz content keyed by question id (matches constants/quiz.js) */

export const quizEn = {
  1: {
    question: 'What is the closed loop?',
    options: [
      { value: 'a', label: 'The dimension formed after assembly' },
      { value: 'b', label: 'Any single part dimension' },
      { value: 'c', label: 'The component ring with the largest tolerance' },
      { value: 'd', label: 'The first dimension entered' },
    ],
    answerLabel: 'The dimension formed after assembly',
    explain:
      'The closed loop is the dimension obtained indirectly after assembly is complete, such as clearance or interference.',
  },
  2: {
    question: 'What is the RSS total tolerance formula?',
    options: [
      { value: 'a', label: '$T = \\sum T_i$' },
      { value: 'b', label: '$T = \\sqrt{\\sum T_i^2}$' },
      { value: 'c', label: '$T = T_1 \\times T_2$' },
      { value: 'd', label: '$T = \\max(T_i)$' },
    ],
    answerLabel: '$T = \\sqrt{\\sum T_i^2}$',
    explain:
      'The RSS (Root Sum Square) method assumes independent rings and combines tolerances by summing squares and taking the square root.',
  },
  3: {
    question: 'An increasing ring is one that…',
    options: [
      { value: 'a', label: 'Acts in the same direction as the closed loop' },
      { value: 'b', label: 'Acts opposite to the closed loop' },
      { value: 'c', label: 'Has the largest tolerance' },
      { value: 'd', label: 'Is the first ring added' },
    ],
    answerLabel: 'Acts in the same direction as the closed loop',
    explain:
      'In a 1D tolerance stack, a component ring whose direction matches the closed loop is increasing; the opposite direction is decreasing.',
  },
  4: {
    question: 'When is worst-case analysis appropriate?',
    options: [
      { value: 'a', label: 'When 100% safety margin under worst-case conditions is required' },
      { value: 'b', label: 'For routine probabilistic analysis in volume production' },
      { value: 'c', label: 'Only for 2D analysis' },
      { value: 'd', label: 'Only for GD&T' },
    ],
    answerLabel: 'When 100% safety margin under worst-case conditions is required',
    explain:
      'Worst case algebraically sums all ring tolerances and yields the most conservative result—suited to high-safety applications.',
  },
  5: {
    question: 'Under a normal distribution, what is the 6σ relationship between tolerance $T$ and standard deviation $\\sigma$?',
    options: [
      { value: 'a', label: '$T = 3\\sigma$' },
      { value: 'b', label: '$T = 6\\sigma$' },
      { value: 'c', label: '$T = \\sigma^2$' },
      { value: 'd', label: '$T = 2\\sigma$' },
    ],
    answerLabel: '$T = 6\\sigma$',
    explain:
      'For a normal distribution, $K=6$—the tolerance band spans approximately $\\pm 3\\sigma$, so total bandwidth $T \\approx 6\\sigma$.',
  },
  6: {
    question: 'How does a decreasing ring affect the closed loop?',
    options: [
      { value: 'a', label: 'Increases the closed loop' },
      { value: 'b', label: 'Decreases the closed loop' },
      { value: 'c', label: 'Has no effect' },
      { value: 'd', label: 'Affects tolerance only' },
    ],
    answerLabel: 'Decreases the closed loop',
    explain:
      'Decreasing rings carry a negative sign in the stack equation—when the ring dimension increases, the closed loop decreases.',
  },
  7: {
    question: 'What does $C_{pk} > 1.33$ typically indicate?',
    options: [
      { value: 'a', label: 'Excellent process capability' },
      { value: 'b', label: 'Certain nonconformance' },
      { value: 'c', label: 'Applies only to RSS' },
      { value: 'd', label: 'Unrelated to tolerance' },
    ],
    answerLabel: 'Excellent process capability',
    explain:
      'Cpk measures how well the process meets specification limits; values above 1.33 are a commonly cited benchmark for good capability.',
  },
  8: {
    question: 'What is the role of a transfer factor?',
    options: [
      { value: 'a', label: 'Weights how much a ring amplifies or attenuates its effect on the closed loop' },
      { value: 'b', label: 'Changes the increasing/decreasing ring type' },
      { value: 'c', label: 'Switches mm/inch units' },
      { value: 'd', label: 'Selects the calculation method' },
    ],
    answerLabel: 'Weights how much a ring amplifies or attenuates its effect on the closed loop',
    explain:
      'Transfer factors handle non 1:1 relationships, such as angular errors or lever ratios.',
  },
  9: {
    question: 'What is the correct pass condition for a tolerance stack against target range $[min,max]$?',
    options: [
      { value: 'a', label: 'Calculated lower limit $\\ge min$ and calculated upper limit $\\le max$' },
      { value: 'b', label: 'Nominal value equals $(min+max)/2$' },
      { value: 'c', label: 'RSS total tolerance $< max$' },
      { value: 'd', label: 'Worst-case total tolerance $=$ RSS total tolerance' },
    ],
    answerLabel: 'Calculated lower limit $\\ge min$ and calculated upper limit $\\le max$',
    explain:
      'The calculated interval for the closed loop must lie entirely within the target specification range to pass.',
  },
  10: {
    question: 'What is the approximate $K$ value (standard deviation factor) for a uniform distribution?',
    options: [
      { value: 'a', label: '$6.0$' },
      { value: 'b', label: '$3.46$' },
      { value: 'c', label: '$4.24$' },
      { value: 'd', label: '$5.0$' },
    ],
    answerLabel: '$3.46$',
    explain:
      'Uniform distribution: $K \\approx 3.46$; normal: $6.0$; triangular: $4.24$; skewed: $5.0$.',
  },
}
