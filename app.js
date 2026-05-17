const elements = {
  setupView: document.querySelector("#setupView"),
  appView: document.querySelector("#appView"),
  mobileControls: document.querySelector(".mobile-controls"),
  basicSetupTab: document.querySelector("#basicSetupTab"),
  teacherSetupTab: document.querySelector("#teacherSetupTab"),
  setupTitleInput: document.querySelector("#setupTitleInput"),
  previousResultSelect: document.querySelector("#previousResultSelect"),
  setupRowCount: document.querySelector("#setupRowCount"),
  setupColCount: document.querySelector("#setupColCount"),
  setupFitBtn: document.querySelector("#setupFitBtn"),
  setupSeatSummary: document.querySelector("#setupSeatSummary"),
  permanentMemberSelect: document.querySelector("#permanentMemberSelect"),
  clearEmptySeatsBtn: document.querySelector("#clearEmptySeatsBtn"),
  clearPermanentSeatsBtn: document.querySelector("#clearPermanentSeatsBtn"),
  formationPreview: document.querySelector("#formationPreview"),
  permanentSeatPreview: document.querySelector("#permanentSeatPreview"),
  memberNameInput: document.querySelector("#memberNameInput"),
  addMemberBtn: document.querySelector("#addMemberBtn"),
  setupSampleBtn: document.querySelector("#setupSampleBtn"),
  setupClearMembersBtn: document.querySelector("#setupClearMembersBtn"),
  resetSavedDataBtn: document.querySelector("#resetSavedDataBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  memberList: document.querySelector("#memberList"),
  memberCountLabel: document.querySelector("#memberCountLabel"),
  frontPriorityButtons: document.querySelector("#frontPriorityButtons"),
  setupStudentNames: document.querySelector("#setupStudentNames"),
  applyBulkMembersBtn: document.querySelector("#applyBulkMembersBtn"),
  saveSetupBtn: document.querySelector("#saveSetupBtn"),
  openSetupBtn: document.querySelector("#openSetupBtn"),
  studentNames: document.querySelector("#studentNames"),
  rowCount: document.querySelector("#rowCount"),
  colCount: document.querySelector("#colCount"),
  emptyCount: document.querySelector("#emptyCount"),
  titleInput: document.querySelector("#titleInput"),
  frontRowSummary: document.querySelector("#frontRowSummary"),
  frontTwoRowsSummary: document.querySelector("#frontTwoRowsSummary"),
  avoidAdjacentSummary: document.querySelector("#avoidAdjacentSummary"),
  animateShuffle: document.querySelector("#animateShuffle"),
  soundVolume: document.querySelector("#soundVolume"),
  startShuffleBtn: document.querySelector("#startShuffleBtn"),
  sampleBtn: document.querySelector("#sampleBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  pngBtn: document.querySelector("#pngBtn"),
  svgBtn: document.querySelector("#svgBtn"),
  csvBtn: document.querySelector("#csvBtn"),
  printBtn: document.querySelector("#printBtn"),
  confirmResultBtn: document.querySelector("#confirmResultBtn"),
  savedResultsCount: document.querySelector("#savedResultsCount"),
  savedResultsList: document.querySelector("#savedResultsList"),
  slideArea: document.querySelector("#slideArea"),
  shuffleOverlay: document.querySelector("#shuffleOverlay"),
  seatGrid: document.querySelector("#seatGrid"),
  seatTemplate: document.querySelector("#seatTemplate"),
  slideTitle: document.querySelector("#slideTitle"),
  countLabel: document.querySelector("#countLabel"),
  dateLabel: document.querySelector("#dateLabel"),
  conditionDialog: document.querySelector("#conditionDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogHint: document.querySelector("#dialogHint"),
  memberButtons: document.querySelector("#memberButtons"),
  selectedPreview: document.querySelector("#selectedPreview"),
  groupActions: document.querySelector("#groupActions"),
  addGroupBtn: document.querySelector("#addGroupBtn"),
  clearSelectionBtn: document.querySelector("#clearSelectionBtn"),
  groupList: document.querySelector("#groupList"),
  clearConditionBtn: document.querySelector("#clearConditionBtn"),
  saveConditionBtn: document.querySelector("#saveConditionBtn"),
};

const STORAGE_KEY = "seat-shuffle-app:v1";

const sampleNames = [
  "青木 はる",
  "石田 蓮",
  "上田 美月",
  "遠藤 湊",
  "大野 結衣",
  "加藤 陽向",
  "木村 咲良",
  "小林 悠真",
  "佐藤 凛",
  "清水 葵",
  "高橋 蒼",
  "田中 紬",
  "中村 旭",
  "西村 心春",
  "橋本 樹",
  "林 朱莉",
  "藤井 颯",
  "前田 柚希",
  "松本 澪",
  "森 翔太",
  "山口 琴音",
  "吉田 陽菜",
  "渡辺 陸",
  "井上 結月",
  "斎藤 新",
  "岡田 ひまり",
  "村上 奏",
  "近藤 芽依",
  "長谷川 碧",
  "福田 栞",
];

const state = {
  members: [],
  emptySeats: new Set(),
  permanentSeats: new Map(),
  frontPriority: new Set(),
  previousResultId: "",
  formationMode: "empty",
  teacherPassword: "",
  teacherUnlocked: false,
  seats: [],
  locked: new Set(),
  savedResults: [],
  viewingSavedResult: false,
  savedResultView: null,
  dragIndex: null,
  shuffleTimer: null,
  drumrollAudio: null,
  finishAudio: null,
  soundVolume: 0.45,
  activeCondition: null,
  modalSelection: new Set(),
  modalGroups: [],
  isAnimatingShuffle: false,
  conditions: {
    frontRow: new Set(),
    frontTwoRows: new Set(),
    avoidAdjacent: [],
  },
  isRestoring: false,
};

function serializeState() {
  return {
    members: state.members,
    emptySeats: [...state.emptySeats],
    permanentSeats: [...state.permanentSeats.entries()],
    frontPriority: [...state.frontPriority],
    savedResults: state.savedResults,
    conditions: {
      frontRow: [...state.conditions.frontRow],
      frontTwoRows: [...state.conditions.frontTwoRows],
      avoidAdjacent: state.conditions.avoidAdjacent,
    },
    settings: {
      title: elements.setupTitleInput.value,
      rows: elements.setupRowCount.value,
      cols: elements.setupColCount.value,
      teacherPassword: state.teacherPassword,
      previousResultId: state.previousResultId,
      soundVolume: state.soundVolume,
    },
  };
}

function saveData() {
  if (state.isRestoring) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
  } catch (error) {
    console.warn("保存に失敗しました。", error);
  }
}

function restoreData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    state.isRestoring = true;
    state.members = Array.isArray(saved.members) ? saved.members : [];
    state.emptySeats = new Set(Array.isArray(saved.emptySeats) ? saved.emptySeats : []);
    state.permanentSeats = new Map(Array.isArray(saved.permanentSeats) ? saved.permanentSeats : []);
    state.frontPriority = new Set(Array.isArray(saved.frontPriority) ? saved.frontPriority : []);
    state.savedResults = Array.isArray(saved.savedResults) ? saved.savedResults : [];
    state.conditions.frontRow = new Set(saved.conditions?.frontRow || []);
    state.conditions.frontTwoRows = new Set(saved.conditions?.frontTwoRows || []);
    state.conditions.avoidAdjacent = Array.isArray(saved.conditions?.avoidAdjacent) ? saved.conditions.avoidAdjacent : [];
    elements.setupTitleInput.value = saved.settings?.title || "3年A組 席替え";
    elements.setupRowCount.value = saved.settings?.rows || "5";
    elements.setupColCount.value = saved.settings?.cols || "6";
    state.teacherPassword = saved.settings?.teacherPassword || "";
    state.previousResultId = saved.settings?.previousResultId || "";
    state.soundVolume = Number.isFinite(Number(saved.settings?.soundVolume)) ? Number(saved.settings.soundVolume) : 0.45;
    elements.soundVolume.value = String(Math.round(state.soundVolume * 100));
    elements.setupStudentNames.value = state.members.join("\n");
    state.isRestoring = false;
    syncControlsFromSetup();
    syncSetupNumbersToMain();
    return true;
  } catch (error) {
    state.isRestoring = false;
    console.warn("保存データの読み込みに失敗しました。", error);
    return false;
  }
}

