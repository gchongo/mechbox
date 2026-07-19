/**
 * Tolerance / GPS 相关标准目录（导航母表）
 * 来源：Tolerance Hub 04-standards-catalog.md（2026-07-18）
 * 不复制标准正文；版本须以官方页为准。
 */

export const STANDARDS_CATALOG_META = {
  updated: '2026-07-18',
  sourceZh: 'Tolerance Hub 标准导航母表',
  disclaimerZh:
    '本页仅作标准体系导航与主题索引，不替代标准购买、阅读与企业合规审核。正式引用前请再次核对官方标准页版本。',
  disclaimerEn:
    'Navigation index only — not a substitute for purchasing/reading standards or compliance review. Re-check official editions before citing.',
}

export const STANDARDS_CATALOG_SECTIONS = [
  {
    "id": "priority",
    "kind": "priority",
    "titleZh": "优先级定义",
    "noteZh": "",
    "items": [
      {
        "priority": "P0",
        "labelZh": "核心标准",
        "handleZh": "必须建立标准导航页、术语映射、相关文章和案例引用"
      },
      {
        "priority": "P1",
        "labelZh": "重要扩展",
        "handleZh": "按专题逐步建立解释页和案例关联"
      },
      {
        "priority": "P2",
        "labelZh": "行业/制造/质量扩展",
        "handleZh": "作为专业背景、行业指南或外部参考，不强行展开全文"
      },
      {
        "priority": "待核验",
        "labelZh": "版本或采用关系需人工复核",
        "handleZh": "只列入候选，不直接作为正式结论依据"
      }
    ]
  },
  {
    "id": "gps",
    "kind": "standards",
    "titleZh": "ISO GPS 总体系与基础原则",
    "noteZh": "",
    "items": [
      {
        "id": "gps-iso-tc-213-catalogue",
        "priority": "P0",
        "code": "ISO/TC 213 catalogue",
        "topicZh": "ISO GPS 标准总目录",
        "useZh": "标准体系入口、版本核查入口"
      },
      {
        "id": "gps-iso-1-2022",
        "priority": "P0",
        "code": "ISO 1:2022",
        "topicZh": "几何与尺寸规范/验证的标准参考温度",
        "useZh": "温度、热膨胀、测量条件专题"
      },
      {
        "id": "gps-iso-8015-2011",
        "priority": "P0",
        "code": "ISO 8015:2011",
        "topicZh": "GPS 基础概念、原则和规则",
        "useZh": "“独立原则”“图样解释规则”“GPS 总原则”"
      },
      {
        "id": "gps-iso-14638-2015",
        "priority": "P0",
        "code": "ISO 14638:2015",
        "topicZh": "GPS 矩阵模型",
        "useZh": "标准关系图谱、GPS 架构页"
      },
      {
        "id": "gps-iso-17450-1-2011",
        "priority": "P0",
        "code": "ISO 17450-1:2011",
        "topicZh": "几何规范与验证模型",
        "useZh": "名义模型、实际工件、提取要素、关联要素"
      },
      {
        "id": "gps-iso-17450-2-2012",
        "priority": "P0",
        "code": "ISO 17450-2:2012",
        "topicZh": "规格、操作符、不确定度、歧义",
        "useZh": "规格操作符、验证操作符、歧义来源"
      },
      {
        "id": "gps-iso-17450-3-2016",
        "priority": "P1",
        "code": "ISO 17450-3:2016",
        "topicZh": "被公差化要素",
        "useZh": "要素类型、受控对象、GD&T 语义边界"
      },
      {
        "id": "gps-iso-17450-4-2017",
        "priority": "P1",
        "code": "ISO 17450-4:2017",
        "topicZh": "GPS 偏差量化几何特征",
        "useZh": "偏差、评价、几何特征解释"
      },
      {
        "id": "gps-iso-22432-2011",
        "priority": "P1",
        "code": "ISO 22432:2011",
        "topicZh": "规格与验证中使用的要素",
        "useZh": "要素词典、提取/关联/拟合流程"
      },
      {
        "id": "gps-iso-14406-2010",
        "priority": "P1",
        "code": "ISO 14406:2010",
        "topicZh": "提取 extraction",
        "useZh": "CMM 采样、提取规则、验证链路"
      },
      {
        "id": "gps-iso-18183-1-2024",
        "priority": "P1",
        "code": "ISO 18183-1:2024",
        "topicZh": "Partition 分区：词汇和基础概念",
        "useZh": "新一代 GPS 分区/要素拆分专题"
      },
      {
        "id": "gps-iso-18183-2-2024",
        "priority": "P1",
        "code": "ISO 18183-2:2024",
        "topicZh": "Partition 分区：名义模型",
        "useZh": "MBD/PMI 与几何模型解释"
      },
      {
        "id": "gps-iso-18183-3-2024",
        "priority": "P1",
        "code": "ISO 18183-3:2024",
        "topicZh": "Partition 分区：规格与验证方法",
        "useZh": "高级 GPS 规格与验证专题"
      },
      {
        "id": "gps-iso-18391-2016",
        "priority": "P1",
        "code": "ISO 18391:2016",
        "topicZh": "Population specification",
        "useZh": "批量、总体、抽样与规格关系"
      },
      {
        "id": "gps-iso-20170-2019",
        "priority": "P1",
        "code": "ISO 20170:2019",
        "topicZh": "制造控制用几何特征分解",
        "useZh": "制造误差来源、过程控制与几何偏差"
      },
      {
        "id": "gps-iso-21204-2020",
        "priority": "P1",
        "code": "ISO 21204:2020",
        "topicZh": "Transition specification",
        "useZh": "倒角、圆角、边界过渡等专题"
      },
      {
        "id": "gps-iso-ts-21619-2018",
        "priority": "P1",
        "code": "ISO/TS 21619:2018",
        "topicZh": "含 GPS 的文件类型",
        "useZh": "图纸、3D 模型、检验规范文件关系"
      }
    ]
  },
  {
    "id": "fits",
    "kind": "standards",
    "titleZh": "尺寸、公差与配合",
    "noteZh": "",
    "items": [
      {
        "id": "fits-iso-286-1-2010",
        "priority": "P0",
        "code": "ISO 286-1:2010",
        "topicZh": "线性尺寸公差 ISO 代号制基础",
        "useZh": "基孔制、基轴制、IT 等级、基本偏差理论"
      },
      {
        "id": "fits-iso-286-2-2010",
        "priority": "P0",
        "code": "ISO 286-2:2010",
        "topicZh": "标准公差等级与极限偏差表",
        "useZh": "配合导航，不在本站做数值计算"
      },
      {
        "id": "fits-iso-14405-1-2025",
        "priority": "P0",
        "code": "ISO 14405-1:2025",
        "topicZh": "线性尺寸标注",
        "useZh": "局部尺寸、两点尺寸、包容关系、默认操作符"
      },
      {
        "id": "fits-iso-14405-2-2018",
        "priority": "P1",
        "code": "ISO 14405-2:2018",
        "topicZh": "非线性/非角度尺寸",
        "useZh": "半径、球径、复杂尺寸表达"
      },
      {
        "id": "fits-iso-14405-3-2016",
        "priority": "P1",
        "code": "ISO 14405-3:2016",
        "topicZh": "角度尺寸",
        "useZh": "锥度、斜度、角度规格专题"
      },
      {
        "id": "fits-iso-2768-1-1989",
        "priority": "P1",
        "code": "ISO 2768-1:1989",
        "topicZh": "未注线性和角度尺寸的一般公差",
        "useZh": "旧图纸识读、通用公差风险"
      },
      {
        "id": "fits-iso-22081-2021",
        "priority": "P1",
        "code": "ISO 22081:2021",
        "topicZh": "一般几何规格与一般尺寸规格",
        "useZh": "替代/更新 ISO 2768-2 思路、通用几何要求"
      },
      {
        "id": "fits-iso-13920",
        "priority": "P2",
        "code": "ISO 13920",
        "topicZh": "焊接结构尺寸和形位一般公差",
        "useZh": "焊接件、支架、机架案例"
      },
      {
        "id": "fits-iso-8062-series",
        "priority": "P2",
        "code": "ISO 8062 series",
        "topicZh": "铸件尺寸、几何公差与加工余量",
        "useZh": "铸造件、毛坯、加工余量专题"
      },
      {
        "id": "fits-iso-68-series",
        "priority": "P2",
        "code": "ISO 68 series",
        "topicZh": "ISO 普通螺纹基本牙型",
        "useZh": "螺纹基础专题"
      },
      {
        "id": "fits-iso-261-iso-262",
        "priority": "P2",
        "code": "ISO 261 / ISO 262",
        "topicZh": "ISO 普通螺纹直径与螺距系列",
        "useZh": "螺纹选型导航"
      },
      {
        "id": "fits-iso-724",
        "priority": "P2",
        "code": "ISO 724",
        "topicZh": "ISO 普通螺纹基本尺寸",
        "useZh": "螺纹尺寸解释"
      },
      {
        "id": "fits-iso-965-series",
        "priority": "P2",
        "code": "ISO 965 series",
        "topicZh": "ISO 普通螺纹公差",
        "useZh": "螺纹配合与检验专题"
      },
      {
        "id": "fits-iso-273",
        "priority": "P2",
        "code": "ISO 273",
        "topicZh": "螺栓和螺钉通孔",
        "useZh": "螺栓孔、定位孔、装配间隙案例"
      }
    ]
  },
  {
    "id": "gdt",
    "kind": "standards",
    "titleZh": "GD&T / ISO 几何公差",
    "noteZh": "",
    "items": [
      {
        "id": "gdt-iso-1101-2017",
        "priority": "P0",
        "code": "ISO 1101:2017",
        "topicZh": "几何公差符号语言与解释规则",
        "useZh": "GD&T 核心标准导航、全部几何特征入口"
      },
      {
        "id": "gdt-iso-5459-2024",
        "priority": "P0",
        "code": "ISO 5459:2024",
        "topicZh": "基准与基准体系",
        "useZh": "基准特征、基准、基准模拟体、3-2-1"
      },
      {
        "id": "gdt-iso-2692-2021",
        "priority": "P0",
        "code": "ISO 2692:2021",
        "topicZh": "最大实体要求、最小实体要求、互惠要求",
        "useZh": "MMC/LMC/RPR、虚拟条件、功能量规"
      },
      {
        "id": "gdt-iso-5458-2018",
        "priority": "P0",
        "code": "ISO 5458:2018",
        "topicZh": "成组与组合几何规格",
        "useZh": "孔组、复合位置度、成组要素"
      },
      {
        "id": "gdt-iso-1660-2017",
        "priority": "P0",
        "code": "ISO 1660:2017",
        "topicZh": "轮廓度",
        "useZh": "线轮廓、面轮廓、有/无基准差异"
      },
      {
        "id": "gdt-iso-10579-2010",
        "priority": "P1",
        "code": "ISO 10579:2010",
        "topicZh": "非刚性零件尺寸与几何公差",
        "useZh": "薄壁、橡胶、塑料、自由状态"
      },
      {
        "id": "gdt-iso-12180-2-2011",
        "priority": "P1",
        "code": "ISO 12180-2:2011",
        "topicZh": "圆柱度规格操作符",
        "useZh": "圆柱度验证与算法解释"
      },
      {
        "id": "gdt-iso-12181-1-2011",
        "priority": "P1",
        "code": "ISO 12181-1:2011",
        "topicZh": "圆度词汇和参数",
        "useZh": "圆度概念与评价"
      },
      {
        "id": "gdt-iso-12181-2-2011",
        "priority": "P1",
        "code": "ISO 12181-2:2011",
        "topicZh": "圆度规格操作符",
        "useZh": "圆度测量与拟合方式"
      },
      {
        "id": "gdt-iso-12780-1-12780-2",
        "priority": "P1",
        "code": "ISO 12780-1 / 12780-2",
        "topicZh": "直线度词汇、参数、规格操作符",
        "useZh": "直线度专题"
      },
      {
        "id": "gdt-iso-12781-1-12781-2",
        "priority": "P1",
        "code": "ISO 12781-1 / 12781-2",
        "topicZh": "平面度词汇、参数、规格操作符",
        "useZh": "平面度专题"
      },
      {
        "id": "gdt-iso-ts-17863-2013",
        "priority": "P1",
        "code": "ISO/TS 17863:2013",
        "topicZh": "可运动装配的公差",
        "useZh": "铰链、导轨、运动副案例"
      }
    ]
  },
  {
    "id": "surface",
    "kind": "standards",
    "titleZh": "表面纹理与表面完整性",
    "noteZh": "",
    "items": [
      {
        "id": "surface-iso-21920-1-2021",
        "priority": "P0",
        "code": "ISO 21920-1:2021",
        "topicZh": "表面纹理轮廓法：标注",
        "useZh": "粗糙度符号、图样标注"
      },
      {
        "id": "surface-iso-21920-2-2021",
        "priority": "P0",
        "code": "ISO 21920-2:2021",
        "topicZh": "表面纹理轮廓法：术语、定义、参数",
        "useZh": "Ra/Rz/Rsm 等术语解释"
      },
      {
        "id": "surface-iso-21920-3-2021",
        "priority": "P0",
        "code": "ISO 21920-3:2021",
        "topicZh": "表面纹理轮廓法：规格操作符",
        "useZh": "截止波长、滤波、评价长度"
      },
      {
        "id": "surface-iso-25178-series",
        "priority": "P1",
        "code": "ISO 25178 series",
        "topicZh": "面域表面纹理 areal surface texture",
        "useZh": "3D 表面纹理、功能表面专题"
      },
      {
        "id": "surface-iso-16610-series",
        "priority": "P1",
        "code": "ISO 16610 series",
        "topicZh": "GPS 滤波",
        "useZh": "表面纹理、形状误差、波纹度分离"
      },
      {
        "id": "surface-iso-4287-iso-4288",
        "priority": "P1",
        "code": "ISO 4287 / ISO 4288",
        "topicZh": "旧版轮廓法表面纹理体系",
        "useZh": "旧图纸兼容、历史标准解释"
      },
      {
        "id": "surface-iso-1302-2002",
        "priority": "P1",
        "code": "ISO 1302:2002",
        "topicZh": "旧版表面纹理图样标注",
        "useZh": "旧图纸识读，需注明与 ISO 21920 的关系"
      },
      {
        "id": "surface-iso-8785",
        "priority": "P2",
        "code": "ISO 8785",
        "topicZh": "表面缺陷术语",
        "useZh": "划伤、裂纹、坑蚀、毛刺等缺陷专题"
      }
    ]
  },
  {
    "id": "metrology",
    "kind": "standards",
    "titleZh": "计量、验证、不确定度与判定",
    "noteZh": "",
    "items": [
      {
        "id": "metrology-iso-14253-1-2017",
        "priority": "P0",
        "code": "ISO 14253-1:2017",
        "topicZh": "通过测量验证符合/不符合的判定规则",
        "useZh": "合格判定、保护带、误收误拒"
      },
      {
        "id": "metrology-iso-14253-2-2011",
        "priority": "P0",
        "code": "ISO 14253-2:2011",
        "topicZh": "GPS 测量不确定度估计指南",
        "useZh": "不确定度预算、PUMA、验证链路"
      },
      {
        "id": "metrology-iso-14253-5-2015",
        "priority": "P1",
        "code": "ISO 14253-5:2015",
        "topicZh": "指示测量仪器验证测试的不确定度",
        "useZh": "量具/仪器验证专题"
      },
      {
        "id": "metrology-jcgm-100-2008-gum",
        "priority": "P0",
        "code": "JCGM 100:2008 GUM",
        "topicZh": "测量不确定度表达指南",
        "useZh": "不确定度理论基础"
      },
      {
        "id": "metrology-jcgm-200-2012-vim",
        "priority": "P0",
        "code": "JCGM 200:2012 VIM",
        "topicZh": "国际计量词汇",
        "useZh": "术语词典、计量语言统一"
      },
      {
        "id": "metrology-jcgm-101-2008",
        "priority": "P1",
        "code": "JCGM 101:2008",
        "topicZh": "Monte Carlo 不确定度传播补充",
        "useZh": "高级不确定度专题"
      },
      {
        "id": "metrology-jcgm-106-2012",
        "priority": "P1",
        "code": "JCGM 106:2012",
        "topicZh": "符合性评定中测量不确定度作用",
        "useZh": "判定风险、保护带专题"
      },
      {
        "id": "metrology-iso-iec-guide-98-series",
        "priority": "P1",
        "code": "ISO/IEC Guide 98 series",
        "topicZh": "GUM 系列",
        "useZh": "与 JCGM 文件对应导航"
      },
      {
        "id": "metrology-iso-iec-guide-99",
        "priority": "P1",
        "code": "ISO/IEC Guide 99",
        "topicZh": "VIM",
        "useZh": "计量术语导航"
      },
      {
        "id": "metrology-iso-iec-17025-2017",
        "priority": "P0",
        "code": "ISO/IEC 17025:2017",
        "topicZh": "检测和校准实验室能力",
        "useZh": "实验室、校准、溯源、报告"
      },
      {
        "id": "metrology-iso-10012-2003",
        "priority": "P1",
        "code": "ISO 10012:2003",
        "topicZh": "测量管理体系",
        "useZh": "企业计量体系与测量过程控制"
      },
      {
        "id": "metrology-iso-14978-2018",
        "priority": "P1",
        "code": "ISO 14978:2018",
        "topicZh": "GPS 测量设备通用概念和要求",
        "useZh": "测量设备分类、计量特性"
      },
      {
        "id": "metrology-iso-15530-series",
        "priority": "P1",
        "code": "ISO 15530 series",
        "topicZh": "CMM 测量不确定度确定技术",
        "useZh": "CMM 不确定度、校准工件、仿真"
      },
      {
        "id": "metrology-iso-ts-17865-2016",
        "priority": "P1",
        "code": "ISO/TS 17865:2016",
        "topicZh": "CMM 测试不确定度评价指南",
        "useZh": "CMM 验收测试风险"
      },
      {
        "id": "metrology-iso-tr-16015-2003",
        "priority": "P1",
        "code": "ISO/TR 16015:2003",
        "topicZh": "温度影响导致的测量不确定度",
        "useZh": "温度补偿、热漂移专题"
      },
      {
        "id": "metrology-nist-sp-500-244",
        "priority": "P2",
        "code": "NIST SP 500-244",
        "topicZh": "GUM 解释指南",
        "useZh": "公开教学参考"
      },
      {
        "id": "metrology-nist-sematech-engineering-statistics-handbook",
        "priority": "P2",
        "code": "NIST/SEMATECH Engineering Statistics Handbook",
        "topicZh": "工程统计、测量过程、过程能力",
        "useZh": "质量统计教学参考"
      }
    ]
  },
  {
    "id": "asme-y14",
    "kind": "standards",
    "titleZh": "ASME Y14 图样、GD&T 与 MBD",
    "noteZh": "",
    "items": [
      {
        "id": "asme-y14-asme-y14-5-2018",
        "priority": "P0",
        "code": "ASME Y14.5-2018",
        "topicZh": "尺寸标注与几何公差",
        "useZh": "ASME 体系 GD&T 核心导航"
      },
      {
        "id": "asme-y14-asme-y14-5-1-2019",
        "priority": "P0",
        "code": "ASME Y14.5.1-2019",
        "topicZh": "GD&T 原理的数学定义",
        "useZh": "实际值、算法、验证解释"
      },
      {
        "id": "asme-y14-asme-y14-5-2-2017",
        "priority": "P1",
        "code": "ASME Y14.5.2-2017",
        "topicZh": "GD&T 专业认证",
        "useZh": "学习路径、题库范围"
      },
      {
        "id": "asme-y14-asme-y14-49-2025",
        "priority": "P1",
        "code": "ASME Y14.49-2025",
        "topicZh": "补充尺寸与公差规格",
        "useZh": "ASME 新增/扩展规则观察"
      },
      {
        "id": "asme-y14-asme-y14-41-2026",
        "priority": "P0",
        "code": "ASME Y14.41-2026",
        "topicZh": "数字产品定义数据实践",
        "useZh": "MBD、PMI、3D 模型定义"
      },
      {
        "id": "asme-y14-asme-y14-24-2020",
        "priority": "P0",
        "code": "ASME Y14.24-2020",
        "topicZh": "工程图类型和应用",
        "useZh": "图纸类型、最低内容要求"
      },
      {
        "id": "asme-y14-asme-y14-35-2025",
        "priority": "P1",
        "code": "ASME Y14.35-2025",
        "topicZh": "工程产品定义数据集和相关文档修订",
        "useZh": "图纸版本、ECR/ECN、变更记录"
      },
      {
        "id": "asme-y14-asme-y14-100",
        "priority": "P1",
        "code": "ASME Y14.100",
        "topicZh": "工程图样实践",
        "useZh": "ASME 图样总规则"
      },
      {
        "id": "asme-y14-asme-y14-1",
        "priority": "P1",
        "code": "ASME Y14.1",
        "topicZh": "图纸幅面与格式",
        "useZh": "图框、图纸格式"
      },
      {
        "id": "asme-y14-asme-y14-2",
        "priority": "P1",
        "code": "ASME Y14.2",
        "topicZh": "线型和文字",
        "useZh": "制图规范"
      },
      {
        "id": "asme-y14-asme-y14-3",
        "priority": "P1",
        "code": "ASME Y14.3",
        "topicZh": "正投影和图示视图",
        "useZh": "视图、剖视、投影视图"
      },
      {
        "id": "asme-y14-asme-y14-34",
        "priority": "P1",
        "code": "ASME Y14.34",
        "topicZh": "关联清单",
        "useZh": "BOM/零件清单/工程数据"
      },
      {
        "id": "asme-y14-asme-y14-36",
        "priority": "P1",
        "code": "ASME Y14.36",
        "topicZh": "表面纹理符号",
        "useZh": "ASME 表面纹理标注"
      },
      {
        "id": "asme-y14-asme-y14-38",
        "priority": "P1",
        "code": "ASME Y14.38",
        "topicZh": "缩写与首字母缩略词",
        "useZh": "图样术语规范"
      },
      {
        "id": "asme-y14-asme-y14-43",
        "priority": "P1",
        "code": "ASME Y14.43",
        "topicZh": "尺寸与公差原则",
        "useZh": "图样规格语义扩展"
      },
      {
        "id": "asme-y14-asme-y14-47",
        "priority": "P1",
        "code": "ASME Y14.47",
        "topicZh": "模型组织实践",
        "useZh": "MBD 数据组织"
      }
    ]
  },
  {
    "id": "asme-b89",
    "kind": "standards",
    "titleZh": "ASME B89 与尺寸计量",
    "noteZh": "",
    "items": [
      {
        "id": "asme-b89-asme-b89-series",
        "priority": "P1",
        "code": "ASME B89 series",
        "topicZh": "尺寸计量标准体系",
        "useZh": "美标计量体系导航"
      },
      {
        "id": "asme-b89-asme-b89-7-series",
        "priority": "P1",
        "code": "ASME B89.7 series",
        "topicZh": "测量不确定度与判定规则",
        "useZh": "与 ISO 14253 / GUM 对比"
      },
      {
        "id": "asme-b89-asme-b89-4-10360-series",
        "priority": "P1",
        "code": "ASME B89.4.10360 series",
        "topicZh": "CMM/CMS 性能测试",
        "useZh": "与 ISO 10360 对照"
      },
      {
        "id": "asme-b89-asme-b89-1-series",
        "priority": "P2",
        "code": "ASME B89.1 series",
        "topicZh": "长度量具、千分尺、卡尺等",
        "useZh": "常用量具专题"
      }
    ]
  },
  {
    "id": "mbd",
    "kind": "standards",
    "titleZh": "数字化产品定义、STEP、QIF 与数据交换",
    "noteZh": "",
    "items": [
      {
        "id": "mbd-iso-16792-2021",
        "priority": "P0",
        "code": "ISO 16792:2021",
        "topicZh": "数字产品定义数据实践",
        "useZh": "3D model-only、3D+2D、PMI"
      },
      {
        "id": "mbd-iso-10303-242-2025",
        "priority": "P0",
        "code": "ISO 10303-242:2025",
        "topicZh": "STEP AP242 管理式基于模型的 3D 工程",
        "useZh": "CAD/PMI 数据交换、长期归档"
      },
      {
        "id": "mbd-iso-10303-series",
        "priority": "P1",
        "code": "ISO 10303 series",
        "topicZh": "STEP 产品数据表达与交换",
        "useZh": "数字线索、PLM、MBD 背景"
      },
      {
        "id": "mbd-dmsc-qif-3-x",
        "priority": "P1",
        "code": "DMSC QIF 3.x",
        "topicZh": "Quality Information Framework",
        "useZh": "检测计划、测量结果、质量数据交换"
      },
      {
        "id": "mbd-iso-23952-qif-采用关系",
        "priority": "P1",
        "code": "ISO 23952 / QIF 采用关系",
        "topicZh": "QIF 国际标准化方向",
        "useZh": "待核验后进入正式标准页"
      },
      {
        "id": "mbd-mil-std-31000",
        "priority": "P2",
        "code": "MIL-STD-31000",
        "topicZh": "技术数据包 TDP",
        "useZh": "航空/防务 MBD 背景"
      }
    ]
  },
  {
    "id": "drawings",
    "kind": "standards",
    "titleZh": "技术产品文件与工程图通用标准",
    "noteZh": "",
    "items": [
      {
        "id": "drawings-iso-128-series",
        "priority": "P1",
        "code": "ISO 128 series",
        "topicZh": "技术产品文件表示通则",
        "useZh": "线型、视图、剖视、图示规则"
      },
      {
        "id": "drawings-iso-129-1",
        "priority": "P1",
        "code": "ISO 129-1",
        "topicZh": "尺寸标注一般原则",
        "useZh": "尺寸标注基础"
      },
      {
        "id": "drawings-iso-3098-series",
        "priority": "P1",
        "code": "ISO 3098 series",
        "topicZh": "技术产品文件文字",
        "useZh": "字体、字高、可读性"
      },
      {
        "id": "drawings-iso-5455",
        "priority": "P1",
        "code": "ISO 5455",
        "topicZh": "比例",
        "useZh": "图样比例"
      },
      {
        "id": "drawings-iso-5456-series",
        "priority": "P1",
        "code": "ISO 5456 series",
        "topicZh": "投影方法",
        "useZh": "第一角/第三角投影"
      },
      {
        "id": "drawings-iso-5457",
        "priority": "P1",
        "code": "ISO 5457",
        "topicZh": "图纸幅面和格式",
        "useZh": "图框、幅面"
      },
      {
        "id": "drawings-iso-7200-2004",
        "priority": "P1",
        "code": "ISO 7200:2004",
        "topicZh": "标题栏和文件头数据字段",
        "useZh": "图纸元数据、版本字段"
      },
      {
        "id": "drawings-iso-7573",
        "priority": "P1",
        "code": "ISO 7573",
        "topicZh": "零件清单",
        "useZh": "BOM 与图样关系"
      },
      {
        "id": "drawings-iso-6433",
        "priority": "P2",
        "code": "ISO 6433",
        "topicZh": "零件编号",
        "useZh": "装配图、件号、明细栏"
      }
    ]
  },
  {
    "id": "quality",
    "kind": "standards",
    "titleZh": "质量管理、SPC、MSA、APQP、FMEA",
    "noteZh": "",
    "items": [
      {
        "id": "quality-iso-9001-2015",
        "priority": "P0",
        "code": "ISO 9001:2015",
        "topicZh": "质量管理体系",
        "useZh": "设计输出、过程控制、验证与改进背景"
      },
      {
        "id": "quality-iso-10012-2003",
        "priority": "P1",
        "code": "ISO 10012:2003",
        "topicZh": "测量管理体系",
        "useZh": "测量过程和测量设备管理"
      },
      {
        "id": "quality-iso-2859-series",
        "priority": "P1",
        "code": "ISO 2859 series",
        "topicZh": "属性抽样检验",
        "useZh": "抽样检验专题"
      },
      {
        "id": "quality-iso-3951-series",
        "priority": "P1",
        "code": "ISO 3951 series",
        "topicZh": "计量抽样检验",
        "useZh": "计量型抽样专题"
      },
      {
        "id": "quality-iso-22514-series",
        "priority": "P1",
        "code": "ISO 22514 series",
        "topicZh": "统计方法中的过程管理能力与性能",
        "useZh": "Cp/Cpk/Pp/Ppk 体系"
      },
      {
        "id": "quality-iso-7870-series",
        "priority": "P1",
        "code": "ISO 7870 series",
        "topicZh": "控制图",
        "useZh": "SPC 控制图专题"
      },
      {
        "id": "quality-iso-21747-2006",
        "priority": "P1",
        "code": "ISO 21747:2006",
        "topicZh": "过程性能和能力统计",
        "useZh": "能力指数解释"
      },
      {
        "id": "quality-iso-3534-series",
        "priority": "P1",
        "code": "ISO 3534 series",
        "topicZh": "统计词汇和符号",
        "useZh": "质量统计术语"
      },
      {
        "id": "quality-iso-31000-2018",
        "priority": "P1",
        "code": "ISO 31000:2018",
        "topicZh": "风险管理",
        "useZh": "工程风险、质量风险背景"
      },
      {
        "id": "quality-iec-60812-2018",
        "priority": "P1",
        "code": "IEC 60812:2018",
        "topicZh": "FMEA/FMECA",
        "useZh": "失效模式与风险分析"
      },
      {
        "id": "quality-aiag-vda-fmea-handbook",
        "priority": "P1",
        "code": "AIAG-VDA FMEA Handbook",
        "topicZh": "汽车行业 FMEA",
        "useZh": "DFMEA/PFMEA 案例"
      },
      {
        "id": "quality-aiag-apqp-control-plan",
        "priority": "P1",
        "code": "AIAG APQP / Control Plan",
        "topicZh": "产品质量先期策划和控制计划",
        "useZh": "CTQ、特殊特性、控制计划"
      },
      {
        "id": "quality-aiag-ppap",
        "priority": "P1",
        "code": "AIAG PPAP",
        "topicZh": "生产件批准程序",
        "useZh": "尺寸报告、材料报告、能力、MSA 证据链"
      },
      {
        "id": "quality-aiag-msa",
        "priority": "P1",
        "code": "AIAG MSA",
        "topicZh": "测量系统分析",
        "useZh": "Gauge R&R、偏倚、线性、稳定性"
      },
      {
        "id": "quality-aiag-spc",
        "priority": "P1",
        "code": "AIAG SPC",
        "topicZh": "统计过程控制",
        "useZh": "控制图、过程能力"
      },
      {
        "id": "quality-vda-2-vda-mla-vda-5",
        "priority": "P2",
        "code": "VDA 2 / VDA MLA / VDA 5",
        "topicZh": "德系汽车质量与测量能力",
        "useZh": "行业扩展专题"
      }
    ]
  },
  {
    "id": "mfg",
    "kind": "standards",
    "titleZh": "制造、材料、连接与可靠性",
    "noteZh": "",
    "items": [
      {
        "id": "mfg-iso-2768-1-iso-22081",
        "priority": "P1",
        "code": "ISO 2768-1 / ISO 22081",
        "topicZh": "一般公差",
        "useZh": "通用制造要求和旧图纸风险"
      },
      {
        "id": "mfg-iso-8062-series",
        "priority": "P1",
        "code": "ISO 8062 series",
        "topicZh": "铸件公差和加工余量",
        "useZh": "铸件案例"
      },
      {
        "id": "mfg-iso-13920",
        "priority": "P1",
        "code": "ISO 13920",
        "topicZh": "焊接结构一般公差",
        "useZh": "焊接件尺寸和形位偏差"
      },
      {
        "id": "mfg-iso-2553",
        "priority": "P1",
        "code": "ISO 2553",
        "topicZh": "焊接符号",
        "useZh": "图样识读"
      },
      {
        "id": "mfg-iso-5817",
        "priority": "P1",
        "code": "ISO 5817",
        "topicZh": "焊缝质量等级",
        "useZh": "焊接缺陷和验收背景"
      },
      {
        "id": "mfg-iso-15614-series",
        "priority": "P2",
        "code": "ISO 15614 series",
        "topicZh": "焊接工艺评定",
        "useZh": "制造过程能力背景"
      },
      {
        "id": "mfg-iso-898-series",
        "priority": "P1",
        "code": "ISO 898 series",
        "topicZh": "碳钢/合金钢紧固件机械性能",
        "useZh": "螺栓连接、强度等级"
      },
      {
        "id": "mfg-iso-3506-series",
        "priority": "P1",
        "code": "ISO 3506 series",
        "topicZh": "不锈钢紧固件机械性能",
        "useZh": "腐蚀环境紧固件"
      },
      {
        "id": "mfg-iso-4014-iso-4017",
        "priority": "P1",
        "code": "ISO 4014 / ISO 4017",
        "topicZh": "六角头螺栓",
        "useZh": "标准件识读"
      },
      {
        "id": "mfg-iso-4032",
        "priority": "P1",
        "code": "ISO 4032",
        "topicZh": "六角螺母",
        "useZh": "标准件识读"
      },
      {
        "id": "mfg-iso-4762",
        "priority": "P1",
        "code": "ISO 4762",
        "topicZh": "内六角圆柱头螺钉",
        "useZh": "标准件识读"
      },
      {
        "id": "mfg-iso-8734-iso-8735",
        "priority": "P1",
        "code": "ISO 8734 / ISO 8735",
        "topicZh": "圆柱销",
        "useZh": "定位销、孔/销配合"
      },
      {
        "id": "mfg-iso-492",
        "priority": "P1",
        "code": "ISO 492",
        "topicZh": "滚动轴承公差",
        "useZh": "轴承座孔、同轴度、圆柱度案例"
      },
      {
        "id": "mfg-iso-281",
        "priority": "P1",
        "code": "ISO 281",
        "topicZh": "滚动轴承额定寿命",
        "useZh": "可靠性与寿命背景"
      },
      {
        "id": "mfg-iso-286-iso-492-iso-1101",
        "priority": "P1",
        "code": "ISO 286 / ISO 492 / ISO 1101",
        "topicZh": "轴承配合组合引用",
        "useZh": "轴承孔案例标准组合"
      },
      {
        "id": "mfg-iso-9227",
        "priority": "P2",
        "code": "ISO 9227",
        "topicZh": "盐雾试验",
        "useZh": "腐蚀验证背景"
      },
      {
        "id": "mfg-iso-6506-6507-6508",
        "priority": "P2",
        "code": "ISO 6506 / 6507 / 6508",
        "topicZh": "布氏、维氏、洛氏硬度",
        "useZh": "材料与热处理检验"
      },
      {
        "id": "mfg-iso-6892-1",
        "priority": "P2",
        "code": "ISO 6892-1",
        "topicZh": "金属拉伸试验",
        "useZh": "材料性能验证"
      },
      {
        "id": "mfg-iso-1143-iso-1099",
        "priority": "P2",
        "code": "ISO 1143 / ISO 1099",
        "topicZh": "金属疲劳试验",
        "useZh": "疲劳与可靠性专题"
      },
      {
        "id": "mfg-astm-sae-din-材料标准",
        "priority": "P2",
        "code": "ASTM / SAE / DIN 材料标准",
        "topicZh": "材料牌号、热处理、表面处理",
        "useZh": "按行业案例外链，不作为主体系"
      }
    ]
  },
  {
    "id": "adopt",
    "kind": "adopt",
    "titleZh": "GB/T、DIN、JIS 等采用关系",
    "noteZh": "这一部分必须二次核验，不直接把“等同采用”写入正式文章。正式页面应写成“GB/T 版本与 ISO 版本存在采用关系或对应主题，使用前应确认企业图纸指定版本”。",
    "items": [
      {
        "id": "adopt-gb-t-4249",
        "priority": "待核验",
        "code": "GB/T 4249",
        "topicZh": "GPS 基本原则",
        "useZh": "对应 ISO 8015 方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-1182",
        "priority": "待核验",
        "code": "GB/T 1182",
        "topicZh": "几何公差标注",
        "useZh": "对应 ISO 1101 方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-17851",
        "priority": "待核验",
        "code": "GB/T 17851",
        "topicZh": "基准和基准体系",
        "useZh": "对应 ISO 5459 方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-16671",
        "priority": "待核验",
        "code": "GB/T 16671",
        "topicZh": "最大实体要求等",
        "useZh": "对应 ISO 2692 方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-1800-series",
        "priority": "待核验",
        "code": "GB/T 1800 series",
        "topicZh": "极限与配合",
        "useZh": "对应 ISO 286 方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-1804",
        "priority": "待核验",
        "code": "GB/T 1804",
        "topicZh": "一般公差",
        "useZh": "旧图纸常见，需核验与 ISO 2768 关系"
      },
      {
        "id": "adopt-gb-t-131",
        "priority": "待核验",
        "code": "GB/T 131",
        "topicZh": "表面结构表示法",
        "useZh": "对应表面纹理标注方向，需核验版次"
      },
      {
        "id": "adopt-gb-t-1031-3505-10610",
        "priority": "待核验",
        "code": "GB/T 1031 / 3505 / 10610",
        "topicZh": "表面粗糙度参数和评定",
        "useZh": "旧体系兼容，需核验现行状态"
      },
      {
        "id": "adopt-din-en-iso-1101",
        "priority": "待核验",
        "code": "DIN EN ISO 1101",
        "topicZh": "德国采用 ISO 1101",
        "useZh": "DIN/EN/ISO 采用关系导航"
      },
      {
        "id": "adopt-jis-b-0401-jis-b-0021-等",
        "priority": "待核验",
        "code": "JIS B 0401 / JIS B 0021 等",
        "topicZh": "日本尺寸公差/GD&T 体系",
        "useZh": "只作为行业对照候选"
      }
    ]
  },
  {
    "id": "first-batch",
    "kind": "batch",
    "titleZh": "建议建立的标准页第一批",
    "noteZh": "",
    "items": [
      {
        "id": "batch-iso-8015-2011",
        "code": "ISO 8015:2011",
        "topicZh": "GPS 基础原则",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-1101-2017",
        "code": "ISO 1101:2017",
        "topicZh": "几何公差符号语言",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-5459-2024",
        "code": "ISO 5459:2024",
        "topicZh": "基准与基准体系",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-2692-2021",
        "code": "ISO 2692:2021",
        "topicZh": "MMC/LMC/互惠要求",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-286-1-2-2010",
        "code": "ISO 286-1/2:2010",
        "topicZh": "极限与配合",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-14405-1-2025",
        "code": "ISO 14405-1:2025",
        "topicZh": "线性尺寸",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-14253-1-2017",
        "code": "ISO 14253-1:2017",
        "topicZh": "测量判定规则",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-jcgm-100-2008",
        "code": "JCGM 100:2008",
        "topicZh": "GUM",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-jcgm-200-2012",
        "code": "JCGM 200:2012",
        "topicZh": "VIM",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-asme-y14-5-2018",
        "code": "ASME Y14.5-2018",
        "topicZh": "ASME GD&T",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-asme-y14-5-1-2019",
        "code": "ASME Y14.5.1-2019",
        "topicZh": "GD&T 数学定义",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-16792-2021",
        "code": "ISO 16792:2021",
        "topicZh": "数字产品定义",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-10303-242-2025",
        "code": "ISO 10303-242:2025",
        "topicZh": "STEP AP242",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      },
      {
        "id": "batch-iso-21920-1-2-3-2021",
        "code": "ISO 21920-1/2/3:2021",
        "topicZh": "表面纹理轮廓法",
        "priority": "P0",
        "useZh": "建议优先建立标准导航页"
      }
    ]
  },
  {
    "id": "rules",
    "kind": "rules",
    "titleZh": "内容开发时的硬规则",
    "noteZh": "",
    "items": [
      {
        "textZh": "ISO GPS、ASME Y14.5、GB/T 采用版必须分字段存储，不能混写成“GD&T 都一样”。"
      },
      {
        "textZh": "只使用原创解释、图示、案例和合法外链，不复制标准全文、表格或受版权保护的图样。"
      },
      {
        "textZh": "任何数值表、配合表、螺纹表、抽样表、能力计算表都应跳转到 MechBox 或标准购买/企业规范，不在 Tolerance Hub 静态页输出完整替代表。"
      },
      {
        "textZh": "每篇标准页至少包含：适用范围、解决的问题、关键术语、与其他标准关系、常见误用、相关文章、相关案例、版本核验日期。"
      },
      {
        "textZh": "高风险主题必须显示：适用边界、标准体系差异、测量/制造限制、免责声明。"
      }
    ]
  },
  {
    "id": "drawings-ext",
    "kind": "standards",
    "titleZh": "工程图与文档体系补全",
    "noteZh": "",
    "items": [
      {
        "id": "drawings-ext-iso-128-1-2020",
        "priority": "P0",
        "code": "ISO 128-1:2020",
        "topicZh": "技术产品文件总则",
        "useZh": "图样语言总入口"
      },
      {
        "id": "drawings-ext-iso-128-2-2022",
        "priority": "P0",
        "code": "ISO 128-2:2022",
        "topicZh": "线型基础约定",
        "useZh": "线型、引出线、参考线"
      },
      {
        "id": "drawings-ext-iso-128-100-2020",
        "priority": "P1",
        "code": "ISO 128-100:2020",
        "topicZh": "ISO 128 索引",
        "useZh": "图样标准检索入口"
      },
      {
        "id": "drawings-ext-iso-129-1-2018",
        "priority": "P0",
        "code": "ISO 129-1:2018",
        "topicZh": "尺寸与公差标注总则",
        "useZh": "2D 标注基础"
      },
      {
        "id": "drawings-ext-iso-3098-1-2015",
        "priority": "P1",
        "code": "ISO 3098-1:2015",
        "topicZh": "字体总则",
        "useZh": "图样文字规范"
      },
      {
        "id": "drawings-ext-iso-3098-3-2000",
        "priority": "P1",
        "code": "ISO 3098-3:2000",
        "topicZh": "希腊字母",
        "useZh": "符号标注"
      },
      {
        "id": "drawings-ext-iso-3098-4-2000",
        "priority": "P1",
        "code": "ISO 3098-4:2000",
        "topicZh": "特殊和附加符号",
        "useZh": "图样注释"
      },
      {
        "id": "drawings-ext-iso-5455",
        "priority": "P1",
        "code": "ISO 5455",
        "topicZh": "比例",
        "useZh": "图样比例"
      },
      {
        "id": "drawings-ext-iso-5456-2-1996",
        "priority": "P1",
        "code": "ISO 5456-2:1996",
        "topicZh": "正投影表示",
        "useZh": "投影视图"
      },
      {
        "id": "drawings-ext-iso-5457-1999",
        "priority": "P1",
        "code": "ISO 5457:1999",
        "topicZh": "图纸幅面与布局",
        "useZh": "图框、版式"
      },
      {
        "id": "drawings-ext-iso-7200-2004",
        "priority": "P1",
        "code": "ISO 7200:2004",
        "topicZh": "标题栏与图纸头栏数据字段",
        "useZh": "图纸元数据"
      },
      {
        "id": "drawings-ext-iso-7573-2008",
        "priority": "P1",
        "code": "ISO 7573:2008",
        "topicZh": "零件明细表",
        "useZh": "BOM、件号、维护信息"
      },
      {
        "id": "drawings-ext-iso-6433",
        "priority": "P2",
        "code": "ISO 6433",
        "topicZh": "零件编号",
        "useZh": "装配图标识"
      },
      {
        "id": "drawings-ext-iso-7083",
        "priority": "P2",
        "code": "ISO 7083",
        "topicZh": "图样符号比例",
        "useZh": "符号尺寸比例与一致性"
      },
      {
        "id": "drawings-ext-asme-y14-1",
        "priority": "P0",
        "code": "ASME Y14.1",
        "topicZh": "图纸格式与图幅",
        "useZh": "ASME 图样基础"
      },
      {
        "id": "drawings-ext-asme-y14-2",
        "priority": "P0",
        "code": "ASME Y14.2",
        "topicZh": "线型与字母",
        "useZh": "制图规范"
      },
      {
        "id": "drawings-ext-asme-y14-3",
        "priority": "P0",
        "code": "ASME Y14.3",
        "topicZh": "正投影与立体图",
        "useZh": "视图表达"
      },
      {
        "id": "drawings-ext-asme-y14-24-2020",
        "priority": "P0",
        "code": "ASME Y14.24-2020",
        "topicZh": "工程图类型和应用",
        "useZh": "图样类型入口"
      },
      {
        "id": "drawings-ext-asme-y14-34",
        "priority": "P1",
        "code": "ASME Y14.34",
        "topicZh": "相关清单",
        "useZh": "BOM 关系"
      },
      {
        "id": "drawings-ext-asme-y14-35-2025",
        "priority": "P1",
        "code": "ASME Y14.35-2025",
        "topicZh": "修订与变更",
        "useZh": "ECR/ECN、版本记录"
      },
      {
        "id": "drawings-ext-asme-y14-36-2018",
        "priority": "P1",
        "code": "ASME Y14.36-2018",
        "topicZh": "表面纹理符号",
        "useZh": "ASME 粗糙度标注"
      },
      {
        "id": "drawings-ext-asme-y14-38-2019",
        "priority": "P1",
        "code": "ASME Y14.38-2019",
        "topicZh": "缩写与首字母缩略词",
        "useZh": "图样术语一致性"
      },
      {
        "id": "drawings-ext-asme-y14-45-2021",
        "priority": "P1",
        "code": "ASME Y14.45-2021",
        "topicZh": "测量数据报告",
        "useZh": "数据回传、检验报告"
      },
      {
        "id": "drawings-ext-asme-y14-46-2022",
        "priority": "P0",
        "code": "ASME Y14.46-2022",
        "topicZh": "增材制造产品定义",
        "useZh": "AM 产品定义"
      },
      {
        "id": "drawings-ext-asme-y14-47-2023",
        "priority": "P0",
        "code": "ASME Y14.47-2023",
        "topicZh": "模型组织实践",
        "useZh": "MBD 数据组织"
      },
      {
        "id": "drawings-ext-asme-y14-48",
        "priority": "P1",
        "code": "ASME Y14.48",
        "topicZh": "通用方向与载荷指示",
        "useZh": "观察中条目"
      },
      {
        "id": "drawings-ext-asme-y14-49-2025",
        "priority": "P1",
        "code": "ASME Y14.49-2025",
        "topicZh": "补充尺寸与公差规格",
        "useZh": "ASME 补充规则"
      }
    ]
  },
  {
    "id": "metrology-ext",
    "kind": "standards",
    "titleZh": "测量、量具、CMM 与实验室能力补全",
    "noteZh": "",
    "items": [
      {
        "id": "metrology-ext-iso-3650-1998",
        "priority": "P0",
        "code": "ISO 3650:1998",
        "topicZh": "量块",
        "useZh": "长度基准、校准链"
      },
      {
        "id": "metrology-ext-iso-17025-2017",
        "priority": "P0",
        "code": "ISO 17025:2017",
        "topicZh": "检测和校准实验室能力",
        "useZh": "实验室、报告、溯源"
      },
      {
        "id": "metrology-ext-iso-10012-2003",
        "priority": "P0",
        "code": "ISO 10012:2003",
        "topicZh": "测量管理体系",
        "useZh": "企业测量过程管理"
      },
      {
        "id": "metrology-ext-iso-10360-series",
        "priority": "P0",
        "code": "ISO 10360 series",
        "topicZh": "CMM/CMS 验收与复验总族",
        "useZh": "坐标测量系统主入口"
      },
      {
        "id": "metrology-ext-iso-10360-2-2009",
        "priority": "P0",
        "code": "ISO 10360-2:2009",
        "topicZh": "CMM 线性尺寸验收/复验",
        "useZh": "CMM 核心验收"
      },
      {
        "id": "metrology-ext-iso-10360-3-2000",
        "priority": "P1",
        "code": "ISO 10360-3:2000",
        "topicZh": "带转台轴的 CMM",
        "useZh": "特殊 CMM 架构"
      },
      {
        "id": "metrology-ext-iso-10360-5-2020",
        "priority": "P1",
        "code": "ISO 10360-5:2020",
        "topicZh": "接触式探针单/多测针",
        "useZh": "扫描与离散点模式"
      },
      {
        "id": "metrology-ext-iso-10360-7-2011",
        "priority": "P1",
        "code": "ISO 10360-7:2011",
        "topicZh": "成像探测系统",
        "useZh": "视觉测头专题"
      },
      {
        "id": "metrology-ext-iso-10360-8-2013",
        "priority": "P1",
        "code": "ISO 10360-8:2013",
        "topicZh": "光学距离传感器",
        "useZh": "光学测量专题"
      },
      {
        "id": "metrology-ext-iso-10360-9-2013",
        "priority": "P1",
        "code": "ISO 10360-9:2013",
        "topicZh": "多探头系统",
        "useZh": "多探头 CMS"
      },
      {
        "id": "metrology-ext-iso-10360-10-2021",
        "priority": "P1",
        "code": "ISO 10360-10:2021",
        "topicZh": "激光跟踪仪",
        "useZh": "大尺寸测量专题"
      },
      {
        "id": "metrology-ext-iso-10360-12-2016",
        "priority": "P1",
        "code": "ISO 10360-12:2016",
        "topicZh": "关节臂 CMM",
        "useZh": "便携式 CMM 专题"
      },
      {
        "id": "metrology-ext-iso-10360-13-2021",
        "priority": "P1",
        "code": "ISO 10360-13:2021",
        "topicZh": "光学 3D CMS",
        "useZh": "视觉 3D 测量"
      },
      {
        "id": "metrology-ext-iso-10360-102-2026",
        "priority": "P1",
        "code": "ISO 10360-102:2026",
        "topicZh": "CMS 符号语法",
        "useZh": "新一代符号规范"
      },
      {
        "id": "metrology-ext-iso-13385-1-2019",
        "priority": "P1",
        "code": "ISO 13385-1:2019",
        "topicZh": "卡尺",
        "useZh": "量具专题"
      },
      {
        "id": "metrology-ext-iso-13385-2-2020",
        "priority": "P1",
        "code": "ISO 13385-2:2020",
        "topicZh": "卡尺深度尺",
        "useZh": "量具专题"
      },
      {
        "id": "metrology-ext-iso-3611-2023",
        "priority": "P1",
        "code": "ISO 3611:2023",
        "topicZh": "外径千分尺",
        "useZh": "量具专题"
      },
      {
        "id": "metrology-ext-iso-463-2006",
        "priority": "P1",
        "code": "ISO 463:2006",
        "topicZh": "机械指示表",
        "useZh": "指示表专题"
      },
      {
        "id": "metrology-ext-iso-9493-2010",
        "priority": "P1",
        "code": "ISO 9493:2010",
        "topicZh": "杠杆式指示表",
        "useZh": "指示表专题"
      },
      {
        "id": "metrology-ext-iso-13102-2012",
        "priority": "P1",
        "code": "ISO 13102:2012",
        "topicZh": "电子数字指示表",
        "useZh": "指示表专题"
      },
      {
        "id": "metrology-ext-iso-13225-2012",
        "priority": "P1",
        "code": "ISO 13225:2012",
        "topicZh": "高度规",
        "useZh": "高度测量专题"
      },
      {
        "id": "metrology-ext-iso-8512-1-2-1990",
        "priority": "P1",
        "code": "ISO 8512-1/2:1990",
        "topicZh": "平台/花岗石平板",
        "useZh": "基础检定平面"
      },
      {
        "id": "metrology-ext-iso-14253-1-2017",
        "priority": "P0",
        "code": "ISO 14253-1:2017",
        "topicZh": "测量判定规则",
        "useZh": "合格判定"
      },
      {
        "id": "metrology-ext-iso-14253-2-2011",
        "priority": "P0",
        "code": "ISO 14253-2:2011",
        "topicZh": "测量不确定度指南",
        "useZh": "不确定度链"
      },
      {
        "id": "metrology-ext-iso-14253-5-2015",
        "priority": "P1",
        "code": "ISO 14253-5:2015",
        "topicZh": "指示测量仪器验证",
        "useZh": "量具验证"
      },
      {
        "id": "metrology-ext-iso-14978-2018",
        "priority": "P1",
        "code": "ISO 14978:2018",
        "topicZh": "GPS 测量设备通用概念",
        "useZh": "设备分类、计量特性"
      },
      {
        "id": "metrology-ext-iso-ts-15530-1-2013",
        "priority": "P0",
        "code": "ISO/TS 15530-1:2013",
        "topicZh": "CMM 不确定度概览",
        "useZh": "CMM 不确定度体系入口"
      },
      {
        "id": "metrology-ext-iso-15530-2-2026",
        "priority": "P0",
        "code": "ISO 15530-2:2026",
        "topicZh": "CMM 不确定度 - 多姿态和标准件",
        "useZh": "CMM 高级不确定度"
      },
      {
        "id": "metrology-ext-iso-15530-3-2011",
        "priority": "P0",
        "code": "ISO 15530-3:2011",
        "topicZh": "CMM 不确定度 - 校准工件",
        "useZh": "CMM 经典路径"
      },
      {
        "id": "metrology-ext-iso-ts-15530-4-2008",
        "priority": "P0",
        "code": "ISO/TS 15530-4:2008",
        "topicZh": "CMM 不确定度 - 仿真",
        "useZh": "仿真不确定度"
      },
      {
        "id": "metrology-ext-iso-iec-17025-2017",
        "priority": "P1",
        "code": "ISO/IEC 17025:2017",
        "topicZh": "检测实验室能力",
        "useZh": "计量机构与校准实验室"
      },
      {
        "id": "metrology-ext-jcgm-101-2008",
        "priority": "P1",
        "code": "JCGM 101:2008",
        "topicZh": "Monte Carlo 不确定度传播",
        "useZh": "高级不确定度传播"
      },
      {
        "id": "metrology-ext-jcgm-106-2012",
        "priority": "P1",
        "code": "JCGM 106:2012",
        "topicZh": "符合性评定中的不确定度作用",
        "useZh": "保护带与判定风险"
      },
      {
        "id": "metrology-ext-asme-b89-series",
        "priority": "P2",
        "code": "ASME B89 series",
        "topicZh": "尺寸计量标准族",
        "useZh": "美标计量导航"
      },
      {
        "id": "metrology-ext-asme-b89-7-series",
        "priority": "P2",
        "code": "ASME B89.7 series",
        "topicZh": "测量不确定度与判定",
        "useZh": "美标判定规则"
      },
      {
        "id": "metrology-ext-nist-sematech-handbook",
        "priority": "P2",
        "code": "NIST/SEMATECH Handbook",
        "topicZh": "工程统计与测量过程",
        "useZh": "教学与方法参考"
      }
    ]
  },
  {
    "id": "surface-ext",
    "kind": "standards",
    "titleZh": "表面纹理、焊接、铸件、NDT 与增材",
    "noteZh": "",
    "items": [
      {
        "id": "surface-ext-iso-21920-1-2021",
        "priority": "P0",
        "code": "ISO 21920-1:2021",
        "topicZh": "表面纹理标注",
        "useZh": "粗糙度标注"
      },
      {
        "id": "surface-ext-iso-21920-2-2021",
        "priority": "P0",
        "code": "ISO 21920-2:2021",
        "topicZh": "表面纹理术语和参数",
        "useZh": "Ra/Rz 等"
      },
      {
        "id": "surface-ext-iso-21920-3-2021",
        "priority": "P0",
        "code": "ISO 21920-3:2021",
        "topicZh": "表面纹理规格操作符",
        "useZh": "过滤与评价"
      },
      {
        "id": "surface-ext-iso-25178-series",
        "priority": "P1",
        "code": "ISO 25178 series",
        "topicZh": "面域表面纹理",
        "useZh": "3D 表面纹理"
      },
      {
        "id": "surface-ext-iso-16610-series",
        "priority": "P1",
        "code": "ISO 16610 series",
        "topicZh": "滤波",
        "useZh": "形状/波纹度/粗糙度分离"
      },
      {
        "id": "surface-ext-iso-4287-iso-4288",
        "priority": "P1",
        "code": "ISO 4287 / ISO 4288",
        "topicZh": "旧版轮廓法表面纹理",
        "useZh": "兼容旧图纸"
      },
      {
        "id": "surface-ext-iso-1302-2002",
        "priority": "P1",
        "code": "ISO 1302:2002",
        "topicZh": "旧版表面纹理标注",
        "useZh": "历史图纸识读"
      },
      {
        "id": "surface-ext-asme-y14-36-2018",
        "priority": "P2",
        "code": "ASME Y14.36-2018",
        "topicZh": "表面纹理符号",
        "useZh": "ASME 表面标注"
      },
      {
        "id": "surface-ext-iso-2553",
        "priority": "P1",
        "code": "ISO 2553",
        "topicZh": "焊接符号",
        "useZh": "焊缝表达"
      },
      {
        "id": "surface-ext-iso-5817",
        "priority": "P1",
        "code": "ISO 5817",
        "topicZh": "焊缝质量等级",
        "useZh": "焊缝验收"
      },
      {
        "id": "surface-ext-iso-3834-series",
        "priority": "P1",
        "code": "ISO 3834 series",
        "topicZh": "焊接质量要求",
        "useZh": "制造过程控制"
      },
      {
        "id": "surface-ext-iso-15614-series",
        "priority": "P1",
        "code": "ISO 15614 series",
        "topicZh": "焊接工艺评定",
        "useZh": "工艺验证"
      },
      {
        "id": "surface-ext-iso-9606-series",
        "priority": "P1",
        "code": "ISO 9606 series",
        "topicZh": "焊工资格考核",
        "useZh": "人员能力"
      },
      {
        "id": "surface-ext-iso-17635",
        "priority": "P1",
        "code": "ISO 17635",
        "topicZh": "焊缝无损检测总则",
        "useZh": "NDT 入口"
      },
      {
        "id": "surface-ext-iso-17636",
        "priority": "P1",
        "code": "ISO 17636",
        "topicZh": "焊缝射线检测",
        "useZh": "RT 专题"
      },
      {
        "id": "surface-ext-iso-17637",
        "priority": "P1",
        "code": "ISO 17637",
        "topicZh": "焊缝目视检测",
        "useZh": "VT 专题"
      },
      {
        "id": "surface-ext-iso-17640",
        "priority": "P1",
        "code": "ISO 17640",
        "topicZh": "焊缝超声检测",
        "useZh": "UT 专题"
      },
      {
        "id": "surface-ext-iso-17638",
        "priority": "P1",
        "code": "ISO 17638",
        "topicZh": "焊缝磁粉检测",
        "useZh": "MT 专题"
      },
      {
        "id": "surface-ext-iso-3452-series",
        "priority": "P1",
        "code": "ISO 3452 series",
        "topicZh": "渗透检测",
        "useZh": "PT 专题"
      },
      {
        "id": "surface-ext-iso-9712-2021",
        "priority": "P0",
        "code": "ISO 9712:2021",
        "topicZh": "NDT 人员资格认证",
        "useZh": "无损检测资格"
      },
      {
        "id": "surface-ext-iso-8062-series",
        "priority": "P1",
        "code": "ISO 8062 series",
        "topicZh": "铸件公差与余量",
        "useZh": "铸造件专题"
      },
      {
        "id": "surface-ext-iso-13920",
        "priority": "P1",
        "code": "ISO 13920",
        "topicZh": "焊接结构一般公差",
        "useZh": "焊接件专题"
      },
      {
        "id": "surface-ext-asme-y14-8-2009",
        "priority": "P1",
        "code": "ASME Y14.8-2009",
        "topicZh": "铸件、锻件和模制件",
        "useZh": "ASME 铸锻件表达"
      },
      {
        "id": "surface-ext-asme-y14-37-2019",
        "priority": "P0",
        "code": "ASME Y14.37-2019",
        "topicZh": "复合材料零件定义",
        "useZh": "复材专题"
      },
      {
        "id": "surface-ext-asme-y14-46-2022",
        "priority": "P0",
        "code": "ASME Y14.46-2022",
        "topicZh": "增材制造产品定义",
        "useZh": "增材专题"
      },
      {
        "id": "surface-ext-iso-astm-52900-series",
        "priority": "P1",
        "code": "ISO/ASTM 52900 series",
        "topicZh": "增材制造术语与一般原则",
        "useZh": "AM 基础与术语"
      }
    ]
  },
  {
    "id": "quality-ext",
    "kind": "standards",
    "titleZh": "质量统计、抽样、能力、风险与改进",
    "noteZh": "",
    "items": [
      {
        "id": "quality-ext-iso-22514-series",
        "priority": "P0",
        "code": "ISO 22514 series",
        "topicZh": "过程能力与性能",
        "useZh": "Cp/Cpk/Pp/Ppk"
      },
      {
        "id": "quality-ext-iso-2859-series",
        "priority": "P0",
        "code": "ISO 2859 series",
        "topicZh": "属性抽样检验",
        "useZh": "抽样规则"
      },
      {
        "id": "quality-ext-iso-3951-series",
        "priority": "P0",
        "code": "ISO 3951 series",
        "topicZh": "计量抽样检验",
        "useZh": "计量型抽样"
      },
      {
        "id": "quality-ext-iso-7870-series",
        "priority": "P0",
        "code": "ISO 7870 series",
        "topicZh": "控制图",
        "useZh": "SPC"
      },
      {
        "id": "quality-ext-iso-21747-2006",
        "priority": "P1",
        "code": "ISO 21747:2006",
        "topicZh": "过程性能和能力统计",
        "useZh": "能力解释"
      },
      {
        "id": "quality-ext-iso-3534-series",
        "priority": "P1",
        "code": "ISO 3534 series",
        "topicZh": "统计词汇和符号",
        "useZh": "统计术语"
      },
      {
        "id": "quality-ext-iso-5725-series",
        "priority": "P1",
        "code": "ISO 5725 series",
        "topicZh": "测量方法准确度",
        "useZh": "重复性、再现性"
      },
      {
        "id": "quality-ext-iso-31000-2018",
        "priority": "P1",
        "code": "ISO 31000:2018",
        "topicZh": "风险管理",
        "useZh": "风险框架"
      },
      {
        "id": "quality-ext-iso-19011-2018",
        "priority": "P1",
        "code": "ISO 19011:2018",
        "topicZh": "管理体系审核指南",
        "useZh": "审核与追溯"
      },
      {
        "id": "quality-ext-iso-9001-2015",
        "priority": "P1",
        "code": "ISO 9001:2015",
        "topicZh": "质量管理体系",
        "useZh": "质量体系基础"
      },
      {
        "id": "quality-ext-iatf-16949-2016",
        "priority": "P1",
        "code": "IATF 16949:2016",
        "topicZh": "汽车质量管理体系",
        "useZh": "汽车行业扩展"
      },
      {
        "id": "quality-ext-aiag-apqp",
        "priority": "P1",
        "code": "AIAG APQP",
        "topicZh": "产品质量先期策划",
        "useZh": "项目质量策划"
      },
      {
        "id": "quality-ext-aiag-ppap",
        "priority": "P1",
        "code": "AIAG PPAP",
        "topicZh": "生产件批准程序",
        "useZh": "证据链"
      },
      {
        "id": "quality-ext-aiag-msa",
        "priority": "P1",
        "code": "AIAG MSA",
        "topicZh": "测量系统分析",
        "useZh": "GR&R、偏倚、线性、稳定性"
      },
      {
        "id": "quality-ext-aiag-spc",
        "priority": "P1",
        "code": "AIAG SPC",
        "topicZh": "统计过程控制",
        "useZh": "控制图、能力"
      },
      {
        "id": "quality-ext-aiag-vda-fmea",
        "priority": "P1",
        "code": "AIAG-VDA FMEA",
        "topicZh": "失效模式与影响分析",
        "useZh": "风险分解"
      },
      {
        "id": "quality-ext-vda-2-vda-5",
        "priority": "P2",
        "code": "VDA 2 / VDA 5",
        "topicZh": "生产件批准与测量能力",
        "useZh": "德系汽车扩展"
      }
    ]
  },
  {
    "id": "parts-ext",
    "kind": "standards",
    "titleZh": "材料、紧固件、轴承、密封与环境试验",
    "noteZh": "",
    "items": [
      {
        "id": "parts-ext-iso-68-1",
        "priority": "P0",
        "code": "ISO 68-1",
        "topicZh": "ISO 普通螺纹基本牙型",
        "useZh": "螺纹基础"
      },
      {
        "id": "parts-ext-iso-261-iso-262",
        "priority": "P0",
        "code": "ISO 261 / ISO 262",
        "topicZh": "螺纹直径与螺距系列",
        "useZh": "螺纹选型"
      },
      {
        "id": "parts-ext-iso-724",
        "priority": "P0",
        "code": "ISO 724",
        "topicZh": "螺纹基本尺寸",
        "useZh": "螺纹尺寸"
      },
      {
        "id": "parts-ext-iso-965-series",
        "priority": "P0",
        "code": "ISO 965 series",
        "topicZh": "螺纹公差",
        "useZh": "螺纹配合"
      },
      {
        "id": "parts-ext-iso-1502-1996",
        "priority": "P1",
        "code": "ISO 1502:1996",
        "topicZh": "螺纹量规",
        "useZh": "检验链"
      },
      {
        "id": "parts-ext-iso-4014-4017",
        "priority": "P1",
        "code": "ISO 4014 / 4017",
        "topicZh": "六角头螺栓",
        "useZh": "常用紧固件"
      },
      {
        "id": "parts-ext-iso-4032",
        "priority": "P1",
        "code": "ISO 4032",
        "topicZh": "六角螺母",
        "useZh": "常用紧固件"
      },
      {
        "id": "parts-ext-iso-4762",
        "priority": "P1",
        "code": "ISO 4762",
        "topicZh": "内六角圆柱头螺钉",
        "useZh": "常用紧固件"
      },
      {
        "id": "parts-ext-iso-7089",
        "priority": "P1",
        "code": "ISO 7089",
        "topicZh": "平垫圈",
        "useZh": "常用紧固件配套"
      },
      {
        "id": "parts-ext-iso-8734-8735",
        "priority": "P1",
        "code": "ISO 8734 / 8735",
        "topicZh": "圆柱销",
        "useZh": "定位与装配"
      },
      {
        "id": "parts-ext-iso-492",
        "priority": "P1",
        "code": "ISO 492",
        "topicZh": "滚动轴承公差",
        "useZh": "轴承尺寸精度"
      },
      {
        "id": "parts-ext-iso-76",
        "priority": "P1",
        "code": "ISO 76",
        "topicZh": "静额定负荷",
        "useZh": "轴承负载"
      },
      {
        "id": "parts-ext-iso-281",
        "priority": "P1",
        "code": "ISO 281",
        "topicZh": "额定寿命",
        "useZh": "轴承寿命"
      },
      {
        "id": "parts-ext-iso-5753",
        "priority": "P1",
        "code": "ISO 5753",
        "topicZh": "内部游隙",
        "useZh": "轴承装配"
      },
      {
        "id": "parts-ext-iso-6194-series",
        "priority": "P1",
        "code": "ISO 6194 series",
        "topicZh": "旋转轴唇形密封",
        "useZh": "密封件专题"
      },
      {
        "id": "parts-ext-iso-6506-6507-6508",
        "priority": "P1",
        "code": "ISO 6506 / 6507 / 6508",
        "topicZh": "硬度试验",
        "useZh": "材料与热处理"
      },
      {
        "id": "parts-ext-iso-6892-1",
        "priority": "P1",
        "code": "ISO 6892-1",
        "topicZh": "金属拉伸试验",
        "useZh": "材料性能"
      },
      {
        "id": "parts-ext-iso-9227",
        "priority": "P2",
        "code": "ISO 9227",
        "topicZh": "盐雾试验",
        "useZh": "腐蚀验证"
      },
      {
        "id": "parts-ext-iso-1461",
        "priority": "P2",
        "code": "ISO 1461",
        "topicZh": "热浸镀锌涂层",
        "useZh": "表面防护"
      },
      {
        "id": "parts-ext-iso-12944-series",
        "priority": "P2",
        "code": "ISO 12944 series",
        "topicZh": "涂料防腐体系",
        "useZh": "腐蚀防护"
      },
      {
        "id": "parts-ext-iso-527-series",
        "priority": "P2",
        "code": "ISO 527 series",
        "topicZh": "塑料拉伸性能",
        "useZh": "塑料件专题"
      },
      {
        "id": "parts-ext-iso-178",
        "priority": "P2",
        "code": "ISO 178",
        "topicZh": "塑料弯曲性能",
        "useZh": "塑料件专题"
      },
      {
        "id": "parts-ext-iso-179-180",
        "priority": "P2",
        "code": "ISO 179 / 180",
        "topicZh": "塑料冲击性能",
        "useZh": "塑料件专题"
      },
      {
        "id": "parts-ext-iso-12107",
        "priority": "P2",
        "code": "ISO 12107",
        "topicZh": "疲劳试验数据统计分析",
        "useZh": "疲劳与可靠性"
      },
      {
        "id": "parts-ext-iso-16750-series",
        "priority": "P2",
        "code": "ISO 16750 series",
        "topicZh": "道路车辆电气电子环境条件",
        "useZh": "汽车环境验证"
      }
    ]
  },
  {
    "id": "legacy",
    "kind": "legacy",
    "titleZh": "旧版、采用版与待核验映射",
    "noteZh": "这一部分只做“导航”和“兼容”，不作为正式正文的唯一依据。",
    "items": [
      {
        "id": "legacy-gps-基础原则",
        "topicZh": "GPS 基础原则",
        "legacyZh": "ISO 8015:2011",
        "currentZh": "ISO 8015:2011",
        "noteZh": "目前仍是常用引用入口",
        "priority": "待核验",
        "code": "ISO 8015:2011",
        "useZh": "目前仍是常用引用入口"
      },
      {
        "id": "legacy-基准体系",
        "topicZh": "基准体系",
        "legacyZh": "ISO 5459:2011",
        "currentZh": "ISO 5459:2024",
        "noteZh": "旧图纸需确认版次",
        "priority": "待核验",
        "code": "ISO 5459:2024",
        "useZh": "旧图纸需确认版次"
      },
      {
        "id": "legacy-线性尺寸",
        "topicZh": "线性尺寸",
        "legacyZh": "ISO 14405-1:2016",
        "currentZh": "ISO 14405-1:2025",
        "noteZh": "线性尺寸解释已更新",
        "priority": "待核验",
        "code": "ISO 14405-1:2025",
        "useZh": "线性尺寸解释已更新"
      },
      {
        "id": "legacy-表面纹理标注",
        "topicZh": "表面纹理标注",
        "legacyZh": "ISO 1302:2002",
        "currentZh": "ISO 21920-1:2021",
        "noteZh": "旧图纸兼容时使用",
        "priority": "待核验",
        "code": "ISO 21920-1:2021",
        "useZh": "旧图纸兼容时使用"
      },
      {
        "id": "legacy-表面纹理参数",
        "topicZh": "表面纹理参数",
        "legacyZh": "ISO 4287 / ISO 4288",
        "currentZh": "ISO 21920-2/3:2021",
        "noteZh": "轮廓法新体系",
        "priority": "待核验",
        "code": "ISO 21920-2/3:2021",
        "useZh": "轮廓法新体系"
      },
      {
        "id": "legacy-量块",
        "topicZh": "量块",
        "legacyZh": "ISO 3650:1978",
        "currentZh": "ISO 3650:1998",
        "noteZh": "旧版已废止",
        "priority": "待核验",
        "code": "ISO 3650:1998",
        "useZh": "旧版已废止"
      },
      {
        "id": "legacy-ndt-人员资格",
        "topicZh": "NDT 人员资格",
        "legacyZh": "ISO 9712:2012",
        "currentZh": "ISO 9712:2021",
        "noteZh": "旧版已废止",
        "priority": "待核验",
        "code": "ISO 9712:2021",
        "useZh": "旧版已废止"
      },
      {
        "id": "legacy-step-ap242",
        "topicZh": "STEP AP242",
        "legacyZh": "ISO 10303-242:2022",
        "currentZh": "ISO 10303-242:2025",
        "noteZh": "新版已发布",
        "priority": "待核验",
        "code": "ISO 10303-242:2025",
        "useZh": "新版已发布"
      },
      {
        "id": "legacy-asme-数字定义",
        "topicZh": "ASME 数字定义",
        "legacyZh": "Y14.41-2019",
        "currentZh": "Y14.41-2026",
        "noteZh": "需按采购/企业版核对",
        "priority": "待核验",
        "code": "Y14.41-2026",
        "useZh": "需按采购/企业版核对"
      },
      {
        "id": "legacy-图样标题栏",
        "topicZh": "图样标题栏",
        "legacyZh": "ISO 7200:1984",
        "currentZh": "ISO 7200:2004",
        "noteZh": "旧版已废止",
        "priority": "待核验",
        "code": "ISO 7200:2004",
        "useZh": "旧版已废止"
      }
    ]
  }
]

export function listAllStandards() {
  return STANDARDS_CATALOG_SECTIONS.flatMap((sec) => {
    if (sec.kind === 'priority' || sec.kind === 'rules') return []
    return sec.items.map((it) => ({
      ...it,
      sectionId: sec.id,
      sectionTitleZh: sec.titleZh,
      kind: sec.kind,
    }))
  })
}

export function searchStandardsCatalog({ query = '', priority = 'all', sectionId = 'all' } = {}) {
  const q = String(query).trim().toLowerCase()
  return listAllStandards().filter((it) => {
    if (priority !== 'all' && it.priority !== priority) return false
    if (sectionId !== 'all' && it.sectionId !== sectionId) return false
    if (!q) return true
    const hay = [it.code, it.topicZh, it.useZh, it.legacyZh, it.currentZh, it.noteZh, it.sectionTitleZh]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function countByPriority() {
  const all = listAllStandards()
  const map = { P0: 0, P1: 0, P2: 0, 待核验: 0, other: 0 }
  for (const it of all) {
    if (map[it.priority] != null) map[it.priority] += 1
    else map.other += 1
  }
  return { ...map, total: all.length }
}
