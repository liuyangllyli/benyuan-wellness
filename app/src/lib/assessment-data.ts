/**
 * 测评题目与选项数据（中医体质 67 题），来源：app/docs/中医体质测评题目.csv
 * 用户端只展示：题目编号、题目、选项（单选题）；选择时后台记录基础得分 1～5
 */

export interface ConstitutionOption {
  text: string
  baseScore: number
}

export interface ConstitutionQuestion {
  id: string
  constitutionType: string
  title: string
  options: ConstitutionOption[]
}

const FIVE_OPTIONS: ConstitutionOption[] = [
  { text: '没有(根本不)', baseScore: 1 },
  { text: '很少(有一点)', baseScore: 2 },
  { text: '有时(有些)', baseScore: 3 },
  { text: '经常(相当)', baseScore: 4 },
  { text: '总是(非常)', baseScore: 5 },
]

function q(id: string, type: string, title: string): ConstitutionQuestion {
  return { id, constitutionType: type, title, options: FIVE_OPTIONS }
}

export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  q('1', '阳虚质', '您手脚发凉吗？'),
  q('2', '阳虚质', '您胃脘部、背部或腰膝部怕冷吗？'),
  q('3', '阳虚质', '您感到怕冷、衣服比别人穿得多吗？'),
  q('4', '阳虚质', '您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？'),
  q('5', '阳虚质', '您比别人容易患感冒吗？'),
  q('6', '阳虚质', '您吃（喝）凉的东西会感到不舒服或者怕吃（喝）凉的东西吗？'),
  q('7', '阳虚质', '您受凉或吃（喝）凉的东西后，容易腹泻（拉肚子）吗？'),
  q('8', '阴虚质', '您感到手脚心发热吗？'),
  q('9', '阴虚质', '您感觉身体、脸上发热吗？'),
  q('10', '阴虚质', '您皮肤或口唇干吗？'),
  q('11', '阴虚质', '您口唇的颜色比一般人红吗？'),
  q('12', '阴虚质', '您容易便秘或大便干燥吗？'),
  q('13', '阴虚质', '您面部两颧潮红或偏红吗？'),
  q('14', '阴虚质', '您感到眼睛干涩吗？'),
  q('15', '阴虚质', '您感到口干咽燥、总想喝水吗？'),
  q('16', '气虚质', '您容易疲乏吗？'),
  q('17', '气虚质', '您容易气短（呼吸短促，接不上气）吗？'),
  q('18', '气虚质', '您容易心慌吗？'),
  q('19', '气虚质', '您容易头晕或站起时晕眩吗？'),
  q('20', '气虚质', '您比别人容易患感冒吗？'),
  q('21', '气虚质', '您喜欢安静、懒得说话吗？'),
  q('22', '气虚质', '您说话声音低弱无力吗？'),
  q('23', '气虚质', '您活动量稍大就容易出虚汗吗？'),
  q('24', '痰湿质', '您感到胸闷或腹部胀满吗？'),
  q('25', '痰湿质', '您感到身体沉重不轻松或不爽快吗？'),
  q('26', '痰湿质', '您腹部肥满松软吗？'),
  q('27', '痰湿质', '您有额部油脂分泌多的现象吗？'),
  q('28', '痰湿质', '您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？'),
  q('29', '痰湿质', '您嘴里有黏黏的感觉吗？'),
  q('30', '痰湿质', '您平时痰多，特别是咽喉部总感到有痰堵着吗？'),
  q('31', '痰湿质', '您舌苔厚腻或有舌苔厚厚的感觉吗？'),
  q('32', '湿热质', '您面部或者鼻部有油腻感或者油亮发光吗？'),
  q('33', '湿热质', '你容易生痤疮或疮疖吗？'),
  q('34', '湿热质', '您感到口苦或嘴里有异味吗？'),
  q('35', '湿热质', '您大便黏腻不爽、有解不尽的感觉吗？'),
  q('36', '湿热质', '您小便时尿道有发热感、尿色浓（深）吗？'),
  q('37', '湿热质', '您带下色黄（白带颜色发黄）吗？（限女性回答）'),
  q('38', '湿热质', '您的阴囊部位潮湿吗？（限男性回答）'),
  q('39', '血瘀质', '您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？'),
  q('40', '血瘀质', '您两颧部有细微红丝吗？'),
  q('41', '血瘀质', '您身体上有哪里疼痛吗？'),
  q('42', '血瘀质', '您面色晦黯或容易出现褐斑吗？'),
  q('43', '血瘀质', '您容易有黑眼圈吗？'),
  q('44', '血瘀质', '您容易忘事（健忘）吗？'),
  q('45', '血瘀质', '您口唇颜色偏黯吗？'),
  q('46', '特禀质', '您没有感冒时也会打喷嚏吗？'),
  q('47', '特禀质', '您没有感冒时也会鼻塞、流鼻涕吗？'),
  q('48', '特禀质', '您有因季节变化、温度变化或异味等原因而咳喘的现象吗？'),
  q('49', '特禀质', '您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？'),
  q('50', '特禀质', '您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？'),
  q('51', '特禀质', '您的皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？'),
  q('52', '特禀质', '您的皮肤一抓就红，并出现抓痕吗？'),
  q('53', '气郁质', '您感到闷闷不乐、情绪低沉吗？'),
  q('54', '气郁质', '您容易精神紧张、焦虑不安吗？'),
  q('55', '气郁质', '您多愁善感、感情脆弱吗？'),
  q('56', '气郁质', '您容易感到害怕或受到惊吓吗？'),
  q('57', '气郁质', '您胁肋部或乳房胀痛吗？'),
  q('58', '气郁质', '您无缘无故叹气吗？'),
  q('59', '气郁质', '您咽喉部有异物感，且吐之不出、咽之不下吗？'),
  q('60', '平和质', '您精力充沛吗？'),
  q('61', '平和质', '您容易疲乏吗？*'),
  q('62', '平和质', '您说话声音低弱无力吗？*'),
  q('63', '平和质', '您感到闷闷不乐、情绪低沉吗？*'),
  q('64', '平和质', '您比一般 人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？*'),
  q('65', '平和质', '您能适应外界自然和社会环境的变化吗？'),
  q('66', '平和质', '您容易失眠吗？*'),
  q('67', '平和质', '您容易忘事（健忘）吗？*'),
]

