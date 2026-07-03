/** English tutorial content keyed by tutorial id (matches constants/tutorials.js) */

export const tutorialsEn = {
  1: {
    title: 'Tolerance Stack Fundamentals',
    duration: '~15 min',
    desc: 'Closed loop, component rings, and increasing/decreasing ring concepts',
    videoTitle: 'Tolerance Stack Analysis Basics (Terminology, Rules, and Walkthrough)',
    sections: [
      {
        heading: 'What Is a Tolerance Stack',
        body: 'A tolerance stack describes how part dimensions in an assembly combine to determine final clearance or interference. The closed loop $L_0$ is the design requirement you must satisfy.',
      },
      {
        heading: 'Component Rings',
        body: 'Component rings are the direct dimensions of each part in the chain. Each ring has a nominal value and tolerance, and is classified as increasing or decreasing.',
      },
      {
        heading: 'Quick Start',
        body: 'In MechBox: select analysis type → define closed-loop target range → add component rings → choose method → review results.',
      },
    ],
  },
  2: {
    title: 'Gear Assembly Case Study',
    duration: '~12 min',
    desc: 'Typical clearance analysis for spacer + gear + shaft diameter',
    videoTitle: 'Assembly Tolerance Stack Case Study',
    sections: [
      {
        heading: 'Case Background',
        body: 'The gear requires an assembly clearance of $0.10\\sim 0.35\\,\\text{mm}$ in the axial direction, involving three component rings: spacer thickness, gear width, and shaft diameter.',
      },
      {
        heading: 'Steps',
        body: 'Open the Case Library → click "Gear Assembly Clearance"; the app loads the preset data and navigates to the results page.',
      },
      {
        heading: 'Reading Results',
        body: 'Compare worst-case and RSS upper/lower limits against the target range. RSS typically yields a more realistic tolerance estimate.',
      },
    ],
  },
  3: {
    title: 'RSS Method in Depth',
    duration: '~18 min',
    desc: 'Statistical combination principles and when to apply them',
    videoTitle: 'Tolerance Stack Column: How to Combine Dimensions, and Limitations of Tolerance Bands',
    sections: [
      {
        heading: 'Formula',
        body: '$T = \\sqrt{T_1^2 + T_2^2 + T_3^2 + \\cdots}$, assuming independent, randomly distributed errors in each ring.',
      },
      {
        heading: 'Comparison with Worst Case',
        body: 'Worst case uses $T=\\sum T_i$ and is most conservative; RSS better reflects batch production statistics and generally corresponds to a high—but not 100%—yield rate.',
      },
      {
        heading: 'Using RSS in MechBox',
        body: 'RSS is selected by default in Step 4. The results page shows both methods side by side for comparison.',
      },
    ],
  },
  4: {
    title: 'Worst Case vs RSS',
    duration: '~20 min',
    desc: 'Differences between the two methods and selection guidance',
    videoTitle: 'Assembly Tolerance Stack Calculation (Detailed Software Walkthrough)',
    sections: [
      {
        heading: 'Worst Case',
        body: 'All ring tolerances stack in the same direction to the worst-case limit—suitable for safety-critical parts, strict regulations, or small-batch validation.',
      },
      {
        heading: 'RSS',
        body: 'Suited to general mechanical design and volume production; maintains reasonable yield without overly conservative design.',
      },
      {
        heading: 'Decision Guidance',
        body: 'Start with RSS; if the result fails or risk is unacceptable, switch to worst case or tighten tolerances on critical rings.',
      },
    ],
  },
  5: {
    title: 'Sigma Level and Cpk',
    duration: '~25 min',
    desc: 'Process capability and quality level metrics',
    videoTitle: 'Six Sigma for Everyone #23 — Process Capability Indices Cp and Cpk (Part 1)',
    sections: [
      {
        heading: 'Sigma Level',
        body: '$\\sigma_{\\text{level}} = T_{\\text{target}}/(6\\sigma)$ reflects how process variation compares to the target tolerance band—the higher the value, the more stable the process.',
      },
      {
        heading: 'Cpk',
        body: '$C_{pk} > 1.33$ is generally considered good process capability. Step 5 on the results page calculates this automatically.',
      },
      {
        heading: 'Statistics Tools',
        body: 'The Statistics page supports standalone $T \\leftrightarrow \\sigma$ conversion, RSS calculation, and sigma analysis without a full tolerance stack.',
      },
    ],
  },
}
