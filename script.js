const storageKey = "sothysPlannerContentItemsV1";
const contentApiPath = "/api/content-library";

const defaultItems = [
  {
    id: "firstTrial",
    name: "First Trial Offer",
    title: "First Trial From RM273 Only",
    subtitle: "Experience Premium Facial Treatment Today",
    cta: "Claim Your First Trial Now",
    price: "N/P: RM390",
    visual: "Clean cream background, soft facial treatment photo, clear headline, SOTHYS logo top right.",
    angles: [
      "First trial offer spotlight",
      "Premium facial value comparison",
      "New customer skin consultation",
      "Relaxing facial experience",
      "Treatment room trust builder",
      "Why first treatment matters",
    ],
  },
  {
    id: "limitedSlots",
    name: "June Limited Slots",
    title: "Only Limited June Slots Left",
    subtitle: "Book Your Skin Session Before It's Full",
    cta: "Reserve Your Slot Today",
    price: "",
    visual: "Calendar-inspired layout, limited slots highlighted, SOTHYS logo top right, clean CTA area.",
    angles: [
      "Limited appointment reminder",
      "June calendar urgency post",
      "Last available beauty slots",
      "Weekend booking reminder",
      "Skin session reservation push",
      "Premium salon availability update",
    ],
  },
  {
    id: "acne",
    name: "Acne Campaign",
    title: "Still Struggling With Acne?",
    subtitle: "Professional Skin Treatment For Clear & Healthy Skin",
    cta: "Start Your Acne Recovery Today",
    price: "",
    visual: "Before / after layout with subtle divider, natural skin tone, clinical but premium.",
    angles: [
      "Acne concern education",
      "Pores and redness improvement",
      "Oil control treatment angle",
      "Before and after proof concept",
      "Professional skin analysis",
      "Confidence recovery message",
    ],
  },
  {
    id: "recovery",
    name: "Skin Recovery Campaign",
    title: "Your Skin Needs Professional Care",
    subtitle: "Repair, hydrate & restore your skin with advanced facial treatments.",
    cta: "Start Your Skin Recovery Today",
    price: "",
    visual: "Close-up healthy skin texture, soft beige frame, readable CTA button.",
    angles: [
      "Hydration and repair focus",
      "Damaged skin recovery",
      "Sensitive skin care message",
      "Barrier support education",
      "Glow restoration post",
      "Professional facial routine",
    ],
  },
];

const formats = [
  "Before / After carousel",
  "Reels short video",
  "Single image ad",
  "Client education post",
  "Offer reminder",
  "Treatment close-up",
  "Testimonial style post",
  "Booking push creative",
];

const visualStyles = [
  "Clean cream background, soft facial treatment photo, clear headline, SOTHYS logo top right.",
  "Premium skincare product and towel detail, champagne accents, elegant white space.",
  "Bright salon room scene, relaxed facial mood, clean typography, no clutter.",
  "Close-up healthy skin texture, soft beige frame, readable CTA button.",
  "Before / after layout with subtle divider, natural skin tone, clinical but premium.",
  "Calendar-inspired layout, limited slots highlighted, top-right logo placement.",
];

const hooks = [
  "Your skin deserves expert care before the month gets busy.",
  "A premium facial session can be the reset your skin needs.",
  "Clearer, calmer, healthier-looking skin starts with the right treatment.",
  "Limited appointments are available for this month's skin sessions.",
  "Book your facial before your preferred time is gone.",
  "Professional skin care gives your routine a stronger foundation.",
];

let currentPlan = [];
let contentItems = loadLocalContentItems();
let editingItemId = null;
let cloudStorageReady = false;