export interface BodyQuestion {
  id: number | string
  title: string
  options: { text: string; value?: string | number }[]
}

/** 身体测评题 4-19 使用下方专用结构，BODY_QUESTIONS 保留作兼容 */
export const BODY_QUESTIONS: BodyQuestion[] = []
export const PAIN_TAGS_OPTIONS: string[] = []

// ========== Step1 基本信息（筛选题 1/2 + 题3 性别 + 职业） ==========

/** 题1 特殊情况（多选）；选前 5 项任一则 specialSituationSelected=true */
export const BASIC_Q1_OPTIONS: { id: string; text: string }[] = [
  { id: 'special_surgery', text: '近期手术' },
  { id: 'special_mental', text: '不适宜运动的后遗症/精神类疾患' },
  { id: 'special_visceral', text: '不适宜运动的内脏疾病，如心脏病等' },
  { id: 'special_bone', text: '不适宜运动的骨伤疾病，如剧烈的疼痛等' },
  { id: 'special_other', text: '不适宜运动的其他疾病' },
  { id: 'special_none', text: '没有上述情况' },
]

/** 题2 年龄区间（单选）；value 用于存储与判断 */
export const BASIC_Q2_OPTIONS: { id: string; text: string; value: string }[] = [
  { id: 'age_under12', text: '年龄<12岁', value: '<12' },
  { id: 'age_12_30', text: '12岁≤年龄<30岁', value: '12-30' },
  { id: 'age_30_50', text: '30岁≤年龄<50岁', value: '30-50' },
  { id: 'age_50_70', text: '50岁≤年龄<70岁', value: '50-70' },
  { id: 'age_over70', text: '年龄≥70岁', value: '>70' },
]

