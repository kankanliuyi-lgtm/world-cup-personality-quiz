import { useEffect, useMemo, useRef, useState } from "react";

const dimensions = ["attack", "social", "decision", "pressure"];

const dimensionMeta = {
  attack: {
    label: "行动方式",
    positive: "主动进攻",
    negative: "观察判断",
    positiveSubtype: "强攻型",
    negativeSubtype: "观察型",
    codePositive: "A",
    codeNegative: "O",
  },
  social: {
    label: "团队关系",
    positive: "团队协作",
    negative: "个人主导",
    positiveSubtype: "协作型",
    negativeSubtype: "主导型",
    codePositive: "C",
    codeNegative: "L",
  },
  decision: {
    label: "决策方式",
    positive: "直觉创造",
    negative: "理性计划",
    positiveSubtype: "灵感型",
    negativeSubtype: "计划型",
    codePositive: "I",
    codeNegative: "P",
  },
  pressure: {
    label: "压力反应",
    positive: "逆境爆发",
    negative: "稳定控制",
    positiveSubtype: "爆发型",
    negativeSubtype: "稳定型",
    codePositive: "B",
    codeNegative: "S",
  },
};

const questions = [
  {
    dimension: "attack",
    eyebrow: "行动方式 · 01",
    title: "一个新机会突然出现，但信息还不完整。你更可能？",
    options: [
      { label: "先行动，在推进中补齐信息", value: 2 },
      { label: "做一个小尝试，快速看看反馈", value: 1 },
      { label: "先观察别人怎么做，再决定是否加入", value: -1 },
      { label: "等关键条件明确后再出手", value: -2 },
    ],
  },
  {
    dimension: "social",
    eyebrow: "团队关系 · 01",
    title: "团队刚接到一个模糊任务，你自然会站到哪个位置？",
    options: [
      { label: "把大家的优势拼起来，一起确定打法", value: 2 },
      { label: "先听每个人的想法，再补充自己的判断", value: 1 },
      { label: "提出一个明确方向，推动大家跟上", value: -1 },
      { label: "直接接过主导权，把任务分配下去", value: -2 },
    ],
  },
  {
    dimension: "decision",
    eyebrow: "决策方式 · 01",
    title: "面对一个从未遇到的问题，你最信任哪种起点？",
    options: [
      { label: "脑中突然出现的那个新可能", value: 2 },
      { label: "先试一个有感觉的方向", value: 1 },
      { label: "把问题拆开，比较几条可行路径", value: -1 },
      { label: "搜集证据，建立清晰的行动计划", value: -2 },
    ],
  },
  {
    dimension: "pressure",
    eyebrow: "压力反应 · 01",
    title: "截止时间越来越近，你通常会进入哪种状态？",
    options: [
      { label: "越紧张越兴奋，效率突然拉满", value: 2 },
      { label: "会短暂焦虑，但很快进入冲刺状态", value: 1 },
      { label: "维持原来的节奏，不让压力打乱计划", value: -1 },
      { label: "提前留出余量，尽量避免最后冲刺", value: -2 },
    ],
  },
  {
    dimension: "attack",
    eyebrow: "行动方式 · 02",
    title: "讨论持续很久，大家仍然没有得出结论。你会？",
    options: [
      { label: "提出一个方案，先让事情动起来", value: 2 },
      { label: "建议用小范围实验结束争论", value: 1 },
      { label: "继续听，判断真正的分歧在哪里", value: -1 },
      { label: "等信息更充分后再做决定", value: -2 },
    ],
  },
  {
    dimension: "social",
    eyebrow: "团队关系 · 02",
    title: "你完成了一项很出色的成果，更希望别人怎样描述它？",
    options: [
      { label: "这是整个团队共同完成的漂亮配合", value: 2 },
      { label: "你让身边的人都发挥得更好了", value: 1 },
      { label: "你提出了决定性的方向", value: -1 },
      { label: "这是带有强烈个人风格的代表作", value: -2 },
    ],
  },
  {
    dimension: "decision",
    eyebrow: "决策方式 · 02",
    title: "旅行时临时空出半天，你更喜欢怎样安排？",
    options: [
      { label: "随便选一条没走过的路，看看会遇见什么", value: 2 },
      { label: "选一个当下最有感觉的地方", value: 1 },
      { label: "比较距离、评价和时间后再决定", value: -1 },
      { label: "提前规划路线，把时间利用得更完整", value: -2 },
    ],
  },
  {
    dimension: "pressure",
    eyebrow: "压力反应 · 02",
    title: "重要展示开始前五分钟，设备突然出问题。你会？",
    options: [
      { label: "肾上腺素上来，马上现场救火", value: 2 },
      { label: "快速切换备用方案，边做边调整", value: 1 },
      { label: "按预案逐项排查，不让情绪影响判断", value: -1 },
      { label: "直接启用提前准备好的完整备份", value: -2 },
    ],
  },
  {
    dimension: "attack",
    eyebrow: "行动方式 · 03",
    title: "如果人生是一场比赛，你更相信哪句话？",
    options: [
      { label: "机会是跑出来的，不是等出来的", value: 2 },
      { label: "先占据位置，机会自然会出现", value: 1 },
      { label: "看清局势，比抢先一步更重要", value: -1 },
      { label: "没有足够胜算时，耐心也是行动", value: -2 },
    ],
  },
  {
    dimension: "social",
    eyebrow: "团队关系 · 03",
    title: "朋友遇到难题来找你，你通常如何帮助？",
    options: [
      { label: "陪他一起梳理，找到属于他的答案", value: 2 },
      { label: "分享经验，再和他一起判断", value: 1 },
      { label: "直接告诉他我认为最有效的做法", value: -1 },
      { label: "替他制定一套明确的解决方案", value: -2 },
    ],
  },
  {
    dimension: "decision",
    eyebrow: "决策方式 · 03",
    title: "做内容或方案时，什么最容易让你进入状态？",
    options: [
      { label: "一个突然出现、让人兴奋的新想法", value: 2 },
      { label: "先自由发散，再慢慢找到主线", value: 1 },
      { label: "一个明确的问题和可参考的案例", value: -1 },
      { label: "清楚的目标、结构和完成标准", value: -2 },
    ],
  },
  {
    dimension: "pressure",
    eyebrow: "压力反应 · 03",
    title: "回想你表现最好的一次，通常发生在什么情况下？",
    options: [
      { label: "局面紧张，所有人都在等一个人站出来", value: 2 },
      { label: "出现意外，需要快速改变原有打法", value: 1 },
      { label: "准备充分，可以稳定执行自己的节奏", value: -1 },
      { label: "环境可控，能够把细节做到最好", value: -2 },
    ],
  },
];