const form = document.getElementById("plannerForm");
const monthInput = document.getElementById("monthInput");
const campaignInput = document.getElementById("campaignInput");
const frequencyInput = document.getElementById("frequencyInput");
const focusInput = document.getElementById("focusInput");
const itemNameInput = document.getElementById("itemNameInput");
const itemTitleInput = document.getElementById("itemTitleInput");
const itemSubtitleInput = document.getElementById("itemSubtitleInput");
const itemCtaInput = document.getElementById("itemCtaInput");
const itemPriceInput = document.getElementById("itemPriceInput");
const itemAnglesInput = document.getElementById("itemAnglesInput");
const itemVisualInput = document.getElementById("itemVisualInput");
const newItemButton = document.getElementById("newItemButton");
const saveItemButton = document.getElementById("saveItemButton");
const libraryList = document.getElementById("libraryList");
const syncStatus = document.getElementById("syncStatus");
const calendarGrid = document.getElementById("calendarGrid");
const planTable = document.getElementById("planTable");
const monthLabel = document.getElementById("monthLabel");
const postCount = document.getElementById("postCount");
const copyButton = document.getElementById("copyButton");
const csvButton = document.getElementById("csvButton");
const toast = document.getElementById("toast");

function loadLocalContentItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved) && saved.length) {
      return saved.map(normalizeItem);
    }
  } catch (error) {
    localStorage.removeItem(storageKey);
  }

  return defaultItems.map(normalizeItem);
}

function normalizeItem(item) {
  return {
    id: item.id || makeId(),
    name: item.name || item.title || "New Content",
    title: item.title || item.name || "New Content",
    subtitle: item.subtitle || "Premium skincare treatment for healthier-looking skin.",
    cta: item.cta || "Book Your Treatment Today",
    price: item.price || "",
    visual: item.visual || "",
    angles: normalizeAngles(item.angles),
  };
}

function normalizeAngles(angles) {
  if (Array.isArray(angles)) {
    return angles.map((angle) => String(angle).trim()).filter(Boolean);
  }

  if (typeof angles === "string") {
    return angles.split("\n").map((angle) => angle.trim()).filter(Boolean);
  }

  return ["Treatment benefit", "Client concern", "Booking reminder"];
}