function resetSavedData() {
  if (!window.confirm("保存データを削除してサンプル状態に戻しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  state.emptySeats.clear();
  state.permanentSeats.clear();
  state.frontPriority.clear();
  state.locked.clear();
  state.savedResults = [];
  state.viewingSavedResult = false;
  state.teacherPassword = "";
  state.teacherUnlocked = false;
  state.conditions.frontRow.clear();
  state.conditions.frontTwoRows.clear();
  state.conditions.avoidAdjacent = [];
  setMembers(sampleNames);
  elements.setupTitleInput.value = "3年A組 席替え";
  state.previousResultId = "";
  state.soundVolume = 0.45;
  elements.soundVolume.value = "45";
  elements.setupRowCount.value = "5";
  elements.setupColCount.value = "6";
  syncControlsFromSetup();
  syncSetupNumbersToMain();
  renderSetup();
  render();
  saveData();
}

function exportSavedData() {
  saveData();
  const payload = localStorage.getItem(STORAGE_KEY) || JSON.stringify(serializeState());
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(`seat-shuffle-data-${date}.json`, new Blob([payload], { type: "application/json;charset=utf-8" }));
}

function applyImportedData(saved) {
  state.isRestoring = true;
  state.members = Array.isArray(saved.members) ? saved.members : [];
  state.emptySeats = new Set(Array.isArray(saved.emptySeats) ? saved.emptySeats : []);
  state.permanentSeats = new Map(Array.isArray(saved.permanentSeats) ? saved.permanentSeats : []);
  state.frontPriority = new Set(Array.isArray(saved.frontPriority) ? saved.frontPriority : []);
  state.savedResults = Array.isArray(saved.savedResults) ? saved.savedResults : [];
  state.conditions.frontRow = new Set(saved.conditions?.frontRow || []);
  state.conditions.frontTwoRows = new Set(saved.conditions?.frontTwoRows || []);
  state.conditions.avoidAdjacent = Array.isArray(saved.conditions?.avoidAdjacent) ? saved.conditions.avoidAdjacent : [];
  state.teacherPassword = saved.settings?.teacherPassword || "";
  state.previousResultId = saved.settings?.previousResultId || "";
  elements.setupTitleInput.value = saved.settings?.title || "3年A組 席替え";
  elements.setupRowCount.value = saved.settings?.rows || "5";
  elements.setupColCount.value = saved.settings?.cols || "6";
  elements.setupStudentNames.value = state.members.join("\n");
  state.isRestoring = false;
  syncControlsFromSetup();
  syncSetupNumbersToMain();
  renderSetup();
  render();
  saveData();
}

function importSavedData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const saved = JSON.parse(String(reader.result || "{}"));
      if (!saved || !Array.isArray(saved.members)) {
        window.alert("保存データの形式が正しくありません。");
        return;
      }
      if (!window.confirm("現在の保存データを読み込んだデータで置き換えますか？")) return;
      applyImportedData(saved);
      window.alert("保存データを読み込みました。");
    } catch (error) {
      window.alert("保存データの読み込みに失敗しました。");
    } finally {
      elements.importDataInput.value = "";
    }
  });
  reader.readAsText(file, "utf-8");
}

function getNames() {
  return state.members;
}