const personalities = [
  {
    id: "director",
    target: [-1, -1, 1, -1],
    name: "天才导演",
    star: "莱昂内尔·梅西",
    trait: "空间阅读与节奏控制",
    position: "AM",
    number: "10",
    rarity: "9.8%",
    quote: "你不追着比赛跑。你让比赛按自己的节奏发生。",
    copy: "你擅长在复杂局面里看到别人忽略的路线。真正的优势不是声量，而是判断什么时候推进、什么时候停顿，以及怎样让身边的人进入最佳位置。",
    keywords: ["节奏中枢", "空间阅读", "低调掌控", "精确创造"],
    stats: { 洞察: 97, 控场: 96, 创造: 94, 抗压: 84 },
    partner: "绝境终结者",
    accent: "#baff00",
  },
  {
    id: "finisher",
    target: [1, -1, -1, 1],
    name: "绝境终结者",
    star: "基利安·姆巴佩",
    trait: "高速决断力",
    position: "ST",
    number: "07",
    rarity: "11.6%",
    quote: "机会不会等你准备好。你会在它消失之前完成决定。",
    copy: "越接近关键时刻，你的注意力越集中。你愿意承担最后一击的压力，也有能力用最直接的路线穿过混乱，把局势推向明确的结果。",
    keywords: ["快准狠", "直觉派", "破局者", "大心脏"],
    stats: { 决断: 94, 速度: 97, 爆发: 95, 抗压: 91 },
    partner: "天才导演",
    accent: "#ffd52a",
  },
  {
    id: "magician",
    target: [-1, -1, 1, 1],
    name: "灵感魔术师",
    star: "拉明·亚马尔",
    trait: "自由创造力",
    position: "RW",
    number: "10",
    rarity: "8.6%",
    quote: "你能在混乱中看见未被发现的可能，并把它变成精彩瞬间。",
    copy: "你不依赖标准答案。面对拥挤和限制，你更容易被激发，而不是被困住。你会用想象力改变路线，让本来普通的局面突然有了故事。",
    keywords: ["创造力", "想象力", "灵动跑位", "制造惊喜"],
    stats: { 创造: 96, 直觉: 93, 协作: 76, 抗压: 82 },
    partner: "永动发动机",
    accent: "#baff00",
  },
  {
    id: "engine",
    target: [1, 1, -1, -1],
    name: "永动发动机",
    star: "裘德·贝林厄姆",
    trait: "全场覆盖与持续推进",
    position: "CM",
    number: "05",
    rarity: "13.2%",
    quote: "当别人开始掉速，你还在向下一个目标推进。",
    copy: "你的优势来自持续行动。你既能承担任务，也能主动补位；不会只等待高光，而是用稳定投入把一场漫长的比赛推向自己想要的方向。",
    keywords: ["高能量", "执行派", "全场覆盖", "持续推进"],
    stats: { 执行: 96, 覆盖: 95, 协作: 89, 抗压: 88 },
    partner: "灵感魔术师",
    accent: "#55e6ff",
  },
  {
    id: "breaker",
    target: [1, -1, 1, 1],
    name: "闪电突破者",
    star: "维尼修斯·儒尼奥尔",
    trait: "正面突破与情绪点火",
    position: "LW",
    number: "07",
    rarity: "12.4%",
    quote: "你相信最短的答案，就是迎着防线向前。",
    copy: "你天然会被空间和速度吸引。与其长时间等待完美条件，你更愿意创造条件，用连续行动迫使局面发生变化，并让周围的人感受到你的能量。",
    keywords: ["直接进攻", "速度感", "点燃气氛", "连续冲击"],
    stats: { 突破: 97, 速度: 96, 勇气: 92, 创造: 85 },
    partner: "冷静指挥官",
    accent: "#ffcf22",
  },
  {
    id: "commander",
    target: [-1, 1, -1, -1],
    name: "冷静指挥官",
    star: "罗德里",
    trait: "局面控制与风险管理",
    position: "DM",
    number: "16",
    rarity: "14.1%",
    quote: "你让危险止步，也让每一次推进都有根据。",
    copy: "你习惯先建立秩序，再寻找机会。别人看到的是稳妥，你知道那其实是对风险、空间和节奏的持续计算。你的价值经常在你离开之后才最明显。",
    keywords: ["稳定器", "风险意识", "理性计划", "掌控全局"],
    stats: { 判断: 97, 控场: 95, 稳定: 96, 协作: 90 },
    partner: "闪电突破者",
    accent: "#a9f0d1",
  },
  {
    id: "guardian",
    target: [-1, 1, 1, -1],
    name: "沉默守护者",
    star: "维吉尔·范戴克",
    trait: "预判危险与团队兜底",
    position: "CB",
    number: "04",
    rarity: "16.7%",
    quote: "真正的可靠，是让危机看起来从未发生。",
    copy: "你很少为了被看见而行动。你更关注系统有没有漏洞、同伴是否需要保护，以及怎样用最小代价化解问题。团队敢于向前，是因为知道你在身后。",
    keywords: ["可靠", "预判力", "边界感", "团队后盾"],
    stats: { 预判: 96, 稳定: 97, 对抗: 92, 协作: 91 },
    partner: "奇迹替补",
    accent: "#73a7ff",
  },
  {
    id: "wildcard",
    target: [1, 1, 1, 1],
    name: "奇迹替补",
    star: "朱利安·阿尔瓦雷斯",
    trait: "快速适应与关键改变",
    position: "SS",
    number: "19",
    rarity: "13.6%",
    quote: "你不需要整场聚光灯，只需要一个改变结局的窗口。",
    copy: "你适应变化的速度很快，也愿意接受不确定的位置。看似低调的准备，会在局面需要新答案时突然显现，让你成为那个意料之外的转折点。",
    keywords: ["适应力", "关键先生", "灵活切换", "机会嗅觉"],
    stats: { 适应: 97, 爆发: 91, 跑动: 93, 抗压: 89 },
    partner: "沉默守护者",
    accent: "#ff765d",
  },
];