/** 题3 性别 */
export const BASIC_Q3_OPTIONS: { id: string; text: string; value: string }[] = [
  { id: 'gender_male', text: '男', value: 'male' },
  { id: 'gender_female', text: '女', value: 'female' },
]

/** 职业（可选） */
export const BASIC_OCCUPATION_OPTIONS: { id: string; text: string }[] = [
  { id: 'occ_sedentary', text: '久坐办公' },
  { id: 'occ_physical', text: '体力劳动' },
  { id: 'occ_freelance', text: '自由职业' },
  { id: 'occ_student', text: '学生' },
  { id: 'occ_retired', text: '退休' },
  { id: 'occ_other', text: '其他' },
]

// ========== 身体测评 题4-19 数据结构（Phase A） ==========

/** 单选题：选项带展示文案与得分 */
export interface BodySingleOption {
  text: string
  score: number
}

/** 题6 运动类型：多选，每项有文案、强度标签（仅展示）、得分（计分用） */
export interface BodyQ6Option {
  id: string
  text: string
  intensity: '低强度' | '中强度' | '高强度' | '无'
  score: number
}

/** 题4 健康的重要性 */
export const BODY_Q4_OPTIONS: BodySingleOption[] = [
  { text: '与其他事情同样重要', score: 0 },
  { text: '比较重要，并在改善健康上投入了一些时间和努力', score: 1 },
  { text: '健康是生活/工作的基础，必须将其视为非常重要的部分', score: 2 },
]

/** 题5 每周运动次数 */
export const BODY_Q5_OPTIONS: BodySingleOption[] = [
  { text: '0次', score: 0 },
  { text: '1-2次', score: 1 },
  { text: '3-4次', score: 2 },
  { text: '5次及以上', score: 3 },
]

/** 题6 运动类型（多选，18 项） */
export const BODY_Q6_OPTIONS: BodyQ6Option[] = [
  { id: 'q6_1', text: '散步/户外轻徒步(速度<3km/h)', intensity: '低强度', score: 2 },
  { id: 'q6_2', text: '中式养生功法', intensity: '低强度', score: 2 },
  { id: 'q6_3', text: '瑜伽(无力量要求型)', intensity: '低强度', score: 2 },
  { id: 'q6_4', text: '共享单车骑行(速度<10km/h)', intensity: '低强度', score: 2 },
  { id: 'q6_5', text: '广场舞(节奏<80拍/分钟)', intensity: '低强度', score: 2 },
  { id: 'q6_6', text: '瑜伽(有力量要求型)', intensity: '中强度', score: 3 },
  { id: 'q6_7', text: '普拉提', intensity: '中强度', score: 3 },
  { id: 'q6_8', text: '快走(速度>5km/h)', intensity: '中强度', score: 3 },
  { id: 'q6_9', text: '乒乓球/羽毛球(娱乐局)', intensity: '中强度', score: 3 },
  { id: 'q6_10', text: '游泳(慢游)', intensity: '中强度', score: 3 },
  { id: 'q6_11', text: '健身操(中等节奏)', intensity: '中强度', score: 3 },
  { id: 'q6_12', text: '公路骑行(15-25km/h,平坦路面)', intensity: '中强度', score: 3 },
  { id: 'q6_13', text: '速度跑/长跑(不能完整说出一句话,或单次>5公里)', intensity: '高强度', score: 4 },
  { id: 'q6_14', text: '搏击/拳击/HIIT', intensity: '高强度', score: 4 },
  { id: 'q6_15', text: '大重量举铁', intensity: '高强度', score: 4 },
  { id: 'q6_16', text: '网球/羽毛球(竞技局)/篮球/足球', intensity: '高强度', score: 4 },
  { id: 'q6_17', text: '其他', intensity: '中强度', score: 3 },
  { id: 'q6_18', text: '从不', intensity: '无', score: 0 },
]

/** 题7 低强度运动时长 */
export const BODY_Q7_OPTIONS: BodySingleOption[] = [
  { text: '少于30分钟', score: 1 },
  { text: '30-60分钟', score: 3 },
  { text: '60-120分钟', score: 5 },
  { text: '120分钟以上', score: 3 },
]