function parseNames(value) {
  return value
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function getConstraintSettings() {
  const previousResultSidePairs = getPreviousResultSidePairs();
  return {
    frontRow: new Set([...state.conditions.frontRow].filter((name) => getNames().includes(name))),
    frontTwoRows: new Set([
      ...[...state.frontPriority].filter((name) => getNames().includes(name)),
      ...[...state.conditions.frontTwoRows].filter((name) => getNames().includes(name)),
    ]),
    avoidGroups: state.conditions.avoidAdjacent
      .map((group) => group.filter((name) => getNames().includes(name)).slice(0, 5))
      .filter((group) => group.length >= 2),
    previousResultSidePairs,
  };
}

function getPreviousResultSidePairs() {
  const result = state.savedResults.find((item) => item.id === state.previousResultId);
  if (!result) return [];
  const cols = Number(result.cols) || 1;
  const pairs = [];
  (result.seats || []).forEach((name, index, seats) => {
    if (!name || index % cols === cols - 1) return;
    const rightName = seats[index + 1];
    if (rightName) pairs.push([name, rightName]);
  });
  return pairs;
}

function syncControlsFromSetup() {
  elements.titleInput.value = elements.setupTitleInput.value;
  elements.rowCount.value = elements.setupRowCount.value;
  elements.colCount.value = elements.setupColCount.value;
  elements.emptyCount.value = `${state.emptySeats.size}席`;
  elements.studentNames.value = state.members.join("\n");
}

function syncSetupFromControls() {
  elements.setupTitleInput.value = elements.titleInput.value;
  elements.setupRowCount.value = elements.rowCount.value;
  elements.setupColCount.value = elements.colCount.value;
  state.members = parseNames(elements.studentNames.value);
  elements.setupStudentNames.value = state.members.join("\n");
}

function setMembers(names) {
  const seen = new Set();
  state.members = names
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  elements.studentNames.value = state.members.join("\n");
  elements.setupStudentNames.value = state.members.join("\n");
  state.seats = state.seats.filter((name) => !name || state.members.includes(name));
  [...state.permanentSeats.entries()].forEach(([index, name]) => {
    if (!state.members.includes(name)) state.permanentSeats.delete(index);
  });
  state.frontPriority = new Set([...state.frontPriority].filter((name) => state.members.includes(name)));
  renderSetup();
  render();
}

function addMember(name) {
  const trimmed = name.trim();
  if (!trimmed || state.members.includes(trimmed)) return;
  setMembers([...state.members, trimmed]);
}

function removeMember(name) {
  setMembers(state.members.filter((member) => member !== name));
  Object.entries(state.conditions).forEach(([key, value]) => {
    if (value instanceof Set) {
      value.delete(name);
    } else {
      state.conditions[key] = value
        .map((group) => group.filter((member) => member !== name))
        .filter((group) => group.length >= 2);
    }
  });
}

function syncSetupNumbersToMain() {
  elements.rowCount.value = elements.setupRowCount.value;
  elements.colCount.value = elements.setupColCount.value;
  clampSettings();
  elements.setupRowCount.value = elements.rowCount.value;
  elements.setupColCount.value = elements.colCount.value;
  trimFormationState();
  elements.emptyCount.value = `${state.emptySeats.size}席`;
}

function trimFormationState() {
  const count = getSeatCount();
  state.emptySeats = new Set([...state.emptySeats].filter((index) => index < count));
  [...state.permanentSeats.keys()].forEach((index) => {
    if (index >= count || state.emptySeats.has(index)) state.permanentSeats.delete(index);
  });
}

function toggleEmptySeat(index) {
  if (state.emptySeats.has(index)) {
    state.emptySeats.delete(index);
  } else {
    state.emptySeats.add(index);
    state.permanentSeats.delete(index);
    state.locked.delete(index);
  }
  syncSetupNumbersToMain();
  renderSetup();
  render();
}

function setPermanentSeat(index) {
  const name = elements.permanentMemberSelect.value;
  if (!name) return;
  if (state.permanentSeats.get(index) === name) {
    state.permanentSeats.delete(index);
  } else {
    [...state.permanentSeats.entries()].forEach(([seatIndex, seatName]) => {
      if (seatName === name) state.permanentSeats.delete(seatIndex);
    });
    state.emptySeats.delete(index);
    state.permanentSeats.set(index, name);
    state.locked.add(index);
  }
  syncSetupNumbersToMain();
  renderSetup();
  render();
}

function handleFormationSeatClick(index) {
  toggleEmptySeat(index);
}

function renderFormationPreview() {
  const rows = Number(elements.setupRowCount.value) || 1;
  const cols = Number(elements.setupColCount.value) || 1;
  const seats = rows * cols;
  elements.formationPreview.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  elements.formationPreview.replaceChildren();
  renderPermanentMemberSelect();
  Array.from({ length: seats }).forEach((_, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "formation-cell";
    if (state.emptySeats.has(index)) cell.classList.add("empty");
    cell.innerHTML = `<span>${index + 1}</span><strong>${state.emptySeats.has(index) ? "空席" : ""}</strong>`;
    cell.addEventListener("click", () => handleFormationSeatClick(index));
    elements.formationPreview.append(cell);
  });
  elements.setupSeatSummary.textContent = `${state.members.length}人 / ${seats - state.emptySeats.size}席`;
  renderPermanentSeatPreview(rows, cols, seats);
}

function renderPermanentMemberSelect() {
  const current = elements.permanentMemberSelect.value;
  elements.permanentMemberSelect.replaceChildren();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "固定する人を選択";
  elements.permanentMemberSelect.append(empty);
  state.members.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    elements.permanentMemberSelect.append(option);
  });
  elements.permanentMemberSelect.value = state.members.includes(current) ? current : "";
}

function renderPermanentSeatPreview(rows, cols, seats) {
  elements.permanentSeatPreview.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  elements.permanentSeatPreview.replaceChildren();
  Array.from({ length: seats }).forEach((_, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "formation-cell";
    if (state.emptySeats.has(index)) cell.classList.add("empty");
    if (state.permanentSeats.has(index)) cell.classList.add("permanent");
    cell.disabled = state.emptySeats.has(index);
    cell.innerHTML = `<span>${index + 1}</span><strong>${state.permanentSeats.get(index) || (state.emptySeats.has(index) ? "空席" : "")}</strong>`;
    cell.addEventListener("click", () => setPermanentSeat(index));
    elements.permanentSeatPreview.append(cell);
  });
}

function renderMemberList() {
  elements.memberList.replaceChildren();
  elements.memberCountLabel.textContent = `${state.members.length}人`;
  if (!state.members.length) {
    const empty = document.createElement("p");
    empty.className = "field-hint";
    empty.textContent = "メンバーを追加してください。";
    elements.memberList.append(empty);
    return;
  }
  state.members.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "member-item";
    const number = document.createElement("span");
    number.className = "member-number";
    number.textContent = String(index + 1);
    const label = document.createElement("span");
    label.textContent = name;
    const remove = document.createElement("button");
    remove.className = "ghost";
    remove.type = "button";
    remove.textContent = "削除";
    remove.addEventListener("click", () => removeMember(name));
    item.append(number, label, remove);
    elements.memberList.append(item);
  });
}

function renderFrontPriorityButtons() {
  elements.frontPriorityButtons.replaceChildren();
  if (!state.members.length) {
    const empty = document.createElement("p");
    empty.className = "field-hint";
    empty.textContent = "メンバーを追加してください。";
    elements.frontPriorityButtons.append(empty);
    return;
  }
  state.members.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "member-choice";
    button.classList.toggle("selected", state.frontPriority.has(name));
    button.textContent = displayName(name);
    button.title = name;
    button.addEventListener("click", () => {
      if (state.frontPriority.has(name)) state.frontPriority.delete(name);
      else state.frontPriority.add(name);
      renderSetup();
      render();
    });
    elements.frontPriorityButtons.append(button);
  });
}

function renderSetup() {
  renderFormationPreview();
  renderMemberList();
  renderFrontPriorityButtons();
  renderPreviousResultSelect();
}

function renderPreviousResultSelect() {
  const current = state.previousResultId;
  elements.previousResultSelect.replaceChildren();
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "指定しない";
  elements.previousResultSelect.append(none);
  state.savedResults.forEach((result) => {
    const option = document.createElement("option");
    option.value = result.id;
    option.textContent = result.name;
    elements.previousResultSelect.append(option);
  });
  const exists = state.savedResults.some((result) => result.id === current);
  elements.previousResultSelect.value = exists ? current : "";
  state.previousResultId = elements.previousResultSelect.value;
}

function getDisplayEmptySeats() {
  return state.viewingSavedResult && state.savedResultView ? state.savedResultView.emptySeats : state.emptySeats;
}