function addScore(current, question, value) {
  return { ...current, [question.dimension]: current[question.dimension] + value };
}

function findResult(scores) {
  return personalities
    .map((personality) => ({
      personality,
      distance: dimensions.reduce((sum, key, index) => {
        const side = scores[key] >= 0 ? 1 : -1;
        return sum + Math.pow(side - personality.target[index], 2);
      }, 0),
    }))
    .sort((a, b) => a.distance - b.distance)[0].personality;
}

function calculateProfile(scores) {
  return dimensions.map((key) => {
    const meta = dimensionMeta[key];
    const positivePercent = Math.round(((scores[key] + 6) / 12) * 100);
    const clampedPositive = Math.max(0, Math.min(100, positivePercent));
    return {
      key,
      ...meta,
      score: scores[key],
      positivePercent: clampedPositive,
      negativePercent: 100 - clampedPositive,
    };
  });
}

function getSubtype(scores) {
  const strongestKey = dimensions.reduce((best, key) =>
    Math.abs(scores[key]) > Math.abs(scores[best]) ? key : best,
  );
  const meta = dimensionMeta[strongestKey];
  return scores[strongestKey] >= 0
    ? meta.positiveSubtype
    : meta.negativeSubtype;
}

function getTypeCode(scores) {
  return dimensions
    .map((key) => {
      const meta = dimensionMeta[key];
      return scores[key] >= 0 ? meta.codePositive : meta.codeNegative;
    })
    .join("");
}