function makeId() {
  return `item-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function saveLocalContentItems() {
  localStorage.setItem(storageKey, JSON.stringify(contentItems));
}

async function loadCloudContentItems() {
  try {
    const response = await fetch(contentApiPath, { cache: "no-store" });
    const data = await response.json();

    if (!response.ok || !data.ok || data.storage !== "cloud") {
      cloudStorageReady = false;
      updateSyncStatus("本机保存模式：部署后需要连接 Blob Storage，朋友才会共享同一份内容库。");
      return;
    }

    cloudStorageReady = true;

    if (Array.isArray(data.items) && data.items.length) {
      contentItems = data.items.map(normalizeItem);
      saveLocalContentItems();
      updateSyncStatus("云端同步已连接：朋友打开同一个网址会看到同一份内容库。");
    } else {
      await saveContentItems();
      updateSyncStatus("云端同步已初始化：默认内容库已经保存到线上。");
    }

    refreshCampaignOptions(campaignInput.value || "firstTrial");
    renderLibraryList();
    makePlan();
  } catch (error) {
    cloudStorageReady = false;
    updateSyncStatus("本机保存模式：暂时无法连接云端，会先保存在这个浏览器。");
  }
}

async function saveContentItems() {
  saveLocalContentItems();

  try {
    const response = await fetch(contentApiPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: contentItems }),
    });
    const data = await response.json();

    if (!response.ok || !data.ok || data.storage !== "cloud") {
      cloudStorageReady = false;
      updateSyncStatus("本机保存模式：内容已保存在这个浏览器，云端尚未连接。");
      return false;
    }

    cloudStorageReady = true;
    updateSyncStatus("云端同步已保存：朋友打开同一个网址也会看到更新。");
    return true;
  } catch (error) {
    cloudStorageReady = false;
    updateSyncStatus("本机保存模式：内容已保存在这个浏览器，云端暂时不可用。");
    return false;
  }
}

function updateSyncStatus(message) {
  syncStatus.textContent = message;
  syncStatus.dataset.mode = cloudStorageReady ? "cloud" : "local";
}

function refreshCampaignOptions(preferredValue = campaignInput.value) {
  campaignInput.innerHTML = "";

  contentItems.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    campaignInput.appendChild(option);
  });

  const mixedOption = document.createElement("option");
  mixedOption.value = "mixed";
  mixedOption.textContent = "Mixed Monthly Campaign";
  campaignInput.appendChild(mixedOption);

  const exists = contentItems.some((item) => item.id === preferredValue) || preferredValue === "mixed";
  campaignInput.value = exists ? preferredValue : contentItems[0].id;
}

function renderLibraryList() {
  libraryList.innerHTML = "";

  contentItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "library-item";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    const details = document.createElement("span");
    title.textContent = item.name;
    details.textContent = `${item.title}${item.price ? ` | ${item.price}` : ""}`;
    info.append(title, details);

    const actions = document.createElement("div");
    actions.className = "library-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = item.id;
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = item.id;
    deleteButton.textContent = "Delete";

    actions.append(editButton, deleteButton);
    card.append(info, actions);
    libraryList.appendChild(card);
  });
}

function clearItemForm() {
  editingItemId = null;
  itemNameInput.value = "";
  itemTitleInput.value = "";
  itemSubtitleInput.value = "";
  itemCtaInput.value = "";
  itemPriceInput.value = "";
  itemAnglesInput.value = "";
  itemVisualInput.value = "";
  saveItemButton.textContent = "保存到内容库";
  itemNameInput.focus();
}

function fillItemForm(item) {
  editingItemId = item.id;
  itemNameInput.value = item.name;
  itemTitleInput.value = item.title;
  itemSubtitleInput.value = item.subtitle;
  itemCtaInput.value = item.cta;
  itemPriceInput.value = item.price;
  itemAnglesInput.value = item.angles.join("\n");
  itemVisualInput.value = item.visual;
  saveItemButton.textContent = "更新内容";
}

function collectItemForm() {
  const name = itemNameInput.value.trim();
  const title = itemTitleInput.value.trim();
  const subtitle = itemSubtitleInput.value.trim();
  const cta = itemCtaInput.value.trim();
  const angles = normalizeAngles(itemAnglesInput.value);

  if (!name || !title) {
    showToast("请填写产品/活动名称和主标题");
    return null;
  }

  return {
    id: editingItemId || makeId(),
    name,
    title,
    subtitle: subtitle || "Premium skincare treatment for healthier-looking skin.",
    cta: cta || "Book Your Treatment Today",
    price: itemPriceInput.value.trim(),
    visual: itemVisualInput.value.trim(),
    angles,
  };
}

function monthName(year, monthIndex) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, monthIndex, 1));
}

function getChannels() {
  return Array.from(document.querySelectorAll('input[name="channel"]:checked')).map((input) => input.value);
}

function shouldPublish(date, frequency) {
  const day = date.getDay();
  const dateNum = date.getDate();

  if (frequency === "daily") return true;
  if (frequency === "weekday") return day >= 1 && day <= 5;

  return [1, 3, 5].includes(day) || (dateNum === 1 && day !== 0);
}

function pickCampaign(selected, index) {
  if (selected === "mixed") {
    return contentItems[index % contentItems.length];
  }

  return contentItems.find((item) => item.id === selected) || contentItems[0];
}

function makePlan() {
  const [year, month] = monthInput.value.split("-").map(Number);
  const monthIndex = month - 1;
  const selectedCampaign = campaignInput.value;
  const frequency = frequencyInput.value;
  const channels = getChannels();
  const safeChannels = channels.length ? channels : ["Instagram Feed"];
  const daysInMonth = new Date(year, month, 0).getDate();
  const plan = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (!shouldPublish(date, frequency)) continue;

    const campaign = pickCampaign(selectedCampaign, plan.length);
    const channel = safeChannels[plan.length % safeChannels.length];
    const format = formats[(day + plan.length) % formats.length];
    const angle = campaign.angles[(day + plan.length) % campaign.angles.length];
    const hook = hooks[(day + plan.length) % hooks.length];
    const priceLine = campaign.price ? ` ${campaign.price}.` : "";
    const caption = `${hook} ${campaign.title}.${priceLine} ${campaign.subtitle}`;
    const baseVisual = campaign.visual || visualStyles[(day + plan.length) % visualStyles.length];
    const visual = `${baseVisual} Visual focus: ${angle.toLowerCase()}.`;

    plan.push({
      date,
      day,
      channel,
      format,
      angle,
      title: campaign.title,
      caption,
      visual,
      cta: `${campaign.cta} | WhatsApp 011-2312 8188 | Sothys Setia City Mall (Level 1, L1-119)`,
    });
  }

  currentPlan = plan;
  renderCalendar(year, monthIndex, daysInMonth, plan);
  renderTable(plan);
  monthLabel.textContent = monthName(year, monthIndex);
  postCount.textContent = `${plan.length} posts`;
}

function renderCalendar(year, monthIndex, daysInMonth, plan) {
  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const planByDay = new Map(plan.map((item) => [item.day, item]));

  for (let i = 0; i < mondayOffset; i += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const item = planByDay.get(day);
    const cell = document.createElement("article");
    cell.className = "day-cell";

    cell.innerHTML = item
      ? `<div class="date-num"><span>${day}</span><span class="type-pill">${escapeHtml(item.channel)}</span></div>
         <p class="day-title">${escapeHtml(item.title)}</p>
         <p class="day-meta">${escapeHtml(item.format)}<br>${escapeHtml(item.angle)}</p>`
      : `<div class="date-num"><span>${day}</span></div>
         <p class="day-meta">No scheduled post</p>`;

    calendarGrid.appendChild(cell);
  }
}

function renderTable(plan) {
  planTable.innerHTML = "";

  plan.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }))}</td>
      <td>${escapeHtml(item.channel)}<br>${escapeHtml(item.format)}</td>
      <td>${escapeHtml(item.angle)}</td>
      <td><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.caption)}<br><br>Brand focus: ${escapeHtml(focusInput.value)}</td>
      <td>${escapeHtml(item.visual)}</td>
      <td>${escapeHtml(item.cta)}</td>
    `;
    planTable.appendChild(tr);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

function planToText() {
  return currentPlan
    .map((item) => {
      const date = item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      return `${date}\nChannel: ${item.channel}\nFormat: ${item.format}\nAngle: ${item.angle}\nCaption: ${item.caption}\nVisual: ${item.visual}\nCTA: ${item.cta}`;
    })
    .join("\n\n---\n\n");
}

function downloadCsv() {
  const header = ["Date", "Channel", "Format", "Angle", "Caption", "Visual Direction", "CTA"];
  const rows = currentPlan.map((item) => [
    item.date.toLocaleDateString("en-GB"),
    item.channel,
    item.format,
    item.angle,
    item.caption,
    item.visual,
    item.cta,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sothys-content-plan-${monthInput.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV 已导出");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Some local preview environments expose Clipboard API but block writes.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

newItemButton.addEventListener("click", clearItemForm);

saveItemButton.addEventListener("click", async () => {
  const item = collectItemForm();
  if (!item) return;

  const existingIndex = contentItems.findIndex((contentItem) => contentItem.id === item.id);
  if (existingIndex >= 0) {
    contentItems[existingIndex] = item;
  } else {
    contentItems.push(item);
  }

  const savedToCloud = await saveContentItems();
  refreshCampaignOptions(item.id);
  renderLibraryList();
  clearItemForm();
  campaignInput.value = item.id;
  makePlan();
  showToast(savedToCloud ? "内容库已云端保存" : "内容库已本机保存");
});

libraryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = contentItems.find((contentItem) => contentItem.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "edit") {
    fillItemForm(item);
    showToast("可以编辑这个内容");
    return;
  }

  if (contentItems.length === 1) {
    showToast("至少保留一个内容");
    return;
  }

  contentItems = contentItems.filter((contentItem) => contentItem.id !== item.id);
  saveContentItems();
  refreshCampaignOptions();
  renderLibraryList();
  makePlan();
  showToast("内容已删除");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  makePlan();
  showToast("内容日历已生成");
});

copyButton.addEventListener("click", async () => {
  if (!currentPlan.length) makePlan();
  const copied = await copyText(planToText());
  showToast(copied ? "已复制整个月内容" : "复制受限，请手动选择表格内容");
});

csvButton.addEventListener("click", () => {
  if (!currentPlan.length) makePlan();
  downloadCsv();
});

refreshCampaignOptions("firstTrial");
renderLibraryList();
makePlan();
loadCloudContentItems();