function getDisplayPermanentSeats() {
  return state.viewingSavedResult && state.savedResultView ? state.savedResultView.permanentSeats : state.permanentSeats;
}

function makeResultSnapshot(name) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    savedAt: new Date().toISOString(),
    title: elements.titleInput.value || "席替え",
    rows: Number(elements.rowCount.value),
    cols: Number(elements.colCount.value),
    seats: [...state.seats],
    emptySeats: [...state.emptySeats],
    permanentSeats: [...state.permanentSeats.entries()],
  };
}

function confirmCurrentResult() {
  render();
  const defaultName = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const name = window.prompt("この席替え結果の名前を入力してください。", defaultName);
  if (!name || !name.trim()) return;
  state.savedResults.unshift(makeResultSnapshot(name.trim()));
  renderSavedResults();
  saveData();
}

function viewSavedResult(resultId) {
  const result = state.savedResults.find((item) => item.id === resultId);
  if (!result) return;
  state.viewingSavedResult = true;
  state.savedResultView = {
    emptySeats: new Set(result.emptySeats || []),
    permanentSeats: new Map(result.permanentSeats || []),
  };
  elements.rowCount.value = result.rows || elements.rowCount.value;
  elements.colCount.value = result.cols || elements.colCount.value;
  elements.titleInput.value = result.title || "席替え";
  state.seats = [...(result.seats || [])];
  render();
}

function deleteSavedResult(resultId) {
  state.savedResults = state.savedResults.filter((item) => item.id !== resultId);
  renderSavedResults();
  saveData();
}

function renderSavedResults() {
  elements.savedResultsList.replaceChildren();
  elements.savedResultsCount.textContent = `${state.savedResults.length}件`;
  if (!state.savedResults.length) {
    const empty = document.createElement("p");
    empty.className = "field-hint";
    empty.textContent = "保存された結果はまだありません。";
    elements.savedResultsList.append(empty);
    return;
  }
  state.savedResults.forEach((result) => {
    const item = document.createElement("div");
    item.className = "saved-result-item";
    const meta = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = result.name;
    const date = document.createElement("span");
    date.textContent = new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(result.savedAt));
    meta.append(title, date);
    const actions = document.createElement("div");
    actions.className = "saved-result-actions";
    const view = document.createElement("button");
    view.type = "button";
    view.textContent = "表示";
    view.addEventListener("click", () => viewSavedResult(result.id));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost";
    remove.textContent = "削除";
    remove.addEventListener("click", () => deleteSavedResult(result.id));
    actions.append(view, remove);
    item.append(meta, actions);
    elements.savedResultsList.append(item);
  });
}

function showSetup() {
  if (state.viewingSavedResult) syncControlsFromSetup();
  state.viewingSavedResult = false;
  state.savedResultView = null;
  syncSetupFromControls();
  elements.setupView.classList.remove("is-hidden");
  elements.appView.classList.add("is-hidden");
  state.teacherUnlocked = false;
  switchSetupTab("basic");
  renderSetup();
}

function showApp() {
  state.viewingSavedResult = false;
  state.savedResultView = null;
  syncControlsFromSetup();
  elements.setupView.classList.add("is-hidden");
  elements.appView.classList.remove("is-hidden");
  state.teacherUnlocked = false;
  renderSetup();
  render();
}

function requestTeacherUnlock() {
  if (!state.teacherPassword) {
    const created = window.prompt("先生用パスワードを設定してください。");
    if (!created) return false;
    const confirmPassword = window.prompt("確認のため、もう一度入力してください。");
    if (created !== confirmPassword) {
      window.alert("パスワードが一致しません。");
      return false;
    }
    state.teacherPassword = created;
    state.teacherUnlocked = true;
    saveData();
    return true;
  }

  const password = window.prompt("先生用パスワードを入力してください。");
  if (password !== state.teacherPassword) {
    window.alert("パスワードが違います。");
    return false;
  }
  state.teacherUnlocked = true;
  return true;
}

function switchSetupTab(tabName) {
  const isTeacher = tabName === "teacher";
  if (isTeacher) state.teacherUnlocked = false;
  if (isTeacher && !requestTeacherUnlock()) {
    tabName = "basic";
  }
  const showTeacher = tabName === "teacher";
  elements.basicSetupTab.classList.toggle("is-hidden", showTeacher);
  elements.teacherSetupTab.classList.toggle("is-hidden", !showTeacher);
  document.querySelectorAll("[data-setup-tab]").forEach((node) => {
    node.classList.toggle("active", node.dataset.setupTab === tabName);
  });
  renderSetup();
}

function getSeatCount() {
  return Number(elements.rowCount.value) * Number(elements.colCount.value);
}

function displayName(name) {
  return name || "";
}

function clampSettings() {
  const rows = Math.min(10, Math.max(1, Number(elements.rowCount.value) || 1));
  const cols = Math.min(12, Math.max(1, Number(elements.colCount.value) || 1));
  const seats = rows * cols;

  elements.rowCount.value = rows;
  elements.colCount.value = cols;
  trimFormationState();
  elements.emptyCount.value = `${state.emptySeats.size}席`;
}

function ensureSeatArray() {
  clampSettings();
  const count = getSeatCount();
  const names = getNames();
  const current = state.seats.slice(0, count);
  const usedNames = new Set(current.filter(Boolean));
  const unplacedNames = names.filter((name) => !usedNames.has(name));

  state.seats = Array.from({ length: count }, (_, index) => {
    if (current[index]) return current[index];
    return unplacedNames.shift() || "";
  });
  state.locked = new Set([...state.locked].filter((index) => index < count));
  state.emptySeats.forEach((index) => {
    state.seats[index] = "";
  });
  if (!state.isAnimatingShuffle && !state.viewingSavedResult) {
    state.permanentSeats.forEach((name, index) => {
      if (index < count) state.seats[index] = name;
    });
  }
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function removeFirstMatch(items, value) {
  const index = items.indexOf(value);
  if (index >= 0) items.splice(index, 1);
}

function seatRow(index) {
  return Math.floor(index / Number(elements.colCount.value));
}

function seatCol(index) {
  return index % Number(elements.colCount.value);
}

function areAdjacent(indexA, indexB) {
  const rowA = seatRow(indexA);
  const rowB = seatRow(indexB);
  const colA = seatCol(indexA);
  const colB = seatCol(indexB);
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

function areSideBySide(indexA, indexB) {
  return seatRow(indexA) === seatRow(indexB) && Math.abs(seatCol(indexA) - seatCol(indexB)) === 1;
}

function isAllowedByFrontRule(name, seatIndex, constraints) {
  if (constraints.frontRow.has(name)) return seatRow(seatIndex) === 0;
  if (constraints.frontTwoRows.has(name)) return seatRow(seatIndex) <= 1;
  return true;
}

function makeConstraintPairs(groups) {
  const pairs = [];
  groups.forEach((group) => {
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        pairs.push([group[left], group[right]]);
      }
    }
  });
  return pairs;
}