if (typeof window !== "undefined") {
  window.__quizDebug = {
    questions,
    personalities,
    findResult,
    addScore,
    calculateProfile,
    getSubtype,
    getTypeCode,
  };
}

function Header({ onHome, compact = false }) {
  return (
    <header className={`site-header ${compact ? "is-compact" : ""}`}>
      <button className="brand" onClick={onHome} aria-label="返回首页">
        <span className="brand-mark">XI</span>
        <span>
          <strong>球星人格</strong>
          <small>WORLD CUP QUIZ</small>
        </span>
      </button>
      <span className="edition">MATCHDAY / 2026</span>
    </header>
  );
}

function Landing({ onStart }) {
  return (
    <main className="landing-screen">
      <Header onHome={() => {}} />
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">2026 美加墨世界杯球星人格测试</p>
          <h1>
            测测你的
            <br />
            球场人格
            <br />
            <span>最像哪位球星？</span>
          </h1>
          <p className="hero-description">
            不需要懂足球。回答12个生活选择，看看你是天才导演、闪电突破者，还是绝境终结者，并找到与你比赛风格最接近的球星。
          </p>
          <button className="primary-button" onClick={onStart}>
            测测我是哪位球星
            <span>约3分钟</span>
          </button>
          <p className="privacy-note">无需登录 · 不收集个人信息 · 结果可保存</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <img src="/assets/player-blank.png" alt="" />
          <span className="hero-jersey-number">10</span>
          <span className="hero-number">10</span>
          <span className="hero-tag">FIND YOUR PLAY STYLE</span>
        </div>
      </section>
      <section className="feature-strip" aria-label="产品特点">
        <div>
          <strong>12</strong>
          <span>生活化题目</span>
        </div>
        <div>
          <strong>04</strong>
          <span>人格维度</span>
        </div>
        <div>
          <strong>08</strong>
          <span>球星人格</span>
        </div>
      </section>
    </main>
  );
}

