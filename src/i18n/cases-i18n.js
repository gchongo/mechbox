/** English case display strings keyed by case id (matches constants/cases.js) */

export const casesEn = {
  'gear-gap': {
    title: 'Gear Assembly Clearance',
    desc: 'Typical 1D stack: spacer + gear + shaft diameter (standard requirements case)',
    type: '1D linear',
  },
  'bearing-fit': {
    title: 'Bearing Fit Tolerance',
    desc: 'Interference fit analysis for bearing inner ring and shaft',
    type: '1D linear',
  },
  'shim-thickness': {
    title: 'Shim Thickness Stack',
    desc: 'Effect of stacked shim thicknesses on axial clearance',
    type: '1D linear',
  },
  'shaft-tolerance': {
    title: 'Stepped Shaft Tolerance Chain',
    desc: 'Tolerance accumulation across stepped shaft segments',
    type: '1D linear',
  },
  'parallelism-2d': {
    title: 'Parallelism Stack',
    desc: '2D planar parallelism accumulation (surface A relative to datum)',
    type: '2D planar',
  },
  'position-gdt': {
    title: 'GD&T Position',
    desc: 'RSS synthesis of X/Y locating deviations into a position tolerance zone',
    type: 'GD&T',
  },
  'perpendicularity-2d': {
    title: 'Perpendicularity Stack',
    desc: 'Datum flatness + sidewall flatness + locating dimension accumulation',
    type: '2D planar',
  },
  'coaxiality-gdt': {
    title: 'Coaxiality Stack',
    desc: 'RSS synthesis of radial errors across multiple shaft diameters',
    type: 'GD&T',
  },
  'flatness-2d': {
    title: 'Flatness Accumulation',
    desc: 'Direct stacking of multiple surface flatness values into the closed loop',
    type: '2D planar',
  },
  'runout-gdt': {
    title: 'Runout Stack',
    desc: 'Roundness + eccentricity + shaft radial component accumulation',
    type: 'GD&T',
  },
  'profile-2d': {
    title: '2D Profile Stack',
    desc: 'RSS accumulation of profile deviations along the surface normal',
    type: '2D planar',
  },
  'straightness-2d': {
    title: 'Straightness Stack',
    desc: 'Accumulation of straightness deviations along the length direction',
    type: '2D planar',
  },
  'roundness-gdt': {
    title: 'Roundness Stack',
    desc: 'RSS synthesis of roundness radial errors across multiple cross-sections',
    type: 'GD&T',
  },
}