function findSeatByName(seats, name) {
  return seats.findIndex((seatName) => seatName === name);
}

function scoreArrangement(seats, constraints) {
  let score = 0;

  seats.forEach((name, index) => {
    if (!name) return;
    if (constraints.frontRow.has(name) && seatRow(index) !== 0) score += 10000;
    if (constraints.frontTwoRows.has(name) && seatRow(index) > 1) score += 7000;
  });

  makeConstraintPairs(constraints.avoidGroups).forEach(([leftName, rightName]) => {
    const leftSeat = findSeatByName(seats, leftName);
    const rightSeat = findSeatByName(seats, rightName);
    if (leftSeat >= 0 && rightSeat >= 0 && areAdjacent(leftSeat, rightSeat)) score += 5000;
  });

  constraints.previousResultSidePairs.forEach(([leftName, rightName]) => {
    const leftSeat = findSeatByName(seats, leftName);
    const rightSeat = findSeatByName(seats, rightName);
    if (leftSeat >= 0 && rightSeat >= 0 && areSideBySide(leftSeat, rightSeat)) score += 5000;
  });

  return score;
}

function hasConstraintSettings(constraints) {
  return Boolean(
    constraints.frontRow.size ||
      constraints.frontTwoRows.size ||
      constraints.avoidGroups.length ||
      constraints.previousResultSidePairs.length,
  );
}

function summarizeNames(names) {
  if (!names.length) return "未設定";
  if (names.length <= 3) return names.join("、");
  return `${names.slice(0, 3).join("、")} ほか${names.length - 3}名`;
}

function summarizeGroups(groups, unitLabel) {
  if (!groups.length) return "未設定";
  const first = groups[0].join("・");
  return groups.length === 1 ? first : `${first} ほか${groups.length}${unitLabel}`;
}

function renderConditionSummaries() {
  const constraints = getConstraintSettings();
  elements.frontRowSummary.textContent = summarizeNames([...constraints.frontRow]);
  elements.frontTwoRowsSummary.textContent = summarizeNames([...constraints.frontTwoRows]);
  elements.avoidAdjacentSummary.textContent = summarizeGroups(constraints.avoidGroups, "組");
}

function getConditionMeta(type) {
  const metas = {
    frontRow: {
      title: "この人は前1列目",
      hint: "前の一列目に座ってほしい人を選びます。複数人選べます。",
      kind: "set",
      max: Infinity,
    },
    frontTwoRows: {
      title: "前1、2列のどこか",
      hint: "前から1列目か2列目に座ってほしい人を選びます。複数人選べます。",
      kind: "set",
      max: Infinity,
    },
    avoidAdjacent: {
      title: "前後左右で隣り合わない",
      hint: "2〜5人を選んで「グループ追加」。同じグループ内の人同士が前後左右で隣り合わないようにします。",
      kind: "group",
      min: 2,
      max: 5,
      addLabel: "グループ追加",
    },
  };
  return metas[type];
}

function openConditionDialog(type) {
  const meta = getConditionMeta(type);
  if (!meta) return;
  state.activeCondition = type;
  state.modalSelection = new Set(meta.kind === "set" ? state.conditions[type] : []);
  state.modalGroups = meta.kind === "group" ? state.conditions[type].map((group) => [...group]) : [];
  elements.dialogTitle.textContent = meta.title;
  elements.dialogHint.textContent = meta.hint;
  elements.addGroupBtn.textContent = meta.addLabel || "追加";
  elements.groupActions.hidden = meta.kind !== "group";
  renderConditionDialog();
  elements.conditionDialog.showModal();
}

function renderConditionDialog() {
  const meta = getConditionMeta(state.activeCondition);
  const names = getNames();
  const selected = [...state.modalSelection];
  elements.memberButtons.replaceChildren();
  elements.selectedPreview.replaceChildren();
  elements.groupList.replaceChildren();

  if (!names.length) {
    const empty = document.createElement("p");
    empty.className = "field-hint";
    empty.textContent = "先に名簿を入力してください。";
    elements.memberButtons.append(empty);
    return;
  }

  selected.forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "selected-chip";
    chip.textContent = `${name} ×`;
    chip.addEventListener("click", () => {
      state.modalSelection.delete(name);
      renderConditionDialog();
    });
    elements.selectedPreview.append(chip);
  });

  if (!selected.length) {
    const hint = document.createElement("span");
    hint.className = "empty-selection";
    hint.textContent = "対象者を選択";
    elements.selectedPreview.append(hint);
  }

  names.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "member-choice";
    button.classList.toggle("selected", state.modalSelection.has(name));
    button.textContent = displayName(name);
    button.title = name;
    button.addEventListener("click", () => toggleModalName(name));
    elements.memberButtons.append(button);
  });

  if (meta.kind === "group") {
    elements.addGroupBtn.disabled = selected.length < meta.min || selected.length > meta.max;
    state.modalGroups.forEach((group, index) => {
      const item = document.createElement("div");
      item.className = "group-item";
      const text = document.createElement("span");
      text.textContent = group.join("、");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "ghost";
      remove.textContent = "削除";
      remove.addEventListener("click", () => {
        state.modalGroups.splice(index, 1);
        renderConditionDialog();
      });
      item.append(text, remove);
      elements.groupList.append(item);
    });
  }
}

function toggleModalName(name) {
  const meta = getConditionMeta(state.activeCondition);
  if (state.modalSelection.has(name)) {
    state.modalSelection.delete(name);
  } else {
    if (meta.kind === "group" && state.modalSelection.size >= meta.max) return;
    state.modalSelection.add(name);
  }
  renderConditionDialog();
}

function addModalGroup() {
  const meta = getConditionMeta(state.activeCondition);
  const selected = [...state.modalSelection];
  if (!meta || meta.kind !== "group" || selected.length < meta.min || selected.length > meta.max) return;
  const key = selected.join("\u0000");
  const alreadyExists = state.modalGroups.some((group) => group.join("\u0000") === key);
  if (!alreadyExists) state.modalGroups.push(selected);
  state.modalSelection.clear();
  renderConditionDialog();
}

function saveConditionDialog() {
  const meta = getConditionMeta(state.activeCondition);
  if (!meta) return;
  if (meta.kind === "set") {
    state.conditions[state.activeCondition] = new Set(state.modalSelection);
  } else {
    state.conditions[state.activeCondition] = state.modalGroups.map((group) => [...group]);
  }
  render();
}

function clearActiveCondition() {
  const meta = getConditionMeta(state.activeCondition);
  if (!meta) return;
  if (meta.kind === "set") {
    state.modalSelection.clear();
  } else {
    state.modalSelection.clear();
    state.modalGroups = [];
  }
  renderConditionDialog();
}