function Quiz({ questionIndex, answers, onAnswer, onBack, onHome }) {
  const question = questions[questionIndex];
  const selected = answers[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  return (
    <main className="quiz-screen">
      <Header onHome={onHome} compact />
      <section className="quiz-shell">
        <div className="progress-row">
          <button
            className="text-button"
            onClick={onBack}
            disabled={questionIndex === 0}
          >
            上一题
          </button>
          <span>
            {String(questionIndex + 1).padStart(2, "0")} /{" "}
            {String(questions.length).padStart(2, "0")}
          </span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="question-copy">
          <p>{question.eyebrow}</p>
          <h2>{question.title}</h2>
        </div>
        <div className="option-list">
          {question.options.map((option, index) => (
            <button
              key={option.label}
              className={selected === index ? "option is-selected" : "option"}
              onClick={() => onAnswer(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
        <p className="quiz-footnote">凭第一反应选择，没有正确答案。</p>
      </section>
    </main>
  );
}

function StatBars({ stats }) {
  return (
    <div className="stat-grid">
      {Object.entries(stats).map(([label, value]) => (
        <div className="stat-item" key={label}>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <div className="stat-track">
            <span style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DimensionProfile({ profile, typeCode, subtype }) {
  return (
    <section className="dimension-profile">
      <div className="dimension-heading">
        <div>
          <span>你的球场坐标</span>
          <strong>{typeCode}</strong>
        </div>
        <small>{subtype}</small>
      </div>
      <div className="dimension-list">
        {profile.map((item) => (
          <div className="dimension-item" key={item.key}>
            <div className="dimension-labels">
              <strong className={item.score >= 0 ? "is-active" : ""}>
                {item.positive} {item.positivePercent}%
              </strong>
              <span>{item.label}</span>
              <strong className={item.score < 0 ? "is-active" : ""}>
                {item.negativePercent}% {item.negative}
              </strong>
            </div>
            <div className="dimension-track">
              <span style={{ width: `${item.positivePercent}%` }} />
              <i />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Result({ result, profile, subtype, typeCode, onRestart, onHome }) {
  const canvasRef = useRef(null);
  const [downloadState, setDownloadState] = useState("保存结果卡");

  const drawCard = async () => {
    setDownloadState("正在生成...");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 1080;
    const height = 1440;
    canvas.width = width;
    canvas.height = height;

    const image = new Image();
    image.src = "/assets/player-blank.png";
    await image.decode();

    ctx.fillStyle = "#080a0d";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 350, 125, 760, 950);
    ctx.fillStyle = "rgba(8,10,13,.48)";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(792, 392);
    ctx.rotate(0.07);
    ctx.fillStyle = result.accent;
    ctx.textAlign = "center";
    ctx.font = `900 112px "Bebas Neue", sans-serif`;
    ctx.fillText(result.number, 0, 0);
    ctx.restore();
    ctx.fillStyle = result.accent;
    ctx.fillRect(60, 62, 170, 16);
    ctx.fillRect(60, 1282, 960, 4);
    ctx.strokeStyle = "rgba(255,255,255,.24)";
    ctx.lineWidth = 3;
    ctx.strokeRect(38, 38, width - 76, height - 76);

    const fontStack = '"Noto Sans SC", "PingFang SC", sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 32px ${fontStack}`;
    ctx.fillText("你的世界杯球星人格", 60, 130);
    ctx.fillStyle = result.accent;
    ctx.font = `900 105px ${fontStack}`;
    ctx.fillText(result.name, 54, 275);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 25px ${fontStack}`;
    ctx.fillText(`${typeCode} · ${subtype}`, 62, 320);

    ctx.font = `700 36px ${fontStack}`;
    ctx.fillText(`代表球星  ${result.star}`, 60, 375);
    ctx.fillStyle = "rgba(255,255,255,.68)";
    ctx.font = `400 27px ${fontStack}`;
    ctx.fillText(`匹配的是他的${result.trait}`, 60, 425);

    ctx.fillStyle = result.accent;
    ctx.font = `900 180px "Bebas Neue", sans-serif`;
    ctx.fillText(result.number, 60, 700);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 46px "Bebas Neue", sans-serif`;
    ctx.fillText(result.position, 72, 755);

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 42px ${fontStack}`;
    const quoteLines = splitCanvasText(ctx, result.quote, 870);
    quoteLines.forEach((line, index) => ctx.fillText(line, 60, 920 + index * 60));

    Object.entries(result.stats).forEach(([label, value], index) => {
      const x = 60 + (index % 2) * 490;
      const y = 1065 + Math.floor(index / 2) * 112;
      ctx.fillStyle = "rgba(255,255,255,.64)";
      ctx.font = `500 25px ${fontStack}`;
      ctx.fillText(label, x, y);
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 44px "Bebas Neue", sans-serif`;
      ctx.fillText(String(value), x + 100, y + 4);
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.fillRect(x, y + 28, 390, 12);
      ctx.fillStyle = result.accent;
      ctx.fillRect(x, y + 28, 390 * (value / 100), 12);
    });

    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.font = `500 24px ${fontStack}`;
    ctx.fillText("球星只代表一种比赛特质，不评价其完整人格", 60, 1350);

    const link = document.createElement("a");
    link.download = `我的球星人格-${result.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloadState("已保存");
    window.setTimeout(() => setDownloadState("保存结果卡"), 1800);
  };

  const shareResult = async () => {
    const shareData = {
      title: `我的球星人格是${result.name}`,
      text: `我测出的球星人格是「${result.name}·${subtype}」（${typeCode}），代表球星是${result.star}。你会是谁？`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      window.alert("分享文案和链接已复制");
    }
  };

  return (
    <main className="result-screen" style={{ "--result-accent": result.accent }}>
      <Header onHome={onHome} compact />
      <section className="result-layout">
        <div className="result-intro">
          <p>你的世界杯球星人格是</p>
          <h1>{result.name}</h1>
          <div className="result-type">
            <strong>{subtype}</strong>
            <span>{typeCode}</span>
          </div>
          <div className="star-line">
            <span>代表球星</span>
            <strong>{result.star}</strong>
            <small>匹配的是他的{result.trait}</small>
          </div>
        </div>

        <DimensionProfile
          profile={profile}
          subtype={subtype}
          typeCode={typeCode}
        />

        <article className="player-card">
          <div className="card-topline">
            <span>PERSONALITY CARD</span>
            <span>RARITY {result.rarity}</span>
          </div>
          <div className="card-art">
            <img src="/assets/player-blank.png" alt="原创匿名足球运动员插画" />
            <span className="card-jersey-number">{result.number}</span>
            <span className="card-position">{result.position}</span>
            <span className="card-number">{result.number}</span>
          </div>
          <div className="card-statement">
            <span>核心特质</span>
            <strong>{result.quote}</strong>
          </div>
          <StatBars stats={result.stats} />
          <div className="keyword-row">
            {result.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </article>

        <section className="result-analysis">
          <p>{result.copy}</p>
          <div>
            <span>你的黄金搭档</span>
            <strong>{result.partner}</strong>
          </div>
          <small>
            说明：本测试匹配的是球星在赛场上的某种公开比赛风格，不代表对其完整个人性格的判断。
          </small>
        </section>

        <div className="result-actions">
          <button className="primary-button" onClick={drawCard}>
            {downloadState}
            <span>PNG高清图片</span>
          </button>
          <button className="secondary-button" onClick={shareResult}>
            分享测试
          </button>
          <button className="text-button restart" onClick={onRestart}>
            重新测试
          </button>
        </div>
      </section>
      <canvas ref={canvasRef} className="hidden-canvas" />
    </main>
  );
}

function splitCanvasText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function App() {
  const [screen, setScreen] = useState("landing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen, questionIndex]);

  const scores = useMemo(
    () =>
      answers.reduce(
        (current, optionIndex, index) =>
          optionIndex === undefined
            ? current
            : addScore(
                current,
                questions[index],
                questions[index].options[optionIndex].value,
              ),
        { attack: 0, social: 0, decision: 0, pressure: 0 },
      ),
    [answers],
  );

  const result = useMemo(() => findResult(scores), [scores]);
  const profile = useMemo(() => calculateProfile(scores), [scores]);
  const subtype = useMemo(() => getSubtype(scores), [scores]);
  const typeCode = useMemo(() => getTypeCode(scores), [scores]);

  const goHome = () => {
    setScreen("landing");
    setQuestionIndex(0);
    setAnswers([]);
  };

  const startQuiz = () => {
    setScreen("quiz");
    setQuestionIndex(0);
    setAnswers([]);
  };

  const answerQuestion = (optionIndex) => {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
    window.setTimeout(() => {
      if (questionIndex === questions.length - 1) {
        setScreen("result");
      } else {
        setQuestionIndex((current) => current + 1);
      }
    }, 180);
  };

  if (screen === "landing") {
    return <Landing onStart={startQuiz} />;
  }

  if (screen === "quiz") {
    return (
      <Quiz
        questionIndex={questionIndex}
        answers={answers}
        onAnswer={answerQuestion}
        onBack={() => setQuestionIndex((current) => Math.max(0, current - 1))}
        onHome={goHome}
      />
    );
  }

  return (
    <Result
      result={result}
      profile={profile}
      subtype={subtype}
      typeCode={typeCode}
      onRestart={startQuiz}
      onHome={goHome}
    />
  );
}
