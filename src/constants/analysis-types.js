export const ANALYSIS_GROUPS = [
  {
    id: '1d',
    label: '1D 线性',
    icon: 'ScaleToOriginal',
    types: [
      { id: 'gear-gap', name: '齿轮间隙', desc: '适用于齿轮装配间隙分析', icon: 'SetUp' },
      { id: 'bearing-fit', name: '轴承配合', desc: '适用于轴承装配配合分析', icon: 'Help' },
      { id: 'shaft-tolerance', name: '轴径公差', desc: '适用于轴径尺寸链分析', icon: 'Minus' },
      { id: 'shim-thickness', name: '垫片厚度', desc: '适用于垫片厚度叠加分析', icon: 'CopyDocument' },
    ],
  },
  {
    id: '2d',
    label: '2D 平面',
    icon: 'Grid',
    types: [
      { id: 'parallelism', name: '平行度', desc: '适用于平面平行度分析', icon: 'Sort' },
      { id: 'perpendicularity', name: '垂直度', desc: '适用于平面垂直度分析', icon: 'Sort' },
      { id: 'profile-2d', name: '轮廓度', desc: '适用于2D轮廓度分析', icon: 'Crop' },
      { id: 'flatness', name: '平面度', desc: '适用于平面度分析', icon: 'Grid' },
    ],
  },
  {
    id: '3d',
    label: '3D 空间',
    icon: 'Box',
    types: [
      { id: 'assembly-3d', name: '立体装配', desc: '适用于三维装配尺寸链', icon: 'Box' },
      { id: 'housing-assembly', name: '箱体装配', desc: '适用于箱体装配分析', icon: 'Briefcase' },
      { id: 'frame-assembly', name: '机架装配', desc: '适用于机架装配分析', icon: 'OfficeBuilding' },
      { id: 'stack-up-3d', name: '空间叠加', desc: '适用于空间尺寸叠加', icon: 'Files' },
    ],
  },
  {
    id: 'gdt',
    label: 'GD&T 公差',
    icon: 'Setting',
    types: [
      { id: 'position', name: '位置度', desc: '适用于GD&T位置度分析', icon: 'Aim' },
      { id: 'coaxiality', name: '同轴度', desc: '适用于GD&T同轴度分析', icon: 'Connection' },
      { id: 'profile-gdt', name: '轮廓度', desc: '适用于GD&T轮廓度分析', icon: 'Crop' },
      { id: 'runout', name: '跳动', desc: '适用于GD&T跳动分析', icon: 'Refresh' },
    ],
  },
]

export const ALL_ANALYSIS_TYPES = ANALYSIS_GROUPS.flatMap((group) =>
  group.types.map((type) => ({ ...type, groupId: group.id, groupLabel: group.label })),
)

export function findAnalysisType(typeId) {
  return ALL_ANALYSIS_TYPES.find((t) => t.id === typeId) ?? null
}