function localPlacementPenalty(seats, name, seatIndex, constraints) {
  let score = 0;

  makeConstraintPairs(constraints.avoidGroups).forEach(([leftName, rightName]) => {
    if (name !== leftName && name !== rightName) return;
    const otherName = name === leftName ? rightName : leftName;
    const otherSeat = findSeatByName(seats, otherName);
    if (otherSeat >= 0 && areAdjacent(seatIndex, otherSeat)) score += 5000;
  });

  constraints.previousResultSidePairs.forEach(([leftName, rightName]) => {
    if (name !== leftName && name !== rightName) return;
    const otherName = name === leftName ? rightName : leftName;
    const otherSeat = findSeatByName(seats, otherName);
    if (otherSeat >= 0 && areSideBySide(seatIndex, otherSeat)) score += 5000;
  });

  return score + Math.random();
}

function buildConstrainedArrangement(pool, movableIndexes, fixedSeats, constraints) {
  const priority = (name) => {
    if (!name) return 3;
    if (constraints.frontRow.has(name)) return 0;
    if (constraints.frontTwoRows.has(name)) return 1;
    if (constraints.avoidGroups.some((group) => group.includes(name))) return 2;
    return 3;
  };
  const orderedNames = shuffleArray(pool).sort((left, right) => priority(left) - priority(right));
  const available = new Set(movableIndexes);
  const candidate = Array.from({ length: getSeatCount() }, (_, index) => fixedSeats.get(index) ?? "");

  orderedNames.forEach((name) => {
    const seats = [...available];
    const allowed = seats.filter((seatIndex) => isAllowedByFrontRule(name, seatIndex, constraints));
    const poolSeats = allowed.length ? allowed : seats;
    const ranked = poolSeats
      .map((seatIndex) => ({
        seatIndex,
        score: localPlacementPenalty(candidate, name, seatIndex, constraints),
      }))
      .sort((left, right) => left.score - right.score);
    const pickFrom = ranked.slice(0, Math.min(3, ranked.length));
    const picked = pickFrom[Math.floor(Math.random() * pickFrom.length)] || ranked[0];
    if (!picked) return;
    candidate[picked.seatIndex] = name;
    available.delete(picked.seatIndex);
  });

  return candidate;
}

function createBestArrangement(pool, movableIndexes, fixedSeats, constraints) {
  let bestSeats = null;
  let bestScore = Infinity;
  const hasConditions =
    hasConstraintSettings(constraints);
  const attempts = hasConditions ? 700 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = hasConditions
      ? buildConstrainedArrangement(pool, movableIndexes, fixedSeats, constraints)
      : Array.from({ length: getSeatCount() }, (_, index) => fixedSeats.get(index) ?? "");

    if (!hasConditions) {
      const shuffled = shuffleArray(pool);
      movableIndexes.forEach((seatIndex, listIndex) => {
        candidate[seatIndex] = shuffled[listIndex] || "";
      });
    }

    const score = scoreArrangement(candidate, constraints);
    if (score < bestScore) {
      bestSeats = candidate;
      bestScore = score;
      if (score === 0) break;
    }
  }

  return bestSeats;
}

function shuffleSeats() {
  if (state.viewingSavedResult) syncControlsFromSetup();
  state.viewingSavedResult = false;
  state.savedResultView = null;
  ensureSeatArray();
  const names = getNames();
  const seatCount = getSeatCount();
  const usableSeatCount = seatCount - state.emptySeats.size;
  const movablePool = names.slice(0, usableSeatCount);
  while (movablePool.length < usableSeatCount) movablePool.push("");
  const constraints = getConstraintSettings();

  const fixedSeats = new Map();
  state.emptySeats.forEach((index) => fixedSeats.set(index, ""));
  state.permanentSeats.forEach((name, index) => {
    fixedSeats.set(index, name);
    removeFirstMatch(movablePool, name);
  });
  state.locked.forEach((index) => {
    if (fixedSeats.has(index)) return;
    const fixedName = state.seats[index] || "";
    fixedSeats.set(index, fixedName);
    removeFirstMatch(movablePool, fixedName);
  });

  const movableIndexes = Array.from({ length: seatCount }, (_, index) => index).filter(
    (index) => !fixedSeats.has(index),
  );
  const nextSeats = createBestArrangement(movablePool, movableIndexes, fixedSeats, constraints);

  if (elements.animateShuffle.checked) {
    const animationIndexes = Array.from({ length: seatCount }, (_, index) => index).filter(
      (index) => !state.emptySeats.has(index),
    );
    playShuffleAnimation(nextSeats, animationIndexes);
    return;
  }

  state.seats = nextSeats;
  render();
}

function playShuffleAnimation(nextSeats, animationIndexes) {
  clearTimeout(state.shuffleTimer);
  elements.startShuffleBtn.disabled = true;
  state.isAnimatingShuffle = true;
  elements.slideArea.classList.add("is-shuffling");
  playShuffleSound();

  const originalSeats = [...state.seats];
  const rounds = 16;
  let round = 0;

  const tick = () => {
    const preview = [...originalSeats];
    const pool = shuffleArray(animationIndexes.map((index) => nextSeats[index]));
    animationIndexes.forEach((seatIndex, listIndex) => {
      preview[seatIndex] = pool[listIndex] || "";
    });
    state.seats = preview;
    render();
    elements.slideArea.classList.add("shuffle-spark");
    requestAnimationFrame(() => elements.slideArea.classList.remove("shuffle-spark"));

    round += 1;
    if (round < rounds) {
      state.shuffleTimer = setTimeout(tick, 105 + round * 30);
      return;
    }

    state.shuffleTimer = setTimeout(() => {
      state.isAnimatingShuffle = false;
      state.seats = nextSeats;
      render();
      playFinishSound();
      elements.slideArea.classList.remove("is-shuffling");
      elements.slideArea.classList.add("shuffle-reveal");
      elements.startShuffleBtn.disabled = false;
      state.shuffleTimer = setTimeout(() => {
        elements.slideArea.classList.remove("shuffle-reveal");
      }, 900);
    }, 180);
  };

  tick();
}

function getDrumrollAudio() {
  if (!state.drumrollAudio) {
    state.drumrollAudio = new Audio("./assets/drumroll.mp3");
    state.drumrollAudio.preload = "auto";
  }
  return state.drumrollAudio;
}

function getFinishAudio() {
  if (!state.finishAudio) {
    state.finishAudio = new Audio("./assets/finish.mp3");
    state.finishAudio.preload = "auto";
  }
  return state.finishAudio;
}

function unlockAudio() {
  getDrumrollAudio().load();
  getFinishAudio().load();
}

function playShuffleSound() {
  try {
    if (state.soundVolume <= 0) return;
    const audio = getDrumrollAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, state.soundVolume));
    audio.play().catch((error) => {
      console.warn("効果音を再生できませんでした。", error);
    });
  } catch (error) {
    console.warn("効果音を再生できませんでした。", error);
  }
}