/** 题8 中强度运动时长 */
export const BODY_Q8_OPTIONS: BodySingleOption[] = [
  { text: '少于30分钟', score: 1 },
  { text: '30-60分钟', score: 3 },
  { text: '60-120分钟', score: 5 },
  { text: '120分钟以上', score: 3 },
]

/** 题9 高强度运动时长 */
export const BODY_Q9_OPTIONS: BodySingleOption[] = [
  { text: '少于30分钟', score: 2 },
  { text: '30-60分钟', score: 5 },
  { text: '60分钟以上', score: 2 },
]

/** 题10 运动后感觉 */
export const BODY_Q10_OPTIONS: BodySingleOption[] = [
  { text: '经常力竭，呼吸非常急促，大汗淋漓', score: 1 },
  { text: '肌肉明显疲劳，呼吸轻度急促，明显出汗', score: 3 },
  { text: '轻度肌肉疲劳，呼吸轻松，适量出汗', score: 5 },
  { text: '微微出汗、呼吸舒适', score: 4 },
]

/** 题11 运动后次日身体状态 */
export const BODY_Q11_OPTIONS: BodySingleOption[] = [
  { text: '无任何不适，精力充沛', score: 5 },
  { text: '肌肉轻微酸痛，1-2天可缓解', score: 4 },
  { text: '肌肉明显酸痛，3天左右缓解', score: 2 },
  { text: '酸痛剧烈，影响日常活动', score: 1 },
]

/** 题12 关节健康状况 */
export const BODY_Q12_OPTIONS: BodySingleOption[] = [
  { text: '无任何关节不适，运动无限制', score: 5 },
  { text: '偶尔轻微不适，不影响低中等强度运动', score: 3 },
  { text: '运动后关节酸痛，需避免高强度运动', score: 2 },
  { text: '关节有旧伤，仅能进行极轻度运动', score: 1 },
]

/** 题13 炼体法·长期困扰（多选，7 项，每项 1 分，先采集展示） */
export const BODY_Q13_OPTIONS: { id: string; text: string }[] = [
  { id: 'q13_1', text: '体重' },
  { id: 'q13_2', text: '体态' },
  { id: 'q13_3', text: '睡眠' },
  { id: 'q13_4', text: '精神紧张、焦虑' },
  { id: 'q13_5', text: '三高' },
  { id: 'q13_6', text: '脾胃不和' },
  { id: 'q13_7', text: '其他脏腑问题' },
]

/** 题14 炼体法·中式运动核心需求（多选，4 项，每项 1 分，先采集展示） */
export const BODY_Q14_OPTIONS: { id: string; text: string }[] = [
  { id: 'q14_1', text: '放松身心改善睡眠' },
  { id: 'q14_2', text: '增强体质，筋骨健康' },
  { id: 'q14_3', text: '养生固本，调和气血' },
  { id: 'q14_4', text: '与道合真，身心归元' },
]

/** 题15-19 四档选项（0=从未 1=轻微 2=中等 3=明显）；选 2 或 3 触发对应炼体法 */
export const BODY_Q15_19_OPTIONS: BodySingleOption[] = [
  { text: '从未有过', score: 0 },
  { text: '感觉轻微', score: 1 },
  { text: '感觉中等', score: 2 },
  { text: '感觉明显', score: 3 },
]

/** 题15 炼体法：身体活动度/舒展 */
export const BODY_Q15_TITLE = '是否存在感觉身体活动度差，周身不够舒展？'

/** 题16 炼体法：久坐僵硬 */
export const BODY_Q16_TITLE = '是否存在长时间保持同一姿势，感到脊柱肢体僵硬不灵活的情况？'

/** 题17 炼体法：易伤 */
export const BODY_Q17_TITLE = '是否存在感觉自己不会用力容易受伤/劳损？'

/** 题18 炼体法：发力模式 */
export const BODY_Q18_TITLE = '是否希望通过改善发力模式让动作变得协调自然？'

/** 题19 炼体法：深层开发 */
export const BODY_Q19_TITLE = '是否存在感觉练习很多运动，但身体深层开发不够，不能整合如一？'