function playFinishSound() {
  try {
    if (state.soundVolume <= 0) return;
    const drumroll = getDrumrollAudio();
    drumroll.pause();
    drumroll.currentTime = 0;
    const audio = getFinishAudio();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, state.soundVolume));
    audio.play().catch((error) => {
      console.warn("終了音を再生できませんでした。", error);
    });
  } catch (error) {
    console.warn("終了音を再生できませんでした。", error);
  }
}

function fitToNames() {
  const count = Math.max(1, getNames().length + state.emptySeats.size);
  const cols = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(count * 1.25))));
  const rows = Math.ceil(count / cols);
  elements.rowCount.value = rows;
  elements.colCount.value = cols;
  elements.setupRowCount.value = rows;
  elements.setupColCount.value = cols;
  state.locked.clear();
  shuffleSeats();
}

function render() {
  ensureSeatArray();
  const rows = Number(elements.rowCount.value);
  const cols = Number(elements.colCount.value);
  const names = getNames();
  const displayEmptySeats = getDisplayEmptySeats();
  const displayPermanentSeats = getDisplayPermanentSeats();

  elements.seatGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  elements.seatGrid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
  elements.seatGrid.replaceChildren();

  state.seats.forEach((name, index) => {
    const seat = elements.seatTemplate.content.firstElementChild.cloneNode(true);
    seat.dataset.index = String(index);
    seat.style.setProperty("--seat-index", index);
    seat.classList.toggle("empty", !name);
    seat.classList.toggle("locked", state.locked.has(index) && !displayPermanentSeats.has(index));
    seat.classList.toggle("permanent", displayPermanentSeats.has(index));
    seat.querySelector(".seat-number").textContent = `${index + 1}`;
    seat.querySelector(".seat-name").textContent = displayName(name) || "空席";
    seat.title = displayPermanentSeats.has(index)
      ? "初期設定で固定されています"
      : state.locked.has(index)
        ? "固定席を解除"
        : "この席を固定";
    elements.seatGrid.append(seat);
  });

  elements.slideTitle.textContent = elements.titleInput.value || "席替え";
  elements.countLabel.textContent = `${names.length}人`;
  elements.emptyCount.value = `${displayEmptySeats.size}席`;
  renderConditionSummaries();
  renderSavedResults();
  elements.dateLabel.textContent = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date());
  saveData();
}

function swapSeats(fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex === toIndex) return;
  if (
    state.emptySeats.has(fromIndex) ||
    state.emptySeats.has(toIndex) ||
    state.permanentSeats.has(fromIndex) ||
    state.permanentSeats.has(toIndex)
  ) {
    return;
  }
  [state.seats[fromIndex], state.seats[toIndex]] = [state.seats[toIndex], state.seats[fromIndex]];
  render();
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildSlideSvg() {
  const rows = Number(elements.rowCount.value);
  const cols = Number(elements.colCount.value);
  const width = 1600;
  const height = 900;
  const margin = 70;
  const headerHeight = 112;
  const boardHeight = 54;
  const footerHeight = 54;
  const gap = 18;
  const gridTop = margin + headerHeight + boardHeight + gap * 2;
  const gridHeight = height - gridTop - margin - footerHeight;
  const gridWidth = width - margin * 2;
  const cellGap = Math.max(10, 22 - Math.max(rows, cols));
  const cellWidth = (gridWidth - cellGap * (cols - 1)) / cols;
  const cellHeight = (gridHeight - cellGap * (rows - 1)) / rows;
  const title = escapeXml(elements.titleInput.value || "席替え");
  const date = escapeXml(elements.dateLabel.textContent);
  const displayPermanentSeats = getDisplayPermanentSeats();

  const seats = state.seats
    .map((name, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = margin + col * (cellWidth + cellGap);
      const y = gridTop + row * (cellHeight + cellGap);
      const locked = state.locked.has(index) || displayPermanentSeats.has(index);
      const fill = name ? (locked ? "#fff8e6" : "#ffffff") : "#f7faf9";
      const stroke = locked ? "#c48a2c" : "#c8d5d3";
      const label = escapeXml(displayName(name) || "空席");
      const fontSize = Math.max(22, Math.min(42, cellWidth / Math.max(4, label.length * 0.9)));
      return `
        <g>
          <rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
          <text x="${x + 18}" y="${y + 30}" fill="#687477" font-size="18" font-weight="700">${index + 1}</text>
          <text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + fontSize / 3}" text-anchor="middle" fill="#203033" font-size="${fontSize}" font-weight="800">${label}</text>
          ${locked ? `<circle cx="${x + cellWidth - 18}" cy="${y + 20}" r="7" fill="#c48a2c"/>` : ""}
        </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f7fbfa"/>
        <stop offset="0.58" stop-color="#f7f2e8"/>
        <stop offset="1" stop-color="#eef5f8"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#1a3337" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)"/>
    <circle cx="250" cy="150" r="170" fill="#157a6e" opacity="0.08"/>
    <text x="${margin}" y="84" fill="#0f5f56" font-size="22" font-weight="900">Seat Shuffle Board</text>
    <text x="${margin}" y="136" fill="#1e2728" font-size="52" font-weight="900">${title}</text>
    <text x="${width - margin}" y="116" text-anchor="end" fill="#687477" font-size="26" font-weight="700">${date}</text>
    <rect x="${margin}" y="${margin + headerHeight}" width="${gridWidth}" height="${boardHeight}" rx="14" fill="#26423d"/>
    <text x="${width / 2}" y="${margin + headerHeight + 36}" text-anchor="middle" fill="#f5fff8" font-size="27" font-weight="900">黒板</text>
    ${seats}
    <text x="${margin}" y="${height - 44}" fill="#687477" font-size="24" font-weight="700"></text>
    <text x="${width - margin}" y="${height - 44}" text-anchor="end" fill="#687477" font-size="24" font-weight="700">${getNames().length}人</text>
  </svg>`;
}

function exportSvg() {
  render();
  const svg = buildSlideSvg();
  downloadBlob("seat-shuffle-slide.svg", new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
}

function exportPng() {
  render();
  const svg = buildSlideSvg();
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob("seat-shuffle-slide.png", blob);
    }, "image/png");
  };
  image.src = url;
}

function exportCsv() {
  const cols = Number(elements.colCount.value);
  const displayPermanentSeats = getDisplayPermanentSeats();
  const lines = [["座席番号", "行", "列", "名前", "固定"]];
  state.seats.forEach((name, index) => {
    const fixedLabel = displayPermanentSeats.has(index) ? "常時固定" : state.locked.has(index) ? "固定" : "";
    lines.push([index + 1, Math.floor(index / cols) + 1, (index % cols) + 1, name, fixedLabel]);
  });
  const csv = lines
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadBlob("seat-shuffle.csv", new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
}

elements.seatGrid.addEventListener("click", (event) => {
  const seat = event.target.closest(".seat");
  if (!seat) return;
  const index = Number(seat.dataset.index);
  if (getDisplayPermanentSeats().has(index) || getDisplayEmptySeats().has(index)) return;
  if (state.locked.has(index)) state.locked.delete(index);
  else state.locked.add(index);
  render();
});

elements.seatGrid.addEventListener("dragstart", (event) => {
  const seat = event.target.closest(".seat");
  if (!seat) return;
  state.dragIndex = Number(seat.dataset.index);
  seat.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
});

elements.seatGrid.addEventListener("dragover", (event) => {
  const seat = event.target.closest(".seat");
  if (!seat) return;
  event.preventDefault();
  seat.classList.add("drop-target");
});

elements.seatGrid.addEventListener("dragleave", (event) => {
  event.target.closest(".seat")?.classList.remove("drop-target");
});

elements.seatGrid.addEventListener("drop", (event) => {
  const seat = event.target.closest(".seat");
  if (!seat) return;
  event.preventDefault();
  seat.classList.remove("drop-target");
  swapSeats(state.dragIndex, Number(seat.dataset.index));
});

elements.seatGrid.addEventListener("dragend", () => {
  state.dragIndex = null;
  document.querySelectorAll(".dragging, .drop-target").forEach((node) => {
    node.classList.remove("dragging", "drop-target");
  });
});

[
  elements.rowCount,
  elements.colCount,
  elements.emptyCount,
  elements.titleInput,
].forEach((element) => element.addEventListener("input", render));

elements.soundVolume.addEventListener("input", () => {
  state.soundVolume = Number(elements.soundVolume.value) / 100;
  saveData();
});

elements.studentNames.addEventListener("input", () => {
  setMembers(parseNames(elements.studentNames.value));
});
[
  elements.setupRowCount,
  elements.setupColCount,
].forEach((element) => {
  element.addEventListener("input", () => {
    syncSetupNumbersToMain();
    renderSetup();
    render();
  });
});
document.querySelectorAll("[data-formation-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.formationMode = button.dataset.formationMode;
    document.querySelectorAll("[data-formation-mode]").forEach((node) => {
      node.classList.toggle("active", node === button);
    });
  });
});
elements.clearEmptySeatsBtn.addEventListener("click", () => {
  state.emptySeats.clear();
  syncSetupNumbersToMain();
  renderSetup();
  render();
});
elements.clearPermanentSeatsBtn.addEventListener("click", () => {
  state.permanentSeats.clear();
  state.locked.clear();
  renderSetup();
  render();
});
[
  [elements.setupTitleInput, elements.titleInput],
].forEach(([setupElement, mainElement]) => {
  setupElement.addEventListener("input", () => {
    mainElement.value = setupElement.value;
    render();
  });
});
elements.previousResultSelect.addEventListener("change", () => {
  state.previousResultId = elements.previousResultSelect.value;
  render();
});
elements.addMemberBtn.addEventListener("click", () => {
  addMember(elements.memberNameInput.value);
  elements.memberNameInput.value = "";
  elements.memberNameInput.focus();
});
elements.memberNameInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  elements.addMemberBtn.click();
});
elements.applyBulkMembersBtn.addEventListener("click", () => {
  setMembers(parseNames(elements.setupStudentNames.value));
});
elements.setupSampleBtn.addEventListener("click", () => {
  setMembers(sampleNames);
  fitSetupToMembers();
});
elements.setupClearMembersBtn.addEventListener("click", () => {
  setMembers([]);
});
elements.resetSavedDataBtn.addEventListener("click", resetSavedData);
elements.exportDataBtn.addEventListener("click", exportSavedData);
elements.importDataInput.addEventListener("change", () => importSavedData(elements.importDataInput.files[0]));
elements.setupFitBtn.addEventListener("click", fitSetupToMembers);
elements.saveSetupBtn.addEventListener("click", showApp);
elements.openSetupBtn.addEventListener("click", showSetup);
document.querySelectorAll("[data-setup-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    switchSetupTab(button.dataset.setupTab);
  });
});
document.querySelectorAll("[data-condition]").forEach((button) => {
  button.addEventListener("click", () => openConditionDialog(button.dataset.condition));
});
elements.conditionDialog.addEventListener("close", () => {
  state.activeCondition = null;
  state.modalSelection.clear();
  state.modalGroups = [];
});
elements.saveConditionBtn.addEventListener("click", saveConditionDialog);
elements.clearConditionBtn.addEventListener("click", clearActiveCondition);
elements.addGroupBtn.addEventListener("click", addModalGroup);
elements.clearSelectionBtn.addEventListener("click", () => {
  state.modalSelection.clear();
  renderConditionDialog();
});
elements.startShuffleBtn.addEventListener("pointerdown", () => {
  unlockAudio();
});
elements.startShuffleBtn.addEventListener("click", shuffleSeats);
elements.sampleBtn.addEventListener("click", () => {
  setMembers(sampleNames);
  fitToNames();
});
elements.clearBtn.addEventListener("click", () => {
  setMembers([]);
});
elements.pngBtn.addEventListener("click", exportPng);
elements.svgBtn.addEventListener("click", exportSvg);
elements.csvBtn.addEventListener("click", exportCsv);
elements.printBtn.addEventListener("click", () => window.print());
elements.confirmResultBtn.addEventListener("click", confirmCurrentResult);

function syncMobileControls() {
  if (!elements.mobileControls) return;
  const mobileQuery = window.matchMedia("(max-width: 620px)");
  const summary = elements.mobileControls.querySelector("summary");
  const setCollapsed = (collapsed) => {
    elements.mobileControls.classList.toggle("is-mobile-collapsed", collapsed);
    if (summary) summary.textContent = collapsed ? "設定を開く" : "設定を閉じる";
  };
  const applyMode = () => {
    setCollapsed(mobileQuery.matches);
  };
  applyMode();
  summary?.addEventListener("click", (event) => {
    if (!mobileQuery.matches) return;
    event.preventDefault();
    setCollapsed(!elements.mobileControls.classList.contains("is-mobile-collapsed"));
  });
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", applyMode);
  } else {
    mobileQuery.addListener(applyMode);
  }
}

function fitSetupToMembers() {
  const count = Math.max(1, state.members.length + state.emptySeats.size);
  const cols = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(count * 1.25))));
  const rows = Math.ceil(count / cols);
  elements.setupRowCount.value = rows;
  elements.setupColCount.value = cols;
  syncSetupNumbersToMain();
  renderSetup();
  render();
}

if (!restoreData()) {
  setMembers(sampleNames);
  syncSetupNumbersToMain();
}
syncMobileControls();
renderSetup();
render();
