var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G;
const stageEl = document.getElementById("stage");
const readbackEl = document.getElementById("readback");
const billEl = document.getElementById("bill-view");
const logList = document.getElementById("log-list");
const sessionViewEl = document.getElementById("session-view");
const recordStatusEl = document.getElementById("record-status");
const dictationStatusEl = document.getElementById("dictation-status");
const voiceInputEl = document.getElementById("voice-input");
const boardBodyEl = document.getElementById("board-body");
const selectedTableStatusEl = document.getElementById("selected-table-status");
const dishTableBodyEl = document.getElementById("dish-table-body");
const menuCategoryBodyEl = document.getElementById("menu-category-body");
const menuFilterStatusEl = document.getElementById("menu-filter-status");
const checkoutModalEl = document.getElementById("checkout-modal");
const checkoutTableInputEl = document.getElementById("checkout-table-no");
const checkoutPreviewViewEl = document.getElementById("checkout-preview-view");
const cancelModalEl = document.getElementById("cancel-modal");
const cancelTableInputEl = document.getElementById("cancel-table-no");
const cancelPreviewViewEl = document.getElementById("cancel-preview-view");
const profitCurrentEl = document.getElementById("profit-current");
const profitPeriodValueEl = document.getElementById("profit-period-value");
const profitPeriodWeekBtnEl = document.getElementById("profit-period-week");
const profitPeriodMonthBtnEl = document.getElementById("profit-period-month");
const statsIncludeOpenEl = document.getElementById("stats-include-open");
const statsScopeNoteEl = document.getElementById("stats-scope-note");
const salesTrendChartEl = document.getElementById("sales-trend-chart");
const salesTrendYAxisEl = document.getElementById("sales-trend-yaxis");
const salesTrendCaptionEl = document.getElementById("sales-trend-caption");
const salesViewDailyBtnEl = document.getElementById("sales-view-daily");
const salesViewWeeklyBtnEl = document.getElementById("sales-view-weekly");
const voiceCommandTextEl = document.getElementById("voice-command-text");
const voiceCommandResultEl = document.getElementById("voice-command-result");
const voiceCommandRunBtnEl = document.getElementById("voice-command-run");
const dishAgentResultEl = document.getElementById("dish-agent-result");
const voiceDebugViewEl = document.getElementById("voice-debug-view");
const auditFilterTableEl = document.getElementById("audit-filter-table");
const auditFilterOperatorEl = document.getElementById("audit-filter-operator");
const auditTableBodyEl = document.getElementById("audit-table-body");
const historyFilterDateEl = document.getElementById("history-filter-date");
const historyPrintSelectedBtnEl = document.getElementById("history-print-selected-btn");
const historyOrderBodyEl = document.getElementById("history-order-body");
const historyItemBodyEl = document.getElementById("history-item-body");
const historySelectedStatusEl = document.getElementById("history-selected-status");
const singleActionBtnEl = document.getElementById("single-action-btn");
const singleActionStatusEl = document.getElementById("single-action-status");
const menuSingleBtnEl = document.getElementById("menu-single-btn");
const menuSingleStatusEl = document.getElementById("menu-single-status");
const menuVoicePreviewEl = document.getElementById("menu-voice-preview");
const menuOcrImageEl = document.getElementById("menu-ocr-image");
const menuOcrCaptureBtnEl = document.getElementById("menu-ocr-capture");
const menuOcrImportBtnEl = document.getElementById("menu-ocr-import");
const menuOcrNativeCaptureBtnEl = document.getElementById("menu-ocr-native-capture");
const menuOcrNativeStatusEl = document.getElementById("menu-ocr-native-status");
const menuOcrResultEl = document.getElementById("menu-ocr-result");
const menuOcrFileNameEl = document.getElementById("menu-ocr-file-name");
const menuOcrPreviewModalEl = document.getElementById("menu-ocr-preview-modal");
const menuOcrPreviewSummaryEl = document.getElementById("menu-ocr-preview-summary");
const menuOcrPreviewListEl = document.getElementById("menu-ocr-preview-list");
const menuOcrPreviewConfirmBtnEl = document.getElementById("menu-ocr-preview-confirm-btn");
const menuOcrPreviewCancelBtnEl = document.getElementById("menu-ocr-preview-cancel-btn");
const tnCyclicEnabledEl = document.getElementById("tn-cyclic-enabled");
const tnDineinPrefixEl = document.getElementById("tn-dinein-prefix");
const tnDineinStartEl = document.getElementById("tn-dinein-start");
const tnCyclicStartEl = document.getElementById("tn-cyclic-start");
const tnCyclicEndEl = document.getElementById("tn-cyclic-end");
const tnTakeoutEnabledEl = document.getElementById("tn-takeout-enabled");
const tnTakeoutPrefixEl = document.getElementById("tn-takeout-prefix");
const tnTakeoutStartEl = document.getElementById("tn-takeout-start");
const tnPreviewEl = document.getElementById("tn-preview");
const settingsCopyEnableRotationEl = document.getElementById("sc-enable-rotation");
const settingsCopyTableCountEl = document.getElementById("sc-table-count");
const settingsCopyTablePrefixEl = document.getElementById("sc-table-prefix");
const settingsCopyTakeoutPrefixEl = document.getElementById("sc-takeout-prefix");
const settingsCopyAsrLanguageEl = document.getElementById("sc-asr-language");
const settingsCopyVoiceCaptureModeEl = document.getElementById("sc-voice-capture-mode");
const settingsCopyAppDisplayLanguageEl = document.getElementById("sc-app-display-language");
const settingsResetTakeoutBtnEl = document.getElementById("settings-reset-takeout-btn");
const settingsClearMenuBtnEl = document.getElementById("settings-clear-menu-btn");
const settingsClearTablesBtnEl = document.getElementById("settings-clear-tables-btn");
const selectedOrderBodyEl = document.getElementById("selected-order-body");
const selectedTotalEl = document.getElementById("selected-total");
const selectedTotalLabelEl = document.getElementById("selected-total-label");
const selectedPrintBtnEl = document.getElementById("selected-print-btn");
const selectedCheckoutBtnEl = document.getElementById("selected-checkout-btn");
const boardSelectedColorEl = document.getElementById("board-selected-color");
const boardSelectedColorHexEl = document.getElementById("board-selected-color-hex");
const boardSelectedColorApplyEl = document.getElementById("board-selected-color-apply");
const boardSelectedColorResetEl = document.getElementById("board-selected-color-reset");
const boardSelectedPreviewEl = document.getElementById("board-selected-preview");
const topNoticeBtnEl = document.getElementById("top-notice-btn");
const topNoticeCloseEl = document.getElementById("top-notice-close");
const topNoticeClearEl = document.getElementById("top-notice-clear");
const topNoticePanelEl = document.getElementById("top-notice-panel");
const topNoticeListEl = document.querySelector(".top-notice-list");
const topSettingsBtnEl = document.getElementById("top-settings-btn");
const topProfileBtnEl = document.getElementById("top-profile-btn");
const baseSkinEl = document.getElementById("base-skin");
const previewFullSkinEl = document.getElementById("preview-full-skin");
const runtimeCompatSkinEl = document.getElementById("runtime-compat-skin");
const profileCurrentPlanEl = document.getElementById("profile-current-plan");
const profilePlanPickerEl = document.getElementById("profile-plan-picker");
const profileShowPlansBtnEl = document.getElementById("profile-show-plans-btn");
const profileHidePlansBtnEl = document.getElementById("profile-hide-plans-btn");
const profileLogoutBtnEl = document.getElementById("profile-logout-btn");
const profileNameRowEl = document.getElementById("profile-name-row");
const profileEditNameBtnEl = document.getElementById("profile-edit-name-btn");
const profileNameEditorEl = document.getElementById("profile-name-editor");
const profileNameInputEl = document.getElementById("profile-name-input");
const profileNameSaveBtnEl = document.getElementById("profile-name-save-btn");
const profileNameCancelBtnEl = document.getElementById("profile-name-cancel-btn");
const profileRoleChipEl = document.getElementById("profile-role-chip");
const profileAvatarEl = document.getElementById("profile-avatar");
const profileUserNameEl = document.getElementById("profile-user-name");
const profileUserSubtitleEl = document.getElementById("profile-user-subtitle");
const profilePhoneEl = document.getElementById("profile-phone");
const profileGatewayExpireEl = document.getElementById("profile-gateway-expire");
const profilePlanNameEl = document.getElementById("profile-plan-name");
const profilePlanDetailEl = document.getElementById("profile-plan-detail");
const actionFeedbackOverlayEl = document.getElementById("action-feedback-overlay");
const actionFeedbackBoxEl = document.getElementById("action-feedback-box");
const asrLiveOverlayEl = document.getElementById("asr-live-overlay");
const asrLiveTextEl = document.getElementById("asr-live-text");
const asrLiveHintEl = document.getElementById("asr-live-hint");
let asrLiveBarsEls = [];
const authKlsBaseUrlEl = document.getElementById("auth-kls-base-url");
const authPhoneEl = document.getElementById("auth-phone");
const authDeviceIdEl = document.getElementById("auth-device-id");
const authAppVersionEl = document.getElementById("auth-app-version");
const authPlatformEl = document.getElementById("auth-platform");
const authSmsPurposeEl = document.getElementById("auth-sms-purpose");
const authSmsCodeEl = document.getElementById("auth-sms-code");
const authAppIdEl = document.getElementById("auth-app-id");
const authSignSecretEl = document.getElementById("auth-sign-secret");
const authStatusViewEl = document.getElementById("auth-status-view");
const authLastResponseEl = document.getElementById("auth-last-response");
const klsBaseUrlEl = document.getElementById("kls-base-url");
const klsPhoneEl = document.getElementById("kls-phone");
const klsDeviceIdEl = document.getElementById("kls-device-id");
const klsAppVersionEl = document.getElementById("kls-app-version");
const klsPlatformEl = document.getElementById("kls-platform");
const klsRolloutKeyEl = document.getElementById("kls-rollout-key");
const klsSmsPurposeEl = document.getElementById("kls-sms-purpose");
const klsSmsCodeEl = document.getElementById("kls-sms-code");
const klsAppIdEl = document.getElementById("kls-app-id");
const klsSignSecretEl = document.getElementById("kls-sign-secret");
const klsAuthViewEl = document.getElementById("kls-auth-view");
const klsLastResponseEl = document.getElementById("kls-last-response");
const printerDeviceSelectEl = document.getElementById("printer-device-select");
const printerWidthMmEl = document.getElementById("printer-width-mm");
const printerItemFontSizeEl = document.getElementById("printer-item-font-size");
const printerAutoCheckoutEl = document.getElementById("printer-auto-checkout");
const printerStatusViewEl = document.getElementById("printer-status-view");
const MAIN_DEVICE_ID = "android-bbq-ui";
const BOARD_SELECTED_BG_DEFAULT = "#4888cb";
const BOARD_SELECTED_FG_LIGHT = "#715f3a";
const BOARD_SELECTED_FG_DARK = "#ffffff";
const BOARD_SELECTED_BG_STORAGE_KEY = "bbq.main.board.selected.bg";
const BOARD_SELECTED_BG_MIGRATION_KEY = "bbq.main.board.selected.bg.migrated.20260427";
const ASR_LANGUAGE_PREF_STORAGE_KEY = "bbq.settings.asr.language";
const VOICE_CAPTURE_MODE_STORAGE_KEY = "bbq.settings.voice.capture.mode";
const APP_DISPLAY_LANGUAGE_STORAGE_KEY = "bbq.settings.app.display.language";
const MENU_DISPLAY_I18N_STORAGE_KEY = "bbq.menu.display.i18n.map";
const ORDER_NOTE_I18N_STORAGE_KEY = "bbq.order.note.i18n.map";
const PRINTER_AUTO_CHECKOUT_STORAGE_KEY = "bbq.settings.printer.auto_checkout";
const PRINTER_ITEM_FONT_SIZE_STORAGE_KEY = "bbq.settings.printer.item_font_size";
const KLS_AUTH_STORAGE_KEY = "bbq.kls.auth.state";
const KLS_NOTIFICATION_DISMISSED_STORAGE_KEY_PREFIX = "bbq.kls.notifications.dismissed";
const APP_UPDATE_DISMISSED_VERSION_STORAGE_KEY = "bbq.app.update.dismissed.version";
const APP_UPDATE_OPENED_VERSION_STORAGE_KEY = "bbq.app.update.opened.version";
const APP_UPDATE_DEFAULT_LANDING_URL = "https://github.com/Alitaisname/bbq-android/releases";
const LEGACY_WEB_SPEECH_DEBUG_KEY = "bbq.debug.legacy_web_speech";
const LEGACY_WEB_SPEECH_FORCE_ON = String(window.__BBQ_ENABLE_LEGACY_WEB_SPEECH__ || "").trim() === "1";
const KLS_DEFAULT_BASE = (() => {
  var _a2, _b2;
  const host = String(((_a2 = window.location) == null ? void 0 : _a2.hostname) || "").trim();
  const protocol = ((_b2 = window.location) == null ? void 0 : _b2.protocol) === "https:" ? "https:" : "http:";
  if (!host) return "http://127.0.0.1:8100";
  if (/^(localhost|127\.0\.0\.1)$/i.test(host)) return "http://127.0.0.1:8100";
  return `${protocol}//${host}:8100`;
})();
const KLS_QUERY_BASE = (() => {
  try {
    const qs = new URLSearchParams(window.location.search || "");
    return normalizeApiBase(qs.get("kls_base") || "");
  } catch {
    return "";
  }
})();
if (typeof Promise.allSettled !== "function") {
  Promise.allSettled = function allSettledPolyfill(promises) {
    return Promise.all(Array.from(promises || []).map((item) => Promise.resolve(item).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    )));
  };
}
const DEV_PERSIST_AUTH = (() => {
  try {
    const qs = new URLSearchParams(window.location.search || "");
    return String(qs.get("dev_persist_auth") || "").trim() === "1";
  } catch {
    return false;
  }
})();
const APP_RUNTIME_PERSIST_AUTH = (() => {
  var _a2;
  const host = String(((_a2 = window.location) == null ? void 0 : _a2.hostname) || "").trim().toLowerCase();
  const embeddedHost = host === "127.0.0.1" || host === "localhost";
  const hasNativeBridge = Boolean(window.AndroidBridge || window.AndroidAppBridge || window.AndroidVoiceBridge || window.NativeMediaBridge);
  return embeddedHost || hasNativeBridge;
})();
const SHOULD_PERSIST_AUTH_LOCAL = DEV_PERSIST_AUTH || APP_RUNTIME_PERSIST_AUTH;
const DEV_INJECTED_ACCESS_TOKEN = (() => {
  try {
    const qs = new URLSearchParams(window.location.search || "");
    return String(qs.get("dev_access_token") || "").trim();
  } catch {
    return "";
  }
})();
const DEV_INJECTED_REFRESH_TOKEN = (() => {
  try {
    const qs = new URLSearchParams(window.location.search || "");
    return String(qs.get("dev_refresh_token") || "").trim();
  } catch {
    return "";
  }
})();
const DEV_INJECTED_ROLE = (() => {
  try {
    const qs = new URLSearchParams(window.location.search || "");
    return String(qs.get("dev_role") || "").trim();
  } catch {
    return "";
  }
})();
function clearDevAuthQueryParams() {
  try {
    const url = new URL(window.location.href);
    const keys = ["dev_access_token", "dev_refresh_token", "dev_role"];
    let changed = false;
    keys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });
    if (!changed) return;
    const next = `${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ""}${url.hash || ""}`;
    window.history.replaceState(null, "", next);
  } catch {
  }
}
function applyDevInjectedAuthState() {
  const accessToken = String(DEV_INJECTED_ACCESS_TOKEN || "").trim();
  const refreshToken = String(DEV_INJECTED_REFRESH_TOKEN || "").trim();
  const role = String(DEV_INJECTED_ROLE || "").trim();
  if (!accessToken && !refreshToken) {
    clearDevAuthQueryParams();
    return false;
  }
  if (accessToken) klsAuthState.accessToken = accessToken;
  if (refreshToken) klsAuthState.refreshToken = refreshToken;
  if (role) klsAuthState.role = role;
  klsAuthState.user = null;
  klsAuthState.subscription = null;
  klsAuthState.profile = null;
  klsAuthState.gatewayKey = "";
  klsAuthState.gatewayExpireAt = "";
  klsAuthState.gatewayBaseUrl = "";
  klsAuthState.chatModelAlias = "";
  klsRuntimeConfigLastFetchedAtMs = 0;
  klsRuntimeConfigLastConfigId = 0;
  klsAsrRealtimeSessionCache = null;
  persistKlsAuthState();
  renderKlsAuthState();
  clearDevAuthQueryParams();
  log("Dev auth token injected");
  return true;
}
function hasNativeAppBridge() {
  const bridge = window.AndroidAppBridge;
  return Boolean(
    bridge && typeof bridge.getPersistedAuthState === "function" && typeof bridge.setPersistedAuthState === "function" && typeof bridge.clearPersistedAuthState === "function"
  );
}
function getNativeStoredAuthState() {
  if (!hasNativeAppBridge()) return "";
  try {
    return String(window.AndroidAppBridge.getPersistedAuthState() || "").trim();
  } catch {
    return "";
  }
}
function setNativeStoredAuthState(raw) {
  if (!hasNativeAppBridge()) return;
  try {
    window.AndroidAppBridge.setPersistedAuthState(String(raw || ""));
  } catch {
  }
}
function clearNativeStoredAuthState() {
  if (!hasNativeAppBridge()) return;
  try {
    window.AndroidAppBridge.clearPersistedAuthState();
  } catch {
  }
}
function showNativeLocalNotification(title, message, notificationId = "") {
  const bridge = window.AndroidAppBridge;
  if (!bridge || typeof bridge.showLocalNotification !== "function") return false;
  try {
    bridge.showLocalNotification(
      String(title || "易点点通知").trim() || "易点点通知",
      String(message || "").trim(),
      String(notificationId || "").trim()
    );
    return true;
  } catch {
    return false;
  }
}
function readNativeVoiceCaptureMode() {
  const bridge = window.AndroidAppBridge;
  if (!bridge || typeof bridge.getVoiceCaptureMode !== "function") return "";
  try {
    return String(bridge.getVoiceCaptureMode() || "").trim();
  } catch {
    return "";
  }
}
function writeNativeVoiceCaptureMode(raw) {
  const bridge = window.AndroidAppBridge;
  if (!bridge || typeof bridge.setVoiceCaptureMode !== "function") return;
  try {
    bridge.setVoiceCaptureMode(String(raw || ""));
  } catch {
  }
}
function readNativeAppDisplayLanguage() {
  const bridge = window.AndroidAppBridge;
  if (!bridge || typeof bridge.getAppDisplayLanguage !== "function") return "";
  try {
    return String(bridge.getAppDisplayLanguage() || "").trim();
  } catch {
    return "";
  }
}
function writeNativeAppDisplayLanguage(raw) {
  const bridge = window.AndroidAppBridge;
  if (!bridge || typeof bridge.setAppDisplayLanguage !== "function") return;
  try {
    bridge.setAppDisplayLanguage(String(raw || ""));
  } catch {
  }
}
function openExternalUrl(url) {
  const safeUrl = String(url || "").trim();
  if (!/^https?:\/\//i.test(safeUrl)) return false;
  const bridge = window.AndroidAppBridge;
  if (bridge && typeof bridge.openExternalUrl === "function") {
    try {
      return bridge.openExternalUrl(safeUrl) === true;
    } catch {
    }
  }
  try {
    const opened = window.open(safeUrl, "_blank", "noopener,noreferrer");
    if (opened) return true;
  } catch {
  }
  try {
    window.location.href = safeUrl;
    return true;
  } catch {
  }
  return false;
}
function setStoredAuthState(raw) {
  try {
    if (SHOULD_PERSIST_AUTH_LOCAL) {
      window.localStorage.setItem(KLS_AUTH_STORAGE_KEY, raw);
    } else {
      window.sessionStorage.setItem(KLS_AUTH_STORAGE_KEY, raw);
    }
  } catch {
  }
  if (SHOULD_PERSIST_AUTH_LOCAL) {
    setNativeStoredAuthState(raw);
  }
}
function getStoredAuthState() {
  const nativeRaw = SHOULD_PERSIST_AUTH_LOCAL ? getNativeStoredAuthState() : "";
  if (nativeRaw) {
    try {
      window.localStorage.setItem(KLS_AUTH_STORAGE_KEY, nativeRaw);
    } catch {
    }
    try {
      window.sessionStorage.setItem(KLS_AUTH_STORAGE_KEY, nativeRaw);
    } catch {
    }
    return nativeRaw;
  }
  try {
    if (SHOULD_PERSIST_AUTH_LOCAL) {
      const localRaw = window.localStorage.getItem(KLS_AUTH_STORAGE_KEY);
      if (localRaw) {
        setNativeStoredAuthState(localRaw);
        return localRaw;
      }
      const sessionRaw = window.sessionStorage.getItem(KLS_AUTH_STORAGE_KEY) || "";
      if (sessionRaw) {
        try {
          window.localStorage.setItem(KLS_AUTH_STORAGE_KEY, sessionRaw);
        } catch {
        }
        setNativeStoredAuthState(sessionRaw);
        return sessionRaw;
      }
    }
  } catch {
  }
  try {
    return window.sessionStorage.getItem(KLS_AUTH_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}
function clearStoredAuthState() {
  try {
    window.sessionStorage.removeItem(KLS_AUTH_STORAGE_KEY);
  } catch {
  }
  clearNativeStoredAuthState();
  if (!SHOULD_PERSIST_AUTH_LOCAL) return;
  try {
    window.localStorage.removeItem(KLS_AUTH_STORAGE_KEY);
  } catch {
  }
}
function deriveRuntimeAccountScopeKey() {
  const profile = klsAuthState.profile && typeof klsAuthState.profile === "object" ? klsAuthState.profile : null;
  const user = klsAuthState.user && typeof klsAuthState.user === "object" ? klsAuthState.user : null;
  const rawUserId = Number((profile == null ? void 0 : profile.user_id) || (user == null ? void 0 : user.user_id) || (user == null ? void 0 : user.id) || 0);
  if (Number.isFinite(rawUserId) && rawUserId > 0) {
    return `user-${Math.floor(rawUserId)}`;
  }
  const phoneDigits = String((profile == null ? void 0 : profile.phone) || (user == null ? void 0 : user.phone) || "").replace(/\D+/g, "");
  if (phoneDigits) {
    return `phone-${phoneDigits}`;
  }
  const account = String((user == null ? void 0 : user.account) || "").trim().toLowerCase();
  if (account) {
    return `account-${account.replace(/[^a-z0-9._-]+/g, "-")}`;
  }
  return "guest";
}
function getKlsNotificationDismissedStorageKey(accountKey = currentRuntimeAccountScopeKey || deriveRuntimeAccountScopeKey() || "guest") {
  const normalized = String(accountKey || "guest").trim() || "guest";
  return `${KLS_NOTIFICATION_DISMISSED_STORAGE_KEY_PREFIX}.${normalized}`;
}
function loadKlsNotificationDismissedIds(accountKey = currentRuntimeAccountScopeKey || deriveRuntimeAccountScopeKey() || "guest") {
  let list = [];
  try {
    const raw = window.localStorage.getItem(getKlsNotificationDismissedStorageKey(accountKey)) || "";
    const parsed = raw ? JSON.parse(raw) : [];
    list = Array.isArray(parsed) ? parsed : [];
  } catch {
    list = [];
  }
  klsNotificationState.dismissedIds = new Set(
    list.map((id) => String(id || "").trim()).filter(Boolean).slice(-200)
  );
  return klsNotificationState.dismissedIds;
}
function persistKlsNotificationDismissedIds(accountKey = currentRuntimeAccountScopeKey || deriveRuntimeAccountScopeKey() || "guest") {
  try {
    const values = Array.from(klsNotificationState.dismissedIds).map((id) => String(id || "").trim()).filter(Boolean).slice(-200);
    window.localStorage.setItem(getKlsNotificationDismissedStorageKey(accountKey), JSON.stringify(values));
  } catch {
  }
}
function resetRuntimeScopedCaches() {
  orderNoteI18nMap = {};
  menuDisplayI18nMap = {};
  try {
    window.localStorage.removeItem(ORDER_NOTE_I18N_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DISPLAY_I18N_STORAGE_KEY);
  } catch {
  }
  selectedTablePanelCache = null;
  setSelectedTableNo("");
  renderSelectedOrderBoard({});
  applyBoardSelectionState();
}
async function syncRuntimeAccountScope(options = {}) {
  const nextKey = String(options.accountKey || deriveRuntimeAccountScopeKey() || "guest").trim() || "guest";
  if (!options.force && currentRuntimeAccountScopeKey === nextKey) {
    return { account_key: nextKey, changed: false };
  }
  if (runtimeAccountScopeSyncPromise && !options.force) {
    return runtimeAccountScopeSyncPromise;
  }
  runtimeAccountScopeSyncPromise = api("/api/runtime/account-scope", "POST", {
    account_key: nextKey
  }).then((data) => {
    const resolvedKey = String((data == null ? void 0 : data.account_key) || nextKey).trim() || nextKey;
    const changed = Boolean(data == null ? void 0 : data.changed) || currentRuntimeAccountScopeKey !== resolvedKey;
    currentRuntimeAccountScopeKey = resolvedKey;
    if (changed || options.resetCaches === true) {
      resetRuntimeScopedCaches();
    }
    loadKlsNotificationDismissedIds(resolvedKey);
    return data || { account_key: resolvedKey, changed };
  }).finally(() => {
    runtimeAccountScopeSyncPromise = null;
  });
  return runtimeAccountScopeSyncPromise;
}
function isLegacyWebSpeechDebugEnabled() {
  if (LEGACY_WEB_SPEECH_FORCE_ON) return true;
  try {
    return String(window.localStorage.getItem(LEGACY_WEB_SPEECH_DEBUG_KEY) || "").trim() === "1";
  } catch {
    return false;
  }
}
let sessionId = null;
let mediaRecorder = null;
let audioChunks = [];
let speechRecognizer = null;
let dictationActive = false;
let dictationFinalText = "";
let dishRecognizer = null;
let dishDictationActive = false;
let dishDraftFinalText = "";
let singleActionRecognizer = null;
let singleActionListening = false;
let singleActionFinalText = "";
let singleCaptureRecorder = null;
let singleCaptureStream = null;
let singleCaptureChunks = [];
let menuSingleRecognizer = null;
let menuSingleListening = false;
let menuSingleFinalText = "";
let menuSingleCaptureRecorder = null;
let menuSingleCaptureStream = null;
let menuSingleCaptureChunks = [];
let singleRealtimeAsrCapture = null;
let menuRealtimeAsrCapture = null;
let singleActionStartPending = false;
let menuSingleStartPending = false;
let singleActionStopRequested = false;
let menuSingleStopRequested = false;
let singleActionCancelRequested = false;
let menuSingleCancelRequested = false;
let singleActionFinalizePending = false;
let menuSingleFinalizePending = false;
let singleActionFinalizeCancelRequested = false;
let menuSingleFinalizeCancelRequested = false;
let singleActionCaptureStartedAtMs = 0;
let menuSingleCaptureStartedAtMs = 0;
const MIN_CAPTURE_MS_FOR_VOLUME = 420;
let klsAsrRealtimeSessionCache = null;
let menuOcrPendingFile = null;
let menuOcrPendingParseResult = null;
let menuOcrPendingFileName = "";
let selectedTableNo = "";
let boardSelectionBound = false;
let selectedOrderServeBound = false;
let selectedOrderStatusLongPressBound = false;
let menuItemsCache = [];
let activeBoardTablesCache = [];
let selectedTablePanelCache = {};
let menuDisplayI18nMap = {};
let menuDisplayI18nInFlight = null;
let orderNoteI18nMap = {};
let orderNoteI18nInFlight = null;
let selectedMenuCategory = "__ALL__";
let historyOrdersCache = [];
let selectedHistoryOrderId = 0;
let historySelectionBound = false;
let salesTrendView = "daily";
let salesTrendDailyItems = [];
let salesTrendWeeklyItems = [];
let profitPeriodView = "week";
let profitPeriodWeekCents = 0;
let profitPeriodMonthCents = 0;
let settingsCopyBound = false;
let tableNumberingConfigCache = null;
let actionFeedbackTimer = null;
let asrLiveHideTimer = null;
let asrWaveLevelSmoothed = 0.08;
let asrWaveLevelTarget = 0.08;
let asrWaveAnimRaf = 0;
const ASR_WAVE_BAR_COUNT = 31;
const ASR_WAVE_MIN_HEIGHT = 12;
const ASR_WAVE_MAX_HEIGHT = 160;
const asrWaveSeedOffsets = [];
let pendingAgentCheckoutTableNo = "";
let pendingAgentCancelTableNo = "";
let profilePageBound = false;
let settingsAutoSaveTimer = null;
let settingsAutoSaveInFlight = false;
let authSmsCooldownTimer = null;
let authSmsCooldownLeft = 0;
let settingsAutoSaveQueued = false;
let asrLanguagePresetKey = "zh_cn:mandarin";
let voiceCaptureMode = "toggle";
let appDisplayLanguageKey = "zh_cn";
let printerAutoCheckoutEnabled = false;
let printerItemFontSize = "small";
let voiceCommandInFlight = false;
let voiceInteractionLockActive = false;
let appUpdateForceLockActive = false;
let voicePromptPlaybackActive = false;
let voiceInteractionGuardBound = false;
let singleActionHoldPointerId = null;
let menuSingleHoldPointerId = null;
let checkoutModalPreviewTableNo = "";
let checkoutModalPreviewSummaryCache = null;
let checkoutModalPreviewOptionsCache = null;
let currentRuntimeAccountScopeKey = "";
let runtimeAccountScopeSyncPromise = null;
const klsAuthState = {
  accessToken: "",
  refreshToken: "",
  role: "",
  user: null,
  subscription: null,
  profile: null,
  gatewayKey: "",
  gatewayExpireAt: "",
  gatewayBaseUrl: "",
  chatModelAlias: "",
  lastUpdateCheck: null
};
const DEFAULT_GATEWAY_CHAT_MODEL = "gpt-5.2";
const KLS_RUNTIME_CONFIG_REFRESH_MS = 15 * 1e3;
let klsRuntimeConfigLastFetchedAtMs = 0;
let klsRuntimeConfigLastConfigId = 0;
const KLS_SESSION_REVALIDATE_INTERVAL_MS = 60 * 1e3;
let klsSessionLastValidatedAtMs = 0;
let klsSessionRevalidatePromise = null;
let klsSessionWatchTimer = null;
let klsRefreshTokenPromise = null;
let klsAuthClearing = false;
const klsNotificationState = {
  items: [],
  unreadCount: 0,
  pollTimer: null,
  stream: null,
  streamReconnectTimer: null,
  seenIds: /* @__PURE__ */ new Set(),
  dismissedIds: /* @__PURE__ */ new Set()
};
const KLS_SUBSCRIPTION_SYNC_INTERVAL_MS = 2 * 60 * 1e3;
const KLS_SUBSCRIPTION_NOTICE_DAY_MS = 24 * 60 * 60 * 1e3;
const KLS_SUBSCRIPTION_NOTICE_HOUR_MS = 60 * 60 * 1e3;
let klsSubscriptionLastSyncedAtMs = 0;
let klsSubscriptionSyncPromise = null;
let klsSubscriptionWatchTimer = null;
let klsSubscriptionNoticeMarker = "";
const klsSubscriptionNoticeSent = { day: false, hour: false, expired: false };
const PROTECTED_VIEWS = /* @__PURE__ */ new Set(["main", "menu", "sales", "settings", "profile"]);
let currentViewName = "auth";
const DISPLAY_LANGUAGE_PRESETS = {
  zh_cn: {
    nav_main: "主页面",
    nav_menu: "菜品录入",
    nav_sales: "数据查看",
    status_prefix: "状态：",
    asr_speak: "请说话",
    asr_second_press_hint: "上键取消 · 下键发送",
    sc_asr_card_title: "ASR 语种设置",
    sc_asr_language_title: "语音识别语言",
    sc_asr_language_desc: "用于 KLS -> 讯飞 ASR 的 language/accent 参数",
    sc_voice_capture_title: "说话方式",
    sc_voice_capture_desc: "同步主页面和菜品录入页的语音按钮与音量键行为",
    sc_display_language_title: "App 显示语言",
    sc_display_language_desc: "切换界面显示语言（支持维语兼容）",
    sc_printer_item_font_size_title: "菜单字号",
    sc_printer_item_font_size_desc: "仅调整小票菜品项字号，其他内容保持不变",
    printer_item_font_small: "小（当前）",
    printer_item_font_medium: "中",
    printer_item_font_large: "大",
    sc_printer_auto_checkout_title: "结账自动打印",
    sc_printer_auto_checkout_desc: "确认结账后自动发送中文账单到已连接打印机",
    printer_no_bonded_devices: "未找到已配对打印设备",
    printer_select_placeholder: "请选择打印机",
    auth_tagline: "智能语音点餐助手",
    auth_title: "登录 / 注册",
    auth_desc: "手机号验证码一键进入。未注册手机号自动注册，已注册手机号直接登录。",
    auth_phone_label: "手机号",
    auth_phone_placeholder: "请输入手机号",
    auth_code_label: "验证码",
    auth_code_placeholder: "请输入6位验证码",
    auth_send_code: "发送验证码",
    auth_send_code_wait: "{seconds}s后重发",
    auth_disclaimer: "验证码有效期 5 分钟，发送后 60 秒内不可重复发送。",
    profile_logged_out: "未登录",
    profile_store_name_empty: "未设置店名",
    profile_subtitle_logged_in: "昵称即店名，将用于首页展示和打印小票",
    profile_subtitle_logged_out: "登录后可设置店名（昵称）",
    profile_plan_need_login: "请先登录查看套餐信息",
    profile_plan_empty: "暂无订阅套餐信息",
    profile_plan_detail: "有效期 {expireAt}，续费状态 {renewalLabel}",
    profile_account_title: "账号信息",
    profile_plan_title: "当前套餐",
    profile_upgrade_plan: "升级套餐",
    profile_pick_plan: "选择适合您的套餐",
    profile_hide_plans: "收起",
    profile_logout: "退出登录",
    role_admin: "管理员",
    role_operator: "店员",
    plan_basic: "基础版",
    plan_pro: "专业版",
    plan_enterprise: "企业版",
    plan_empty: "未订阅",
    renewal_active: "自动续费中",
    renewal_canceled: "已关闭自动续费",
    renewal_failed: "自动续费失败",
    renewal_paused: "续费已暂停",
    auth_login_register: "登录/注册",
    checkout_confirm_title: "买单确认",
    checkout_confirm_done_title: "买单已完成",
    checkout_confirm_heading: "确认买单",
    checkout_confirm_desc: "请核对账单信息后再操作",
    checkout_confirm_placeholder: "例如：A12",
    checkout_confirm_table: "桌号",
    checkout_confirm_subtotal: "菜品小计",
    checkout_confirm_extra_fee: "附加费用",
    checkout_confirm_total: "总计",
    checkout_confirm_no_extra_fee: "无",
    checkout_confirm_release: "确认后将完成买单并释放桌台。",
    checkout_confirm_done: "状态：已完成买单，桌台已释放。",
    checkout_confirm_item: "账单明细",
    checkout_confirm_qty: "数量",
    checkout_confirm_line_total: "小计",
    checkout_confirm_multi_title: "多桌买单确认",
    checkout_confirm_loading: "正在刷新账单...",
    voice_toggle_option: "按一次开始，再按一次结束",
    voice_hold_option: "按住说话，松开结束",
    display_lang_zh: "简体中文",
    display_lang_ug: "ئۇيغۇرچە",
    voice_mode_toggle_label: "按一次开始，再按一次结束",
    voice_mode_hold_label: "按住说话，松开结束",
    single_idle: "点击开始说话",
    single_active: "点击结束并执行",
    menu_idle: "点击开始录入菜品",
    menu_active: "点击结束并录入菜品",
    single_idle_hold: "按住说话",
    single_active_hold: "松开结束并执行",
    menu_idle_hold: "按住录入菜品",
    menu_active_hold: "松开结束并录入菜品",
    voice_cancelled: "已取消",
    main_col_dish: "菜品",
    main_col_qty: "数量",
    main_col_price: "价格",
    main_col_status: "状态",
    main_selected_empty: "请选择左侧桌台查看明细",
    main_selected_prefix: "备注：",
    main_total_suffix: "总计",
    main_table_empty: "桌台 {table} 暂无点菜记录",
    main_status_served: "已上菜",
    main_status_pending: "待上菜",
    main_mark_served: "标记上菜",
    main_action_print: "打印",
    main_action_print_sub: "小票",
    main_action_checkout: "买单",
    main_action_checkout_sub: "确认",
    main_print_success: "打印小票成功",
    main_print_failed: "打印小票失败",
    main_checkout_success: "买单成功",
    main_checkout_failed: "买单失败",
    main_placeholder_title: "主控页功能区占位框",
    main_voice_card_title: "语音命令占位框",
    menu_db_title: "菜品数据库",
    menu_loading: "加载中...",
    menu_filter_prefix: "当前分类：",
    menu_filter_all: "全部",
    menu_no_items_in_category: "当前分类暂无菜品",
    menu_col_name: "菜名",
    menu_col_category: "分类",
    menu_col_price: "价格",
    menu_col_unit: "单位",
    menu_col_alias: "别名",
    menu_empty: "暂无菜品",
    menu_ocr_main: "拍照上传菜单",
    menu_ocr_sub: "智能识别并预录入",
    menu_ocr_hint: "点击拍照后自动识别，并弹出预录入确认",
    menu_placeholder_title: "菜品页功能区占位框",
    menu_single_card_title: "菜品语音录入占位框",
    menu_voice_preview_empty: "暂无菜品语音文本",
    menu_ocr_capturing: "拍照中...",
    menu_ocr_align: "请对准菜单并拍照",
    menu_ocr_recognizing: "识别中...",
    menu_ocr_parse_failed: "菜单识别失败",
    menu_ocr_done: "识别完成：{count} 条",
    menu_ocr_shoot_upload: "拍照上传菜单",
    menu_ocr_importing: "录入中...",
    menu_ocr_import_done: "录入完成：新增{created}，更新{updated}",
    menu_ocr_import_failed: "菜单图片录入失败",
    menu_ocr_import_btn: "识别并预录入",
    menu_ocr_confirm_btn: "确认录入",
    menu_ocr_selected: "已选择：{name}",
    menu_ocr_need_preview: "请先拍照并完成识别预览",
    menu_processing: "处理中...",
    menu_recording: "录音中...",
    menu_recognize_and_importing: "识别并录入中...",
    voice_cancel_pending: "取消中...",
    asr_processing_cancel_hint: "上键取消待发送",
    asr_processing_cancelled: "已取消，停止发送",
    app_update_found_title: "发现新版本",
    app_update_found_message: "检测到新版本 {version}，是否前往下载更新？",
    app_update_open_failed: "无法打开下载页面，请稍后重试",
    app_update_none: "当前已是最新版本",
    board_summary_pending: "待补充菜品",
    board_no_active_tables: "暂无进行中的桌台",
    board_load_failed: "桌台数据加载失败"
  },
  ug_cn: {
    nav_main: "باش بەت",
    nav_menu: "تاماق كىرگۈزۈش",
    nav_sales: "سانلىق مەلۇمات",
    status_prefix: "ھالەت:",
    asr_speak: "سۆزلەڭ",
    asr_second_press_hint: "يۇقىرى بىكار · تۆۋەن يوللاش",
    sc_asr_card_title: "ASR تىل تەڭشىكى",
    sc_asr_language_title: "ئاۋاز تونۇش تىلى",
    sc_asr_language_desc: "KLS -> XFYun نىڭ language/accent پارامېتىرى",
    sc_voice_capture_title: "سۆزلەش ئۇسۇلى",
    sc_voice_capture_desc: "باش بەت ۋە تاماق كىرگۈزۈش بەتلىرىدىكى ئاۋاز كۇنۇپكىسى/ئاۋاز كۇنۇپكا ھەرىكىتىنى ماسلاشتۇرىدۇ",
    sc_display_language_title: "App كۆرسىتىش تىلى",
    sc_display_language_desc: "كۆرسىتىش تىلىنى ئالماشتۇرۇش (ئۇيغۇرچە ماسلىشىشنى قوللايدۇ)",
    sc_printer_item_font_size_title: "تاماق خەت چوڭلۇقى",
    sc_printer_item_font_size_desc: "پەقەت تالوندىكى تاماق تۈرىنىڭ خەت چوڭلۇقىنى تەڭشەيدۇ",
    printer_item_font_small: "كىچىك (نۆۋەتتىكى)",
    printer_item_font_medium: "ئوتتۇرا",
    printer_item_font_large: "چوڭ",
    sc_printer_auto_checkout_title: "ھېساب ئاپتوماتىك بېسىش",
    sc_printer_auto_checkout_desc: "ھېسابنى جەزملەشتىن كېيىن خەنزۇچە تالوننى ئۇلانغان پرىنتېرغا ئاپتوماتىك يوللايدۇ",
    printer_no_bonded_devices: "ماسلاشتۇرۇلغان پرىنتېر تېپىلمىدى",
    printer_select_placeholder: "پرىنتېر تاللاڭ",
    auth_tagline: "ئەقلىي ئاۋازلىق زاكاز ياردەمچىسى",
    auth_title: "كىرىش / تىزىملىتىش",
    auth_desc: "يانفون نومۇرى ۋە دەلىللەش كودى بىلەن بىۋاسىتە كىرىدۇ. تىزىملاتمىغان نومۇر ئاپتوماتىك تىزىملىتىلىدۇ.",
    auth_phone_label: "يانفون نومۇرى",
    auth_phone_placeholder: "يانفون نومۇرىنى كىرگۈزۈڭ",
    auth_code_label: "دەلىللەش كودى",
    auth_code_placeholder: "6 خانىلىق كودنى كىرگۈزۈڭ",
    auth_send_code: "دەلىللەش كودى ئەۋەتىش",
    auth_send_code_wait: "{seconds} سېكۇنتتىن كېيىن قايتا ئەۋەتىدۇ",
    auth_disclaimer: "دەلىللەش كودى 5 مىنۇت كۈچكە ئىگە، ئەۋەتكەندىن كېيىن 60 سېكۇنت ئىچىدە قايتا ئەۋەتكىلى بولمايدۇ.",
    profile_logged_out: "كىرمىدى",
    profile_store_name_empty: "دۇكان نامى بېكىتىلمىگەن",
    profile_subtitle_logged_in: "لەقەم دۇكان نامى بولۇپ، باش بەت ۋە تالون بېسىشتا ئىشلىتىلىدۇ",
    profile_subtitle_logged_out: "كىرگەندىن كېيىن دۇكان نامىنى بەلگىلىگىلى بولىدۇ",
    profile_plan_need_login: "ئالدى بىلەن كىرىپ پىلان ئۇچۇرىنى كۆرۈڭ",
    profile_plan_empty: "ئابونت پىلانى ئۇچۇرى يوق",
    profile_plan_detail: "مۇددىتى {expireAt}، يېڭىلاش ھالىتى {renewalLabel}",
    profile_account_title: "ھېسابات ئۇچۇرى",
    profile_plan_title: "نۆۋەتتىكى پىلان",
    profile_upgrade_plan: "پىلان يېڭىلاش",
    profile_pick_plan: "سىزگە ماس پىلاننى تاللاڭ",
    profile_hide_plans: "يىغىش",
    profile_logout: "چىكىنىش",
    role_admin: "باشقۇرغۇچى",
    role_operator: "خىزمەتچى",
    plan_basic: "ئاساسىي نەشرى",
    plan_pro: "كەسپىي نەشرى",
    plan_enterprise: "كارخانا نەشرى",
    plan_empty: "مۇشتەرى بولمىغان",
    renewal_active: "ئاپتوماتىك يېڭىلاۋاتىدۇ",
    renewal_canceled: "ئاپتوماتىك يېڭىلاش تاقالغان",
    renewal_failed: "ئاپتوماتىك يېڭىلاش مەغلۇپ بولدى",
    renewal_paused: "يېڭىلاش ۋاقىتلىق توختىدى",
    auth_login_register: "كىرىش/تىزىملىتىش",
    checkout_confirm_title: "ھېساب جەزملەش",
    checkout_confirm_done_title: "ھېساب تاماملاندى",
    checkout_confirm_heading: "ھېسابنى جەزملەش",
    checkout_confirm_desc: "ھېساباتنى تەكشۈرۈپ بولغاندىن كېيىن ئاندىن مەشغۇلات قىلىڭ",
    checkout_confirm_placeholder: "مەسىلەن: A12",
    checkout_confirm_table: "ئۈستەل",
    checkout_confirm_subtotal: "تاماق جەمئى",
    checkout_confirm_extra_fee: "قوشۇمچە ھەق",
    checkout_confirm_total: "ئومۇمىي جەمئى",
    checkout_confirm_no_extra_fee: "يوق",
    checkout_confirm_release: "جەزملەشتۈرگەندىن كېيىن ھېساب تاماملىنىپ ئۈستەل بوشىتىلىدۇ.",
    checkout_confirm_done: "ھالەت: ھېساب تاماملاندى، ئۈستەل بوشىتىلدى.",
    checkout_confirm_item: "ھېسابات تەپسىلاتى",
    checkout_confirm_qty: "سانى",
    checkout_confirm_line_total: "كىچىك جەمئى",
    checkout_confirm_multi_title: "كۆپ ئۈستەل ھېساب جەزملەش",
    checkout_confirm_loading: "ھېسابات يېڭىلىنىۋاتىدۇ...",
    voice_toggle_option: "بىر قېتىم باشلاپ، يەنە بىر قېتىم تۈگىتىش",
    voice_hold_option: "بېسىپ تۇتۇپ سۆزلەش، قويۇپ تۈگىتىش",
    display_lang_zh: "简体中文",
    display_lang_ug: "ئۇيغۇرچە",
    voice_mode_toggle_label: "بىر قېتىم باشلاپ، يەنە بىر قېتىم تۈگىتىش",
    voice_mode_hold_label: "بېسىپ تۇتۇپ سۆزلەش، قويۇپ تۈگىتىش",
    single_idle: "چېكىپ سۆزلەشنى باشلاش",
    single_active: "چېكىپ تۈگىتىپ ئىجرا قىلىش",
    menu_idle: "چېكىپ تاماق كىرگۈزۈشنى باشلاش",
    menu_active: "چېكىپ تۈگىتىپ كىرگۈزۈش",
    single_idle_hold: "بېسىپ سۆزلەش",
    single_active_hold: "قويۇپ تۈگىتىپ ئىجرا قىلىش",
    menu_idle_hold: "بېسىپ تاماق كىرگۈزۈش",
    menu_active_hold: "قويۇپ تۈگىتىپ كىرگۈزۈش",
    voice_cancelled: "بىكار قىلىندى",
    main_col_dish: "تاماق",
    main_col_qty: "سانى",
    main_col_price: "باھا",
    main_col_status: "ھالەت",
    main_selected_empty: "سول تەرەپتىن ئۈستەل تاللاپ تەپسىلاتنى كۆرۈڭ",
    main_selected_prefix: "ئىزاھات:",
    main_total_suffix: "جەمئى",
    main_table_empty: "ئۈستەل {table} نىڭ زاكاز خاتىرىسى يوق",
    main_status_served: "يەتكۈزۈلدى",
    main_status_pending: "كۈتۈۋاتىدۇ",
    main_mark_served: "تاماق يەتكۈزۈلدى دەپ بەلگە",
    main_action_print: "بېسىش",
    main_action_print_sub: "تالون",
    main_action_checkout: "ھېسابلاش",
    main_action_checkout_sub: "جەزملەش",
    main_print_success: "تالون بېسىلدى",
    main_print_failed: "تالون بېسىش مەغلۇپ بولدى",
    main_checkout_success: "ھېساب تامام",
    main_checkout_failed: "ھېسابلاش مەغلۇپ بولدى",
    main_placeholder_title: "باش بەت ئىقتىدار رايونى",
    main_voice_card_title: "ئاۋاز بۇيرۇق رايونى",
    menu_db_title: "تاماق ئامبىرى",
    menu_loading: "يۈكلەۋاتىدۇ...",
    menu_filter_prefix: "نۆۋەتتىكى تۈر:",
    menu_filter_all: "ھەممىسى",
    menu_no_items_in_category: "نۆۋەتتىكى تۈردە تاماق يوق",
    menu_col_name: "تاماق نامى",
    menu_col_category: "تۈر",
    menu_col_price: "باھا",
    menu_col_unit: "بىرلىك",
    menu_col_alias: "باشقا نام",
    menu_empty: "تاماق يوق",
    menu_ocr_main: "تاماق تىزىملىكىنى سۈرەتكە تارتىپ يوللاش",
    menu_ocr_sub: "ئەقلىي تونۇپ ئالدىن كىرگۈزۈش",
    menu_ocr_hint: "سۈرەتكە تارتقاندىن كېيىن ئاپتوماتىك تونۇپ، ئالدىن كىرگۈزۈشنى جەزملەيدۇ",
    menu_placeholder_title: "تاماق بېتى ئىقتىدار رايونى",
    menu_single_card_title: "تاماق ئاۋازلىق كىرگۈزۈش رايونى",
    menu_voice_preview_empty: "تاماق ئاۋاز تېكىستى يوق",
    menu_ocr_capturing: "سۈرەتكە تارتىۋاتىدۇ...",
    menu_ocr_align: "تىزىملىكنى توغرىلاپ سۈرەتكە تارتىڭ",
    menu_ocr_recognizing: "تونۇۋاتىدۇ...",
    menu_ocr_parse_failed: "تاماق تونۇش مەغلۇپ بولدى",
    menu_ocr_done: "تونۇش تاماملاندى: {count} تۈر",
    menu_ocr_shoot_upload: "سۈرەتكە تارتىپ يوللاش",
    menu_ocr_importing: "كىرگۈزۈۋاتىدۇ...",
    menu_ocr_import_done: "كىرگۈزۈش تامام: يېڭى {created}، يېڭىلانغان {updated}",
    menu_ocr_import_failed: "تاماق رەسىم كىرگۈزۈش مەغلۇپ بولدى",
    menu_ocr_import_btn: "تونۇپ ئالدىن كىرگۈزۈش",
    menu_ocr_confirm_btn: "كىرگۈزۈشنى جەزملەش",
    menu_ocr_selected: "تاللانغانى: {name}",
    menu_ocr_need_preview: "ئاۋۋال سۈرەتكە تارتىپ تونۇش نەتىجىسىنى كۆرۈڭ",
    menu_processing: "بىر تەرەپ قىلىنىۋاتىدۇ...",
    menu_recording: "خاتىرىلىنىۋاتىدۇ...",
    menu_recognize_and_importing: "تونۇپ كىرگۈزۈۋاتىدۇ...",
    voice_cancel_pending: "بىكار قىلىنىۋاتىدۇ...",
    asr_processing_cancel_hint: "ئاۋازنى يوللاشتىن بۇرۇن ئۈستى كۇنۇپكا بىكار",
    asr_processing_cancelled: "بىكار قىلىندى، يوللانمايدۇ",
    app_update_found_title: "يېڭى نەشر تېپىلدى",
    app_update_found_message: "يېڭى نەشر {version} تېپىلدى، چۈشۈرۈش بېتىگە بارامسىز؟",
    app_update_open_failed: "چۈشۈرۈش بېتىنى ئاچالمىدى، سەلدىن كېيىن قايتا سىناڭ",
    app_update_none: "ھازىر ئەڭ يېڭى نەشر",
    board_summary_pending: "تاماق تىزىملىكى تولۇق ئەمەس",
    board_no_active_tables: "ئاكتىپ ئۈستەل يوق",
    board_load_failed: "ئۈستەل سانلىق مەلۇماتىنى يۈكلەش مەغلۇپ بولدى"
  }
};
function normalizeAppDisplayLanguage(raw) {
  return String(raw || "").trim().toLowerCase() === "ug_cn" ? "ug_cn" : "zh_cn";
}
function t(key, fallback = "") {
  const lang = DISPLAY_LANGUAGE_PRESETS[normalizeAppDisplayLanguage(appDisplayLanguageKey)] || DISPLAY_LANGUAGE_PRESETS.zh_cn;
  const base = DISPLAY_LANGUAGE_PRESETS.zh_cn || {};
  const value = lang[key];
  if (typeof value === "string" && value) return value;
  if (typeof base[key] === "string" && base[key]) return base[key];
  return fallback || key;
}
function tFmt(key, fallback = "", vars = {}) {
  const template = t(key, fallback);
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return "";
  });
}
const MENU_ROW_LONG_PRESS_MS = 1800;
const MENU_OCR_TIMEOUT_MS = 12e4;
const MENU_ROW_HIGHLIGHT_MS = 4800;
const menuRowHighlightById = /* @__PURE__ */ new Map();
const voiceDebugState = {
  source: "",
  last_button: "",
  interim_transcript: "",
  final_transcript: "",
  submitted_transcript: "",
  backend_transcript: "",
  note: "",
  updated_at: ""
};
function setStage(stage) {
  if (!stageEl) return;
  stageEl.textContent = `当前阶段：${stage}`;
}
function renderSession(data) {
  setStage(data.stage);
  if (sessionViewEl) {
    sessionViewEl.textContent = JSON.stringify(data, null, 2);
  }
  refreshBoard();
}
function log(text) {
  if (!logList) return;
  const li = document.createElement("li");
  li.textContent = `${(/* @__PURE__ */ new Date()).toLocaleTimeString()} - ${text}`;
  logList.prepend(li);
  try {
    console.log(`[APPLOG] ${text}`);
  } catch {
  }
}
function updateVoiceDebug(patch = {}) {
  Object.assign(voiceDebugState, patch);
  voiceDebugState.updated_at = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  if (voiceDebugViewEl) {
    voiceDebugViewEl.textContent = JSON.stringify(voiceDebugState, null, 2);
  }
}
function requireSession() {
  if (!sessionId) {
    throw new Error("请先创建会话。");
  }
}
function setRecordStatus(text) {
  if (recordStatusEl) {
    recordStatusEl.textContent = text;
  }
}
function setDictationStatus(text) {
  if (dictationStatusEl) {
    dictationStatusEl.textContent = text;
  }
}
function setDishDictationStatus(text) {
  const el = document.getElementById("dish-dictation-status");
  if (el) {
    el.textContent = text;
  }
}
function setSingleActionStatus(text) {
  if (singleActionStatusEl) {
    singleActionStatusEl.textContent = `${t("status_prefix", "状态：")}${text}`;
  }
}
function setMenuSingleStatus(text) {
  if (menuSingleStatusEl) {
    menuSingleStatusEl.textContent = `${t("status_prefix", "状态：")}${text}`;
  }
}
function setVoicePromptPlaybackActive(active) {
  voicePromptPlaybackActive = Boolean(active);
}
function syncVoiceCommandControlsBusy() {
  const busy = voiceCommandInFlight || voiceInteractionLockActive;
  if (voiceCommandRunBtnEl instanceof HTMLButtonElement) {
    voiceCommandRunBtnEl.disabled = busy;
  }
  if (singleActionBtnEl instanceof HTMLButtonElement) {
    if (singleActionListening) {
      singleActionBtnEl.disabled = false;
    } else {
      singleActionBtnEl.disabled = busy || singleActionStartPending;
    }
  }
  if (menuSingleBtnEl instanceof HTMLButtonElement) {
    if (menuSingleListening) {
      menuSingleBtnEl.disabled = false;
    } else {
      menuSingleBtnEl.disabled = busy || menuSingleStartPending;
    }
  }
  updateAsrLiveOverlaySecondPressHint();
}
function isVoiceInteractionLocked() {
  return voiceInteractionLockActive;
}
function setVoiceInteractionLock(locked) {
  voiceInteractionLockActive = Boolean(locked);
  document.body.classList.toggle("voice-interaction-locked", voiceInteractionLockActive);
  syncRouteGuardUi();
  syncVoiceCommandControlsBusy();
}
function canBypassVoiceInteractionLock(target) {
  if (!(target instanceof Element)) return false;
  if (singleActionListening && singleActionBtnEl instanceof HTMLElement && singleActionBtnEl.contains(target)) {
    return true;
  }
  if (menuSingleListening && menuSingleBtnEl instanceof HTMLElement && menuSingleBtnEl.contains(target)) {
    return true;
  }
  return false;
}
function bindVoiceInteractionLockGuards() {
  if (voiceInteractionGuardBound) return;
  voiceInteractionGuardBound = true;
  const blockWhenLocked = (event) => {
    const updateLocked = appUpdateForceLockActive;
    const voiceLocked = voiceInteractionLockActive;
    if (!voiceLocked && !updateLocked) return;
    if (voiceLocked && canBypassVoiceInteractionLock(event.target)) return;
    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    if (typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
  };
  document.addEventListener("pointerdown", blockWhenLocked, true);
  document.addEventListener("click", blockWhenLocked, true);
  document.addEventListener("touchstart", blockWhenLocked, { capture: true, passive: false });
  document.addEventListener("contextmenu", blockWhenLocked, true);
  document.addEventListener("keydown", blockWhenLocked, true);
}
function canStartVoiceCommand(source = "voice-command") {
  void source;
  if (appUpdateForceLockActive) return false;
  if (voiceInteractionLockActive) return false;
  if (!voiceCommandInFlight) return true;
  return false;
}
async function runVoiceCommandSingleFlight(source, runner) {
  void source;
  if (voiceCommandInFlight) {
    return null;
  }
  voiceCommandInFlight = true;
  syncVoiceCommandControlsBusy();
  try {
    return await runner();
  } finally {
    voiceCommandInFlight = false;
    syncVoiceCommandControlsBusy();
  }
}
function ensureViewportOverlayLayer(overlayEl, boxEl, options = {}) {
  if (!(overlayEl instanceof HTMLElement)) return;
  const backdrop = String(options.backdrop || "rgba(12, 22, 36, 0.22)");
  const zOverlay = String(options.zOverlay || "2147483100");
  const zBox = String(options.zBox || "2147483101");
  if (overlayEl.parentElement !== document.body) {
    document.body.appendChild(overlayEl);
  }
  overlayEl.style.position = "fixed";
  overlayEl.style.left = "0";
  overlayEl.style.top = "0";
  overlayEl.style.right = "0";
  overlayEl.style.bottom = "0";
  overlayEl.style.inset = "0";
  overlayEl.style.zIndex = zOverlay;
  overlayEl.style.display = "none";
  overlayEl.style.alignItems = "center";
  overlayEl.style.justifyContent = "center";
  overlayEl.style.padding = "16px";
  overlayEl.style.background = backdrop;
  overlayEl.style.backdropFilter = "blur(3px)";
  overlayEl.style.pointerEvents = "none";
  if (boxEl instanceof HTMLElement) {
    boxEl.style.position = "relative";
    boxEl.style.zIndex = zBox;
  }
}
function ensureActionFeedbackOverlayLayer() {
  ensureViewportOverlayLayer(actionFeedbackOverlayEl, actionFeedbackBoxEl, {
    backdrop: "rgba(12, 22, 36, 0.16)",
    zOverlay: "2147483200",
    zBox: "2147483201"
  });
}
function ensureAsrLiveOverlayLayer() {
  ensureViewportOverlayLayer(asrLiveOverlayEl, asrLiveOverlayEl == null ? void 0 : asrLiveOverlayEl.querySelector(".asr-live-card"), {
    backdrop: "rgba(10, 28, 55, 0.24)",
    zOverlay: "2147483180",
    zBox: "2147483181"
  });
  const cardEl = asrLiveOverlayEl == null ? void 0 : asrLiveOverlayEl.querySelector(".asr-live-card");
  if (cardEl instanceof HTMLElement) {
    const computed = window.getComputedStyle(cardEl);
    const width = Number.parseFloat(computed.width || "0");
    const height = Number.parseFloat(computed.height || "0");
    if (!Number.isFinite(width) || width < 220 || !Number.isFinite(height) || height < 220) {
      const side = Math.max(220, Math.min(Math.floor(window.innerWidth * 0.72), 300));
      cardEl.style.width = `${side}px`;
      cardEl.style.height = `${side}px`;
      cardEl.style.maxWidth = `${side}px`;
      cardEl.style.maxHeight = `${side}px`;
      log(`ASR overlay fallback size applied: ${side}x${side}px`);
    }
  }
  applyAsrLiveOverlayLayout();
}
function applyAsrLiveOverlayLayout() {
  const cardEl = asrLiveOverlayEl == null ? void 0 : asrLiveOverlayEl.querySelector(".asr-live-card");
  const waveEl = asrLiveOverlayEl == null ? void 0 : asrLiveOverlayEl.querySelector(".asr-live-wave");
  if (cardEl instanceof HTMLElement) {
    cardEl.style.display = "grid";
    cardEl.style.gridTemplateColumns = "minmax(0, 1fr)";
    cardEl.style.gridTemplateRows = "auto minmax(180px, 1fr) minmax(96px, auto)";
    cardEl.style.alignItems = "stretch";
    cardEl.style.justifyItems = "stretch";
    cardEl.style.gap = "10px";
    cardEl.style.padding = "16px 14px 18px";
    cardEl.style.textAlign = "center";
  }
  const applyFullWidth = (el) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.position = "relative";
    el.style.left = "auto";
    el.style.top = "auto";
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.transform = "none";
    el.style.width = "100%";
    el.style.minWidth = "100%";
    el.style.maxWidth = "none";
    el.style.marginLeft = "0";
    el.style.marginRight = "0";
    el.style.boxSizing = "border-box";
    el.style.justifySelf = "stretch";
    el.style.alignSelf = "stretch";
  };
  applyFullWidth(asrLiveHintEl);
  applyFullWidth(waveEl);
  applyFullWidth(asrLiveTextEl);
  if (asrLiveHintEl instanceof HTMLElement && asrLiveHintEl.style.display !== "none") {
    asrLiveHintEl.style.display = "flex";
    asrLiveHintEl.style.alignItems = "center";
    asrLiveHintEl.style.justifyContent = "center";
    asrLiveHintEl.style.textAlign = "center";
  }
  if (waveEl instanceof HTMLElement) {
    waveEl.style.display = "flex";
    waveEl.style.flex = "1 1 auto";
    waveEl.style.minHeight = "180px";
    waveEl.style.justifyContent = "space-between";
    waveEl.style.alignItems = "center";
    waveEl.style.padding = "8px 0";
    waveEl.style.gap = "2px";
  }
  if (asrLiveTextEl instanceof HTMLElement) {
    asrLiveTextEl.style.display = "-webkit-box";
    asrLiveTextEl.style.webkitBoxOrient = "vertical";
    asrLiveTextEl.style.webkitLineClamp = "4";
    asrLiveTextEl.style.overflow = "hidden";
    asrLiveTextEl.style.minHeight = "96px";
    asrLiveTextEl.style.maxHeight = "132px";
    asrLiveTextEl.style.padding = "0 12px";
    asrLiveTextEl.style.textAlign = "center";
    asrLiveTextEl.style.lineHeight = "1.25";
  }
  if (waveEl instanceof HTMLElement) {
    Array.from(waveEl.children).forEach((barEl) => {
      if (!(barEl instanceof HTMLElement)) return;
      barEl.style.flex = "1 1 0";
      barEl.style.minWidth = "0";
      barEl.style.maxWidth = "none";
    });
  }
}
function seededOffset(index) {
  const raw = Math.sin(index * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}
function ensureAsrWaveBars() {
  const waveEl = asrLiveOverlayEl == null ? void 0 : asrLiveOverlayEl.querySelector(".asr-live-wave");
  if (!(waveEl instanceof HTMLElement)) {
    asrLiveBarsEls = [];
    return;
  }
  if (waveEl.children.length !== ASR_WAVE_BAR_COUNT) {
    waveEl.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < ASR_WAVE_BAR_COUNT; i += 1) {
      const bar = document.createElement("span");
      bar.className = "asr-live-bar";
      frag.appendChild(bar);
    }
    waveEl.appendChild(frag);
  }
  asrLiveBarsEls = Array.from(waveEl.querySelectorAll(".asr-live-bar"));
  applyAsrLiveOverlayLayout();
  if (asrWaveSeedOffsets.length !== asrLiveBarsEls.length) {
    asrWaveSeedOffsets.length = 0;
    for (let i = 0; i < asrLiveBarsEls.length; i += 1) {
      asrWaveSeedOffsets.push(seededOffset(i));
    }
  }
}
function renderAsrWaveLevel(level, force = false) {
  ensureAsrWaveBars();
  if (!asrLiveBarsEls.length) return;
  const numeric = Number(level);
  const target = Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : 0.06;
  asrWaveLevelSmoothed = force ? target : asrWaveLevelSmoothed * 0.82 + target * 0.18;
  const voice = Math.max(0.04, Math.min(1, asrWaveLevelSmoothed));
  const now = performance.now();
  const speed = 0.0036 + voice * 0.0048;
  const amplitude = 0.24 + voice * 0.66;
  const jitter = 0.06 + voice * 0.22;
  const centerIndex = (asrLiveBarsEls.length - 1) / 2;
  for (let i = 0; i < asrLiveBarsEls.length; i += 1) {
    const barEl = asrLiveBarsEls[i];
    const offset = asrWaveSeedOffsets[i] || 0;
    const distance = centerIndex > 0 ? Math.abs(i - centerIndex) / centerIndex : 0;
    const envelope = 0.42 + (1 - distance) * 0.58;
    const waveA = Math.sin(now * speed + i * 0.48 + offset * 3.4);
    const waveB = Math.sin(now * speed * 0.62 - i * 0.32 + offset * 4.1);
    const pass = Math.max(0, Math.sin(now * speed * 1.9 + i * 0.23));
    const normalized = Math.max(0, 0.12 + waveA * 0.22 + waveB * 0.16 + pass * amplitude + jitter * offset);
    const height = ASR_WAVE_MIN_HEIGHT + Math.min(1, normalized * envelope) * (ASR_WAVE_MAX_HEIGHT - ASR_WAVE_MIN_HEIGHT);
    barEl.style.height = `${height.toFixed(1)}px`;
    barEl.style.opacity = `${Math.max(0.52, Math.min(1, 0.46 + normalized * 0.52)).toFixed(3)}`;
    barEl.style.filter = `brightness(${(0.92 + normalized * 0.28).toFixed(3)}) saturate(${(0.94 + normalized * 0.34).toFixed(3)})`;
  }
}
function stopAsrWaveAnimation() {
  if (asrWaveAnimRaf) {
    cancelAnimationFrame(asrWaveAnimRaf);
    asrWaveAnimRaf = 0;
  }
}
function startAsrWaveAnimation() {
  if (asrWaveAnimRaf) return;
  const tick = () => {
    if (!asrLiveOverlayEl || asrLiveOverlayEl.hidden || asrLiveOverlayEl.style.display === "none") {
      asrWaveAnimRaf = 0;
      return;
    }
    asrWaveLevelTarget = Math.max(0.06, asrWaveLevelTarget * 0.9);
    renderAsrWaveLevel(asrWaveLevelTarget, false);
    asrWaveAnimRaf = requestAnimationFrame(tick);
  };
  asrWaveAnimRaf = requestAnimationFrame(tick);
}
function updateAsrLiveOverlaySecondPressHint() {
  if (!asrLiveHintEl) return;
  if (!isHoldToTalkVoiceCaptureMode() && (singleActionFinalizePending || menuSingleFinalizePending)) {
    asrLiveHintEl.textContent = t("asr_processing_cancel_hint", "上键取消待发送");
    asrLiveHintEl.style.display = "block";
    applyAsrLiveOverlayLayout();
    return;
  }
  if (!isHoldToTalkVoiceCaptureMode() && (singleActionListening || menuSingleListening || singleActionStartPending || menuSingleStartPending)) {
    asrLiveHintEl.textContent = t("asr_second_press_hint", "上键取消 · 下键发送");
    asrLiveHintEl.style.display = "block";
    applyAsrLiveOverlayLayout();
    return;
  }
  asrLiveHintEl.textContent = "";
  asrLiveHintEl.style.display = "none";
  applyAsrLiveOverlayLayout();
}
function requestVoiceFinalizeCancellation(view = "main") {
  const safeView = String(view || "main").trim().toLowerCase() === "menu" ? "menu" : "main";
  const isMenu = safeView === "menu";
  const finalizePending = isMenu ? menuSingleFinalizePending : singleActionFinalizePending;
  if (!finalizePending) return false;
  if (isMenu) {
    menuSingleFinalizeCancelRequested = true;
    setMenuSingleStatus(t("voice_cancel_pending", "取消中..."));
  } else {
    singleActionFinalizeCancelRequested = true;
    setSingleActionStatus(t("voice_cancel_pending", "取消中..."));
  }
  updateAsrLiveOverlayText(t("asr_processing_cancelled", "已取消，停止发送"));
  updateAsrLiveOverlaySecondPressHint();
  return true;
}
function showAsrLiveOverlay(mode = "main", text = "") {
  if (!asrLiveOverlayEl) return;
  ensureAsrLiveOverlayLayer();
  if (asrLiveHideTimer) {
    window.clearTimeout(asrLiveHideTimer);
    asrLiveHideTimer = null;
  }
  if (asrLiveTextEl) {
    const clean = String(text || "").trim();
    asrLiveTextEl.textContent = clean || t("asr_speak", "请说话");
  }
  updateAsrLiveOverlaySecondPressHint();
  applyAsrLiveOverlayLayout();
  asrWaveLevelSmoothed = 0.22;
  asrWaveLevelTarget = 0.28;
  renderAsrWaveLevel(asrWaveLevelTarget, true);
  asrLiveOverlayEl.style.display = "flex";
  asrLiveOverlayEl.hidden = false;
  asrLiveOverlayEl.removeAttribute("hidden");
  startAsrWaveAnimation();
}
function updateAsrLiveOverlayText(text) {
  if (!asrLiveTextEl) return;
  const clean = String(text || "").trim();
  asrLiveTextEl.textContent = clean || t("asr_speak", "请说话");
}
function showAsrLiveOverlayError(text, delayMs = 2600) {
  const clean = String(text || "").trim() || "语音处理失败，请重试";
  updateAsrLiveOverlayText(clean);
  hideAsrLiveOverlay(delayMs);
}
function updateAsrLiveAudioLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) return;
  asrWaveLevelTarget = Math.max(asrWaveLevelTarget * 0.92, Math.max(0.06, Math.min(1, numeric)));
}
function hideAsrLiveOverlay(delayMs = 0) {
  if (!asrLiveOverlayEl) return;
  if (asrLiveHideTimer) {
    window.clearTimeout(asrLiveHideTimer);
    asrLiveHideTimer = null;
  }
  if (delayMs > 0) {
    asrLiveHideTimer = window.setTimeout(() => {
      asrLiveOverlayEl.hidden = true;
      asrLiveOverlayEl.style.display = "none";
      stopAsrWaveAnimation();
      if (asrLiveHintEl) {
        asrLiveHintEl.textContent = "";
        asrLiveHintEl.style.display = "none";
      }
      asrWaveLevelTarget = 0.08;
      renderAsrWaveLevel(0.08, true);
      asrLiveHideTimer = null;
    }, delayMs);
    return;
  }
  asrLiveOverlayEl.hidden = true;
  asrLiveOverlayEl.style.display = "none";
  stopAsrWaveAnimation();
  if (asrLiveHintEl) {
    asrLiveHintEl.textContent = "";
    asrLiveHintEl.style.display = "none";
  }
  asrWaveLevelTarget = 0.08;
  renderAsrWaveLevel(0.08, true);
}
function isVolumeUpKeyCode(code) {
  return Number(code) === 24;
}
function isVolumeDownKeyCode(code) {
  return Number(code) === 25;
}
function triggerSpeechCaptureByCurrentView() {
  const view = String(document.body.getAttribute("data-current-view") || currentViewName || "").trim();
  if (view === "auth") return "locked";
  if (view !== "main" && view !== "menu") return "unsupported";
  if (view === "menu" && menuSingleFinalizePending) {
    return "menu-finalize-pending";
  }
  if (view !== "menu" && singleActionFinalizePending) {
    return "main-finalize-pending";
  }
  if (isVoiceInteractionLocked() && !singleActionListening && !menuSingleListening) {
    return view === "menu" ? "menu-busy" : "main-busy";
  }
  if (view === "menu" && !menuSingleListening && voiceCommandInFlight) {
    return "menu-busy";
  }
  if (view !== "menu" && !singleActionListening && voiceCommandInFlight) {
    return "main-busy";
  }
  const targetBtn = view === "menu" ? menuSingleBtnEl : singleActionBtnEl;
  if (!(targetBtn instanceof HTMLButtonElement)) return "missing";
  targetBtn.click();
  return view === "menu" ? "menu" : "main";
}
function triggerSpeechCaptureStartByCurrentView(keyCode = 0) {
  const view = String(document.body.getAttribute("data-current-view") || currentViewName || "").trim();
  if (view === "auth") return "locked";
  if (view !== "main" && view !== "menu") return "unsupported";
  const holdMode = isHoldToTalkVoiceCaptureMode();
  const isCancelKey = isVolumeUpKeyCode(keyCode);
  const isSendKey = isVolumeDownKeyCode(keyCode) || !isCancelKey;
  if (view === "menu" && menuSingleFinalizePending) {
    return isCancelKey && requestVoiceFinalizeCancellation("menu") ? "menu-finalize-cancel" : "menu-finalize-pending";
  }
  if (view !== "menu" && singleActionFinalizePending) {
    return isCancelKey && requestVoiceFinalizeCancellation("main") ? "main-finalize-cancel" : "main-finalize-pending";
  }
  if (isVoiceInteractionLocked()) {
    if (view === "menu") {
      if (!holdMode && menuSingleListening) {
        if (isCancelKey) {
          void cancelMenuSingleCapture();
          return "menu-toggle-cancel";
        }
        if (isSendKey) {
          void handleMenuSingleCaptureStop();
          return "menu-toggle-stop";
        }
      }
      if (menuSingleStartPending) return "menu-pending";
      if (menuSingleListening) return "menu-active";
      return "menu-busy";
    }
    if (!holdMode && singleActionListening) {
      if (isCancelKey) {
        void cancelSingleActionCapture();
        return "main-toggle-cancel";
      }
      if (isSendKey) {
        void handleSingleActionCaptureStop();
        return "main-toggle-stop";
      }
    }
    if (singleActionStartPending) return "main-pending";
    if (singleActionListening) return "main-active";
    return "main-busy";
  }
  if (voiceCommandInFlight) {
    return view === "menu" ? "menu-busy" : "main-busy";
  }
  if (view === "menu") {
    if (menuSingleStartPending) {
      if (!holdMode) {
        if (isCancelKey) {
          menuSingleCancelRequested = true;
          menuSingleStopRequested = false;
          return "menu-cancel-pending";
        }
        menuSingleStopRequested = true;
        menuSingleCancelRequested = false;
        return "menu-stop-pending";
      }
      return "menu-pending";
    }
    if (menuSingleListening) {
      if (!holdMode) {
        if (isCancelKey) {
          void cancelMenuSingleCapture();
          return "menu-toggle-cancel";
        }
        if (isSendKey) {
          void handleMenuSingleCaptureStop();
          return "menu-toggle-stop";
        }
      }
      return "menu-active";
    }
    void handleMenuSingleCaptureStart();
    return "menu";
  }
  if (singleActionStartPending) {
    if (!holdMode) {
      if (isCancelKey) {
        singleActionCancelRequested = true;
        singleActionStopRequested = false;
        return "main-cancel-pending";
      }
      singleActionStopRequested = true;
      singleActionCancelRequested = false;
      return "main-stop-pending";
    }
    return "main-pending";
  }
  if (singleActionListening) {
    if (!holdMode) {
      if (isCancelKey) {
        void cancelSingleActionCapture();
        return "main-toggle-cancel";
      }
      if (isSendKey) {
        void handleSingleActionCaptureStop();
        return "main-toggle-stop";
      }
    }
    return "main-active";
  }
  void handleSingleActionCaptureStart();
  return "main";
}
function triggerSpeechCaptureStopByCurrentView(keyCode = 0) {
  const view = String(document.body.getAttribute("data-current-view") || currentViewName || "").trim();
  if (view === "auth") return "locked";
  if (view !== "main" && view !== "menu") return "unsupported";
  if (!isHoldToTalkVoiceCaptureMode()) {
    return isVolumeUpKeyCode(keyCode) ? `${view}-toggle-release-ignore` : `${view}-toggle-ignore`;
  }
  if (isVoiceInteractionLocked()) {
    if (view === "menu" && !menuSingleStartPending && !menuSingleListening) {
      return "menu-busy";
    }
    if (view !== "menu" && !singleActionStartPending && !singleActionListening) {
      return "main-busy";
    }
  }
  if (view === "menu") {
    if (menuSingleStartPending && !menuSingleListening) {
      menuSingleStopRequested = true;
      return "menu-stop-pending";
    }
    if (!menuSingleListening) return "menu-idle";
    menuSingleStopRequested = false;
    void handleMenuSingleCaptureStop();
    return "menu";
  }
  if (singleActionStartPending && !singleActionListening) {
    singleActionStopRequested = true;
    return "main-stop-pending";
  }
  if (!singleActionListening) return "main-idle";
  singleActionStopRequested = false;
  void handleSingleActionCaptureStop();
  return "main";
}
const nativeVoiceBridgeRuntime = {
  activeMode: "",
  startPending: false,
  stopResolve: null,
  stopReject: null,
  stopTimer: null,
  chunkListeners: /* @__PURE__ */ new Set()
};
function hasNativeVoiceBridge() {
  const bridge = window.AndroidVoiceBridge;
  return Boolean(bridge && typeof bridge.startCapture === "function" && typeof bridge.stopCapture === "function");
}
function ensureNativeVoiceBridgeHandler() {
  if (window.__nativeVoiceBridge && window.__nativeVoiceBridge.__installed) return;
  window.__nativeVoiceBridge = {
    __installed: true,
    onEvent(payload) {
      const data = payload && typeof payload === "object" ? payload : {};
      const eventType = String(data.type || "").trim().toLowerCase();
      if (eventType === "started") {
        nativeVoiceBridgeRuntime.startPending = false;
        return;
      }
      if (eventType === "tts_started") {
        setVoicePromptPlaybackActive(true);
        return;
      }
      if (eventType === "tts_done" || eventType === "tts_error") {
        setVoicePromptPlaybackActive(false);
        return;
      }
      if (eventType === "level") {
        updateAsrLiveAudioLevel(Number(data.level || 0));
        return;
      }
      if (eventType === "chunk") {
        nativeVoiceBridgeRuntime.chunkListeners.forEach((handler) => {
          try {
            handler(data);
          } catch {
          }
        });
        return;
      }
      if (eventType === "error") {
        if (typeof nativeVoiceBridgeRuntime.stopReject === "function") {
          const reject = nativeVoiceBridgeRuntime.stopReject;
          nativeVoiceBridgeRuntime.stopResolve = null;
          nativeVoiceBridgeRuntime.stopReject = null;
          if (nativeVoiceBridgeRuntime.stopTimer) {
            window.clearTimeout(nativeVoiceBridgeRuntime.stopTimer);
            nativeVoiceBridgeRuntime.stopTimer = null;
          }
          reject(new Error(String(data.message || "native voice bridge error")));
        }
        return;
      }
      if (eventType === "stopped") {
        if (typeof nativeVoiceBridgeRuntime.stopResolve === "function") {
          const resolve = nativeVoiceBridgeRuntime.stopResolve;
          nativeVoiceBridgeRuntime.stopResolve = null;
          nativeVoiceBridgeRuntime.stopReject = null;
          if (nativeVoiceBridgeRuntime.stopTimer) {
            window.clearTimeout(nativeVoiceBridgeRuntime.stopTimer);
            nativeVoiceBridgeRuntime.stopTimer = null;
          }
          resolve(data);
        }
      }
    }
  };
}
async function startNativeVoiceCapture(mode) {
  const bridge = window.AndroidVoiceBridge;
  if (!hasNativeVoiceBridge()) {
    throw new Error("native voice bridge unavailable");
  }
  ensureNativeVoiceBridgeHandler();
  if (typeof bridge.isRecording === "function" && bridge.isRecording()) {
    if (typeof bridge.cancelCapture === "function") {
      bridge.cancelCapture();
      await new Promise((resolve) => setTimeout(resolve, 80));
    } else {
      throw new Error("native voice bridge is already recording");
    }
  }
  const safeMode = String(mode || "main").trim() || "main";
  nativeVoiceBridgeRuntime.startPending = true;
  const accepted = Boolean(bridge.startCapture(safeMode));
  if (!accepted) {
    nativeVoiceBridgeRuntime.startPending = false;
    throw new Error("native voice capture start rejected");
  }
  nativeVoiceBridgeRuntime.activeMode = safeMode;
}
async function stopNativeVoiceCapture() {
  const bridge = window.AndroidVoiceBridge;
  if (!hasNativeVoiceBridge()) {
    throw new Error("native voice bridge unavailable");
  }
  ensureNativeVoiceBridgeHandler();
  if (nativeVoiceBridgeRuntime.startPending) {
    const waitStartAt = Date.now();
    while (nativeVoiceBridgeRuntime.startPending && Date.now() - waitStartAt < 700) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  return await new Promise((resolve, reject) => {
    nativeVoiceBridgeRuntime.stopResolve = resolve;
    nativeVoiceBridgeRuntime.stopReject = reject;
    nativeVoiceBridgeRuntime.stopTimer = window.setTimeout(() => {
      nativeVoiceBridgeRuntime.stopResolve = null;
      nativeVoiceBridgeRuntime.stopReject = null;
      nativeVoiceBridgeRuntime.stopTimer = null;
      reject(new Error("native voice stop timeout"));
    }, 15e3);
    let attempts = 0;
    const tryStop = () => {
      attempts += 1;
      const accepted = Boolean(bridge.stopCapture());
      if (accepted) return;
      if (attempts < 4) {
        window.setTimeout(tryStop, 60);
        return;
      }
      window.clearTimeout(nativeVoiceBridgeRuntime.stopTimer);
      nativeVoiceBridgeRuntime.stopTimer = null;
      nativeVoiceBridgeRuntime.stopResolve = null;
      nativeVoiceBridgeRuntime.stopReject = null;
      reject(new Error("native voice stop rejected"));
    };
    tryStop();
  });
}
async function cancelNativeVoiceCapture() {
  const bridge = window.AndroidVoiceBridge;
  if (!hasNativeVoiceBridge()) return;
  ensureNativeVoiceBridgeHandler();
  if (typeof bridge.cancelCapture === "function") {
    try {
      bridge.cancelCapture();
    } catch {
    }
  }
  nativeVoiceBridgeRuntime.startPending = false;
  nativeVoiceBridgeRuntime.stopResolve = null;
  nativeVoiceBridgeRuntime.stopReject = null;
  if (nativeVoiceBridgeRuntime.stopTimer) {
    window.clearTimeout(nativeVoiceBridgeRuntime.stopTimer);
    nativeVoiceBridgeRuntime.stopTimer = null;
  }
}
function addNativeVoiceChunkListener(listener) {
  if (typeof listener !== "function") {
    return () => {
    };
  }
  nativeVoiceBridgeRuntime.chunkListeners.add(listener);
  return () => {
    nativeVoiceBridgeRuntime.chunkListeners.delete(listener);
  };
}
const nativeMediaBridgeRuntime = {
  pendingResolve: null,
  pendingReject: null,
  pendingTimer: null
};
function hasNativeMediaBridge() {
  const bridge = window.AndroidMediaBridge;
  return Boolean(bridge && typeof bridge.captureMenuImage === "function");
}
function ensureNativeMediaBridgeHandler() {
  if (window.__nativeMediaBridge && window.__nativeMediaBridge.__installed) return;
  window.__nativeMediaBridge = {
    __installed: true,
    onEvent(payload) {
      const data = payload && typeof payload === "object" ? payload : {};
      const eventType = String(data.type || "").trim().toLowerCase();
      if (eventType === "started") {
        return;
      }
      if (eventType === "error" || eventType === "cancelled") {
        if (typeof nativeMediaBridgeRuntime.pendingReject === "function") {
          const reject = nativeMediaBridgeRuntime.pendingReject;
          nativeMediaBridgeRuntime.pendingResolve = null;
          nativeMediaBridgeRuntime.pendingReject = null;
          if (nativeMediaBridgeRuntime.pendingTimer) {
            window.clearTimeout(nativeMediaBridgeRuntime.pendingTimer);
            nativeMediaBridgeRuntime.pendingTimer = null;
          }
          const message = eventType === "cancelled" ? "已取消拍照上传" : String(data.message || "native media bridge error");
          reject(new Error(message));
        }
        return;
      }
      if (eventType === "image") {
        if (typeof nativeMediaBridgeRuntime.pendingResolve === "function") {
          const resolve = nativeMediaBridgeRuntime.pendingResolve;
          nativeMediaBridgeRuntime.pendingResolve = null;
          nativeMediaBridgeRuntime.pendingReject = null;
          if (nativeMediaBridgeRuntime.pendingTimer) {
            window.clearTimeout(nativeMediaBridgeRuntime.pendingTimer);
            nativeMediaBridgeRuntime.pendingTimer = null;
          }
          resolve(data);
        }
      }
    }
  };
}
async function requestNativeMenuImage(source = "camera") {
  const bridge = window.AndroidMediaBridge;
  if (!hasNativeMediaBridge()) {
    throw new Error("native media bridge unavailable");
  }
  ensureNativeMediaBridgeHandler();
  const safeSource = String(source || "camera").trim().toLowerCase() === "gallery" ? "gallery" : "camera";
  return await new Promise((resolve, reject) => {
    nativeMediaBridgeRuntime.pendingResolve = resolve;
    nativeMediaBridgeRuntime.pendingReject = reject;
    nativeMediaBridgeRuntime.pendingTimer = window.setTimeout(() => {
      nativeMediaBridgeRuntime.pendingResolve = null;
      nativeMediaBridgeRuntime.pendingReject = null;
      nativeMediaBridgeRuntime.pendingTimer = null;
      reject(new Error("native media capture timeout"));
    }, MENU_OCR_TIMEOUT_MS);
    let accepted = false;
    if (safeSource === "gallery" && typeof bridge.pickMenuImage === "function") {
      accepted = Boolean(bridge.pickMenuImage());
    } else {
      accepted = Boolean(bridge.captureMenuImage());
    }
    if (!accepted) {
      window.clearTimeout(nativeMediaBridgeRuntime.pendingTimer);
      nativeMediaBridgeRuntime.pendingResolve = null;
      nativeMediaBridgeRuntime.pendingReject = null;
      nativeMediaBridgeRuntime.pendingTimer = null;
      reject(new Error("native media capture rejected"));
    }
  });
}
async function withUiTimeout(task, timeoutMs, timeoutMessage) {
  const runner = typeof task === "function" ? task : () => task;
  return await Promise.race([
    Promise.resolve().then(() => runner()),
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    })
  ]);
}
const nativePrinterBridgeRuntime = {
  seq: 0,
  pending: /* @__PURE__ */ new Map(),
  bondedDevices: [],
  connectedAddress: "",
  connectedName: ""
};
const PRINTER_UI_STATES = Object.freeze({
  IDLE: "idle",
  PERMISSION_PENDING: "permission_pending",
  DEVICE_LISTING: "device_listing",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  PRINTING: "printing",
  ERROR: "error"
});
const PRINTER_TRANSIENT_STATES = /* @__PURE__ */ new Set([
  PRINTER_UI_STATES.PERMISSION_PENDING,
  PRINTER_UI_STATES.DEVICE_LISTING,
  PRINTER_UI_STATES.CONNECTING,
  PRINTER_UI_STATES.PRINTING
]);
const PRINTER_STATUS_TEXT = Object.freeze({
  [PRINTER_UI_STATES.IDLE]: "打印状态：空闲",
  [PRINTER_UI_STATES.PERMISSION_PENDING]: "正在申请蓝牙权限...",
  [PRINTER_UI_STATES.DEVICE_LISTING]: "正在刷新配对设备...",
  [PRINTER_UI_STATES.CONNECTING]: "连接中...",
  [PRINTER_UI_STATES.CONNECTED]: "打印机已连接",
  [PRINTER_UI_STATES.PRINTING]: "正在发送打印数据...",
  [PRINTER_UI_STATES.ERROR]: "打印状态异常"
});
const settingsPrinterRuntime = {
  bound: false,
  state: PRINTER_UI_STATES.IDLE,
  actionEpoch: 0
};
function updatePrinterStatus(message, isError = false) {
  const text = String(message || "").trim() || "打印状态：空闲";
  if (printerStatusViewEl) {
    printerStatusViewEl.textContent = text;
    printerStatusViewEl.classList.toggle("is-error", Boolean(isError));
  }
  log(`[Printer] ${text}`);
}
function hasNativePrinterBridge() {
  const bridge = window.AndroidPrinterBridge;
  return Boolean(bridge && typeof bridge.listBondedDevices === "function" && typeof bridge.connect === "function");
}
function isSettingsPrinterConnected() {
  return Boolean(String(nativePrinterBridgeRuntime.connectedAddress || "").trim());
}
function getSettingsPrinterSteadyState() {
  return isSettingsPrinterConnected() ? PRINTER_UI_STATES.CONNECTED : PRINTER_UI_STATES.IDLE;
}
function getConnectedPrinterLabel() {
  const name = String(nativePrinterBridgeRuntime.connectedName || "").trim();
  const address = String(nativePrinterBridgeRuntime.connectedAddress || "").trim();
  return name || address;
}
function resolvePrinterStatusText(state, message) {
  const text = String(message || "").trim();
  if (text) return text;
  if (state === PRINTER_UI_STATES.CONNECTED) {
    const label = getConnectedPrinterLabel();
    if (label) return `已连接: ${label}`;
  }
  return PRINTER_STATUS_TEXT[state] || PRINTER_STATUS_TEXT[PRINTER_UI_STATES.IDLE];
}
function setSettingsPrinterState(nextState, options = {}) {
  const state = Object.values(PRINTER_UI_STATES).includes(nextState) ? nextState : PRINTER_UI_STATES.IDLE;
  const message = resolvePrinterStatusText(state, options.message);
  const isError = options.isError === true || state === PRINTER_UI_STATES.ERROR;
  settingsPrinterRuntime.state = state;
  updatePrinterStatus(message, isError);
  syncSettingsPrinterActionState();
}
function getSettingsPrinterButtonMatrix(state, bridgeReady, connected) {
  if (!bridgeReady) {
    return { perm: false, refresh: false, connect: false, disconnect: false, selftest: false, sample: false };
  }
  const matrix = {
    perm: true,
    refresh: true,
    connect: !connected,
    disconnect: connected,
    selftest: connected,
    sample: connected
  };
  switch (state) {
    case PRINTER_UI_STATES.PERMISSION_PENDING:
      matrix.perm = false;
      break;
    case PRINTER_UI_STATES.DEVICE_LISTING:
      matrix.refresh = false;
      matrix.connect = false;
      break;
    case PRINTER_UI_STATES.CONNECTING:
      matrix.connect = false;
      matrix.disconnect = false;
      matrix.selftest = false;
      matrix.sample = false;
      break;
    case PRINTER_UI_STATES.PRINTING:
      matrix.connect = false;
      matrix.disconnect = false;
      matrix.selftest = false;
      matrix.sample = false;
      break;
    default:
      break;
  }
  return matrix;
}
function recoverSettingsPrinterStateOnViewEnter() {
  if (!settingsPrinterRuntime.bound) return;
  if (!hasNativePrinterBridge()) {
    settingsPrinterRuntime.actionEpoch += 1;
    setSettingsPrinterState(PRINTER_UI_STATES.ERROR, { message: "当前环境未接入原生打印桥（Web 调试模式）", isError: true });
    return;
  }
  if (PRINTER_TRANSIENT_STATES.has(settingsPrinterRuntime.state)) {
    settingsPrinterRuntime.actionEpoch += 1;
  }
  setSettingsPrinterState(getSettingsPrinterSteadyState());
}
function ensureNativePrinterBridgeHandler() {
  if (window.__nativePrinterBridge && window.__nativePrinterBridge.__installed) return;
  window.__nativePrinterBridge = {
    __installed: true,
    onEvent(payload) {
      const data = payload && typeof payload === "object" ? payload : {};
      const eventType = String(data.type || "").trim().toLowerCase();
      if (eventType === "state") {
        const action = String(data.action || "").trim().toLowerCase();
        if (action === "connection") {
          const connected = Boolean(data.connected);
          nativePrinterBridgeRuntime.connectedAddress = connected ? String(data.address || "").trim() : "";
          nativePrinterBridgeRuntime.connectedName = connected ? String(data.name || "").trim() : "";
          setSettingsPrinterState(connected ? PRINTER_UI_STATES.CONNECTED : PRINTER_UI_STATES.IDLE, {
            message: connected ? `已连接: ${getConnectedPrinterLabel()}` : "打印机已断开"
          });
        }
        return;
      }
      if (eventType !== "result") {
        return;
      }
      const requestId = String(data.request_id || "").trim();
      if (!requestId) return;
      const pending = nativePrinterBridgeRuntime.pending.get(requestId);
      if (!pending) return;
      nativePrinterBridgeRuntime.pending.delete(requestId);
      if (pending.timer) {
        window.clearTimeout(pending.timer);
      }
      if (data.success) {
        pending.resolve(data);
      } else {
        pending.reject(new Error(String(data.message || data.code || "printer operation failed")));
      }
    }
  };
}
function nextNativePrinterReqId(action) {
  nativePrinterBridgeRuntime.seq += 1;
  return `printer-${String(action || "op").trim() || "op"}-${Date.now()}-${nativePrinterBridgeRuntime.seq}`;
}
function requestNativePrinter(action, invoke, timeoutMs = 15e3) {
  if (!hasNativePrinterBridge()) {
    return Promise.reject(new Error("native printer bridge unavailable"));
  }
  ensureNativePrinterBridgeHandler();
  const requestId = nextNativePrinterReqId(action);
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      nativePrinterBridgeRuntime.pending.delete(requestId);
      reject(new Error(`printer ${action} timeout`));
    }, timeoutMs);
    nativePrinterBridgeRuntime.pending.set(requestId, { resolve, reject, timer });
    let accepted = false;
    try {
      accepted = Boolean(invoke(requestId));
    } catch (error) {
      accepted = false;
    }
    if (!accepted) {
      const pending = nativePrinterBridgeRuntime.pending.get(requestId);
      if (pending && pending.timer) {
        window.clearTimeout(pending.timer);
      }
      nativePrinterBridgeRuntime.pending.delete(requestId);
      reject(new Error(`printer ${action} rejected`));
    }
  });
}
function renderNativePrinterDevices(devices) {
  nativePrinterBridgeRuntime.bondedDevices = Array.isArray(devices) ? devices : [];
  if (!printerDeviceSelectEl) return;
  printerDeviceSelectEl.innerHTML = "";
  if (nativePrinterBridgeRuntime.bondedDevices.length <= 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("printer_no_bonded_devices", "未找到已配对打印设备");
    printerDeviceSelectEl.appendChild(option);
    return;
  }
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("printer_select_placeholder", "请选择打印机");
  printerDeviceSelectEl.appendChild(placeholder);
  nativePrinterBridgeRuntime.bondedDevices.forEach((device) => {
    const option = document.createElement("option");
    option.value = String(device.address || "").trim();
    const name = String(device.name || "未知设备").trim() || "未知设备";
    option.textContent = `${name} (${option.value})`;
    printerDeviceSelectEl.appendChild(option);
  });
}
async function requestNativePrinterPermissions() {
  const bridge = window.AndroidPrinterBridge;
  const result = await requestNativePrinter("permissions", (requestId) => bridge.requestPermissions(requestId), 2e4);
  return Boolean(result == null ? void 0 : result.data == null ? void 0 : result.data.granted);
}
async function refreshNativePrinterBondedDevices() {
  const bridge = window.AndroidPrinterBridge;
  const result = await requestNativePrinter("list_bonded", (requestId) => bridge.listBondedDevices(requestId), 2e4);
  const devices = Array.isArray(result == null ? void 0 : result.data == null ? void 0 : result.data.devices) ? result.data.devices : [];
  renderNativePrinterDevices(devices);
  return devices;
}
function normalizePrinterConnectError(rawMessage) {
  const message = String(rawMessage || "").trim();
  const lower = message.toLowerCase();
  const fallback = {
    category: "generic",
    userMessage: "连接失败，请确认设备为小票打印机并重试"
  };
  if (!message) return fallback;
  if (/permission|denied|unauthor|not authorized|bluetooth_connect|权限|未授权|授权/.test(lower) || /权限|未授权|授权/.test(message)) {
    return {
      category: "permission",
      userMessage: "连接失败，请先授予蓝牙权限后重试"
    };
  }
  if (/timeout|timed out|超时/.test(lower) || /超时/.test(message)) {
    return {
      category: "timeout",
      userMessage: "连接超时，请确认打印机已开机并靠近后重试"
    };
  }
  if (/not bonded|bonded|invalid address|address|mac|unpaired|not pair/.test(lower) || /未配对|地址|无效设备|设备无效/.test(message)) {
    return {
      category: "address_or_pairing",
      userMessage: "连接失败，请确认设备已配对且地址有效后重试"
    };
  }
  return fallback;
}
async function connectNativePrinter(address) {
  const safeAddress = String(address || "").trim();
  if (!safeAddress) {
    throw new Error("请先选择打印机设备");
  }
  try {
    const bridge = window.AndroidPrinterBridge;
    const result = await requestNativePrinter("connect", (requestId) => bridge.connect(safeAddress, requestId), 2e4);
    const connectedName = String(result == null ? void 0 : result.data == null ? void 0 : result.data.name || "").trim();
    nativePrinterBridgeRuntime.connectedAddress = safeAddress;
    nativePrinterBridgeRuntime.connectedName = connectedName;
    return result;
  } catch (error) {
    const rawMessage = String((error == null ? void 0 : error.message) || "").trim();
    const mapped = normalizePrinterConnectError(rawMessage);
    log(`[Printer][connect][${mapped.category}] ${rawMessage || "unknown connect error"}`);
    throw new Error(mapped.userMessage);
  }
}
async function disconnectNativePrinter() {
  const bridge = window.AndroidPrinterBridge;
  await requestNativePrinter("disconnect", (requestId) => bridge.disconnect(requestId), 8e3);
  nativePrinterBridgeRuntime.connectedAddress = "";
  nativePrinterBridgeRuntime.connectedName = "";
}
function ensureNativePrinterConnected() {
  if (!nativePrinterBridgeRuntime.connectedAddress) {
    throw new Error("请先连接打印机设备");
  }
}
function buildSamplePrintPayload() {
  const widthMm = Number((printerWidthMmEl == null ? void 0 : printerWidthMmEl.value) || "58") >= 76 ? 80 : 58;
  const storeName = getStoreDisplayName();
  const displayLanguage = normalizeAppDisplayLanguage(appDisplayLanguageKey);
  const isUyghur = displayLanguage === "ug_cn";
  const itemNotes = [
    translateOrderNoteByLanguage("少辣", displayLanguage),
    "",
    translateOrderNoteByLanguage("少冰", displayLanguage)
  ];
  const uniformRemark = translateOrderNoteByLanguage("少辣；少冰", displayLanguage);
  return {
    title: isUyghur ? `${storeName} تالون` : `${storeName} 账单小票`,
    store_name: storeName,
    order_no: `ORD-${Date.now()}`,
    table_no: selectedTableNo || "A1",
    width_mm: widthMm,
    item_font_size: getPrinterItemFontSize(),
    display_language: displayLanguage,
    items: [
      { name: "牛肉串", qty: 3, price_cents: 300, note: itemNotes[0] },
      { name: "烤茄子", qty: 1, price_cents: 1200, note: "" },
      { name: "可乐", qty: 2, price_cents: 500, note: itemNotes[2] }
    ],
    total_cents: 3100,
    remark: uniformRemark,
    footer: isUyghur ? "قايتا كېلىڭ" : "欢迎下次光临"
  };
}
async function printNativePrinterSelfTest() {
  ensureNativePrinterConnected();
  const bridge = window.AndroidPrinterBridge;
  const widthMm = Number((printerWidthMmEl == null ? void 0 : printerWidthMmEl.value) || "58") >= 76 ? 80 : 58;
  const result = await requestNativePrinter("selftest", (requestId) => bridge.printSelfTest(widthMm, requestId), 25e3);
  return result;
}
async function printNativePrinterSample() {
  const payload = buildSamplePrintPayload();
  return printNativePrinterPayload(payload);
}
async function printNativePrinterPayload(payload, options = {}) {
  ensureNativePrinterConnected();
  const bridge = window.AndroidPrinterBridge;
  const forcedDisplayLanguage = String((options == null ? void 0 : options.forceDisplayLanguage) || "").trim();
  const displayLanguage = normalizeAppDisplayLanguage(forcedDisplayLanguage || ((payload == null ? void 0 : payload.display_language) || appDisplayLanguageKey));
  const ticketPayload = payload && typeof payload === "object" ? { ...payload } : {};
  ticketPayload.item_font_size = normalizePrinterItemFontSize(ticketPayload.item_font_size || printerItemFontSize);
  const useImageTicket = typeof (bridge == null ? void 0 : bridge.printTicketImage) === "function";
  const action = useImageTicket ? "print_ticket_image" : "print_ticket";
  const result = await requestNativePrinter(
    action,
    (requestId) => useImageTicket ? bridge.printTicketImage(JSON.stringify(ticketPayload), requestId) : bridge.printTicket(JSON.stringify(ticketPayload), requestId),
    useImageTicket ? 35e3 : 25e3
  );
  return result;
}
window.__bbqPrinter = {
  isAvailable: hasNativePrinterBridge,
  requestPermissions: requestNativePrinterPermissions,
  listBondedDevices: refreshNativePrinterBondedDevices,
  connect: connectNativePrinter,
  disconnect: disconnectNativePrinter,
  printSelfTest: printNativePrinterSelfTest,
  printSampleTicket: printNativePrinterSample,
  printTicket: printNativePrinterPayload,
  printTicketImage: printNativePrinterPayload,
  buildSamplePayload: buildSamplePrintPayload
};
function syncSettingsPrinterActionState() {
  const permBtn = document.getElementById("printer-perm-btn");
  const refreshBtn = document.getElementById("printer-refresh-btn");
  const connectBtn = document.getElementById("printer-connect-btn");
  const disconnectBtn = document.getElementById("printer-disconnect-btn");
  const selftestBtn = document.getElementById("printer-selftest-btn");
  const sampleBtn = document.getElementById("printer-sample-btn");
  const bridgeReady = hasNativePrinterBridge();
  const connected = isSettingsPrinterConnected();
  const matrix = getSettingsPrinterButtonMatrix(settingsPrinterRuntime.state, bridgeReady, connected);
  if (permBtn) permBtn.disabled = !matrix.perm;
  if (refreshBtn) refreshBtn.disabled = !matrix.refresh;
  if (connectBtn) connectBtn.disabled = !matrix.connect;
  if (disconnectBtn) disconnectBtn.disabled = !matrix.disconnect;
  if (selftestBtn) selftestBtn.disabled = !matrix.selftest;
  if (sampleBtn) sampleBtn.disabled = !matrix.sample;
}
function normalizePrinterAutoCheckout(raw) {
  if (typeof raw === "boolean") return raw;
  const text = String(raw || "").trim().toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "on";
}
function normalizePrinterItemFontSize(raw) {
  const text = String(raw || "").trim().toLowerCase();
  if (text === "medium" || text === "large") return text;
  return "small";
}
function getPrinterItemFontSize() {
  if (printerItemFontSizeEl instanceof HTMLSelectElement) {
    return normalizePrinterItemFontSize(printerItemFontSizeEl.value || printerItemFontSize);
  }
  return normalizePrinterItemFontSize(printerItemFontSize);
}
function applyPrinterItemFontSize(raw, options = {}) {
  printerItemFontSize = normalizePrinterItemFontSize(raw);
  if (printerItemFontSizeEl instanceof HTMLSelectElement) {
    printerItemFontSizeEl.value = printerItemFontSize;
  }
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(PRINTER_ITEM_FONT_SIZE_STORAGE_KEY, printerItemFontSize);
    } catch {
    }
  }
}
function restorePrinterItemFontSize() {
  let stored = "";
  try {
    stored = String(window.localStorage.getItem(PRINTER_ITEM_FONT_SIZE_STORAGE_KEY) || "").trim();
  } catch {
    stored = "";
  }
  const uiValue = printerItemFontSizeEl instanceof HTMLSelectElement ? String(printerItemFontSizeEl.value || "").trim() : "";
  applyPrinterItemFontSize(stored || uiValue || "small", { persist: false });
}
function applyPrinterAutoCheckout(raw, options = {}) {
  printerAutoCheckoutEnabled = normalizePrinterAutoCheckout(raw);
  if (printerAutoCheckoutEl instanceof HTMLInputElement) {
    printerAutoCheckoutEl.checked = printerAutoCheckoutEnabled;
  }
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(PRINTER_AUTO_CHECKOUT_STORAGE_KEY, printerAutoCheckoutEnabled ? "1" : "0");
    } catch {
    }
  }
}
function restorePrinterAutoCheckout() {
  let stored = "";
  try {
    stored = String(window.localStorage.getItem(PRINTER_AUTO_CHECKOUT_STORAGE_KEY) || "").trim();
  } catch {
    stored = "";
  }
  applyPrinterAutoCheckout(stored, { persist: false });
}
async function runSettingsPrinterAction(config, action) {
  const pendingState = config.pendingState || PRINTER_UI_STATES.IDLE;
  const pendingMessage = typeof config.pendingMessage === "function" ? config.pendingMessage() : config.pendingMessage;
  const epoch = settingsPrinterRuntime.actionEpoch + 1;
  settingsPrinterRuntime.actionEpoch = epoch;
  setSettingsPrinterState(pendingState, { message: pendingMessage });
  try {
    const result = await action();
    if (settingsPrinterRuntime.actionEpoch !== epoch) {
      return result;
    }
    if (typeof config.resolveSuccess === "function") {
      const resolved = config.resolveSuccess(result) || {};
      const state = resolved.state || getSettingsPrinterSteadyState();
      setSettingsPrinterState(state, { message: resolved.message, isError: resolved.isError === true });
      return result;
    }
    const successState = config.successState || getSettingsPrinterSteadyState();
    const successMessage = typeof config.successMessage === "function" ? config.successMessage(result) : config.successMessage;
    setSettingsPrinterState(successState, { message: successMessage });
    return result;
  } catch (error) {
    if (settingsPrinterRuntime.actionEpoch !== epoch) {
      return null;
    }
    const fallbackError = typeof config.errorMessage === "function" ? config.errorMessage(error) : config.errorMessage;
    setSettingsPrinterState(PRINTER_UI_STATES.ERROR, {
      message: (error == null ? void 0 : error.message) || fallbackError || PRINTER_STATUS_TEXT[PRINTER_UI_STATES.ERROR],
      isError: true
    });
    return null;
  }
}
function bindSettingsPrinterCard() {
  if (settingsPrinterRuntime.bound) return;
  const permBtn = document.getElementById("printer-perm-btn");
  const refreshBtn = document.getElementById("printer-refresh-btn");
  const connectBtn = document.getElementById("printer-connect-btn");
  const disconnectBtn = document.getElementById("printer-disconnect-btn");
  const selftestBtn = document.getElementById("printer-selftest-btn");
  const sampleBtn = document.getElementById("printer-sample-btn");
  if (printerAutoCheckoutEl instanceof HTMLInputElement) {
    printerAutoCheckoutEl.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      applyPrinterAutoCheckout(target.checked);
    });
  }
  if (printerItemFontSizeEl instanceof HTMLSelectElement) {
    printerItemFontSizeEl.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      applyPrinterItemFontSize(target.value);
    });
  }
  restorePrinterItemFontSize();
  restorePrinterAutoCheckout();

  if (!hasNativePrinterBridge()) {
    setSettingsPrinterState(PRINTER_UI_STATES.ERROR, { message: "当前环境未接入原生打印桥（Web 调试模式）", isError: true });
    settingsPrinterRuntime.bound = true;
    return;
  }

  setSettingsPrinterState(getSettingsPrinterSteadyState(), {
    message: getSettingsPrinterSteadyState() === PRINTER_UI_STATES.CONNECTED ? `已连接: ${getConnectedPrinterLabel()}` : "原生打印桥已就绪，请先申请权限并刷新设备"
  });

  if (permBtn) {
    permBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.PERMISSION_PENDING,
        pendingMessage: PRINTER_STATUS_TEXT[PRINTER_UI_STATES.PERMISSION_PENDING],
        errorMessage: "蓝牙权限申请失败",
        resolveSuccess(result) {
          const granted = Boolean(result);
          if (granted) {
            return { state: getSettingsPrinterSteadyState(), message: "蓝牙权限就绪" };
          }
          return { state: PRINTER_UI_STATES.ERROR, message: "蓝牙权限未授权", isError: true };
        }
      }, async () => {
        return await requestNativePrinterPermissions();
      });
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.DEVICE_LISTING,
        pendingMessage: PRINTER_STATUS_TEXT[PRINTER_UI_STATES.DEVICE_LISTING],
        errorMessage: "刷新设备失败",
        successState: getSettingsPrinterSteadyState(),
        successMessage(devices) {
          return `已发现 ${Array.isArray(devices) ? devices.length : 0} 台已配对设备`;
        }
      }, async () => {
        return await refreshNativePrinterBondedDevices();
      });
    });
  }

  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.CONNECTING,
        pendingMessage: PRINTER_STATUS_TEXT[PRINTER_UI_STATES.CONNECTING],
        errorMessage: "连接打印机失败",
        successState: PRINTER_UI_STATES.CONNECTED,
        successMessage() {
          const label = getConnectedPrinterLabel();
          return label ? `已连接: ${label}` : PRINTER_STATUS_TEXT[PRINTER_UI_STATES.CONNECTED];
        }
      }, async () => {
        const address = String((printerDeviceSelectEl == null ? void 0 : printerDeviceSelectEl.value) || "").trim();
        return await connectNativePrinter(address);
      });
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.CONNECTING,
        pendingMessage: "正在断开打印机...",
        errorMessage: "断开连接失败",
        successState: PRINTER_UI_STATES.IDLE,
        successMessage: "打印机已断开"
      }, async () => {
        return await disconnectNativePrinter();
      });
    });
  }

  if (selftestBtn) {
    selftestBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.PRINTING,
        pendingMessage: "正在发送打印数据...",
        errorMessage: "打印自检失败",
        successState: PRINTER_UI_STATES.CONNECTED,
        successMessage(result) {
          const bytes = Number(result == null ? void 0 : result.data == null ? void 0 : result.data.bytes) || 0;
          return `自检小票已发送 (${bytes} bytes)`;
        }
      }, async () => {
        return await printNativePrinterSelfTest();
      });
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", async () => {
      await runSettingsPrinterAction({
        pendingState: PRINTER_UI_STATES.PRINTING,
        pendingMessage: "正在发送打印数据...",
        errorMessage: "打印样例失败",
        successState: PRINTER_UI_STATES.CONNECTED,
        successMessage(result) {
          const bytes = Number(result == null ? void 0 : result.data == null ? void 0 : result.data.bytes) || 0;
          return `样例小票已发送 (${bytes} bytes)`;
        }
      }, async () => {
        return await printNativePrinterSample();
      });
    });
  }
  settingsPrinterRuntime.bound = true;
}
function setMenuNativeOcrStatus(message, isError = false) {
  if (!menuOcrNativeStatusEl) return;
  menuOcrNativeStatusEl.textContent = String(message || "").trim() || t("menu_ocr_hint", "点击拍照后自动识别，并弹出预录入确认");
  menuOcrNativeStatusEl.classList.toggle("is-error", Boolean(isError));
}
async function runNativeMenuOcrCaptureFlow() {
  try {
    if (menuOcrNativeCaptureBtnEl) {
      menuOcrNativeCaptureBtnEl.disabled = true;
      menuOcrNativeCaptureBtnEl.textContent = t("menu_ocr_capturing", "拍照中...");
    }
    setMenuNativeOcrStatus(t("menu_ocr_align", "请对准菜单并拍照"));
    const nativeImage = await withUiTimeout(
      () => requestNativeMenuImage("camera"),
      MENU_OCR_TIMEOUT_MS,
      "拍照超时，请重试"
    );
    const imageBase64 = String((nativeImage == null ? void 0 : nativeImage.image_base64) || "").trim();
    if (!imageBase64) {
      throw new Error("未获取到图片数据");
    }
    const mimeType = String((nativeImage == null ? void 0 : nativeImage.mime_type) || "image/jpeg").trim() || "image/jpeg";
    const fileName = String((nativeImage == null ? void 0 : nativeImage.file_name) || "").trim() || `menu-camera-${Date.now()}.jpg`;
    const blob = base64ToBlob(imageBase64, mimeType);
    menuOcrPendingFile = null;
    menuOcrPendingParseResult = null;
    menuOcrPendingFileName = fileName;
    updateMenuOcrFileNameLabel(blob, fileName);
    setMenuNativeOcrStatus(t("menu_ocr_recognizing", "识别中..."));
    const parseData = await withUiTimeout(
      () => parseMenuImageToJson(blob),
      MENU_OCR_TIMEOUT_MS,
      "菜单识别超时，请重试"
    );
    if (!(parseData == null ? void 0 : parseData.applied)) {
      const parseMsg = String((parseData == null ? void 0 : parseData.message) || t("menu_ocr_parse_failed", "菜单识别失败")).trim();
      setMenuNativeOcrStatus(parseMsg, true);
      return;
    }
    menuOcrPendingFile = blob;
    menuOcrPendingParseResult = parseData;
    openMenuOcrPreviewModal(parseData);
    setMenuNativeOcrStatus(
      tFmt("menu_ocr_done", "识别完成：{count} 条", { count: Number((parseData == null ? void 0 : parseData.recognized_count) || 0) })
    );
  } catch (error) {
    const message = (error == null ? void 0 : error.message) || t("menu_ocr_parse_failed", "菜单识别失败");
    setMenuNativeOcrStatus(message, true);
    log(message);
  } finally {
    if (menuOcrNativeCaptureBtnEl) {
      menuOcrNativeCaptureBtnEl.disabled = false;
      menuOcrNativeCaptureBtnEl.textContent = t("menu_ocr_shoot_upload", "拍照上传菜单");
    }
  }
}
function pcm16Base64ToWavBlob(pcmBase64, sampleRate = 16e3, channels = 1) {
  const binary = window.atob(String(pcmBase64 || ""));
  const dataLength = binary.length;
  const wav = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wav);
  const writeStr = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataLength, true);
  for (let i = 0; i < dataLength; i += 1) {
    view.setUint8(44 + i, binary.charCodeAt(i));
  }
  return new Blob([wav], { type: "audio/wav" });
}
function getCurrentOperatorId() {
  var _a2, _b2;
  return ((_b2 = (_a2 = document.getElementById("operator-id")) == null ? void 0 : _a2.value) == null ? void 0 : _b2.trim()) || "waiter-A";
}
function normalizeOrderItemNote(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim();
}
const ORDER_NOTE_TRANSLATION_MAP = Object.freeze({
  ug_cn: Object.freeze({
    "不要辣椒": "مۇچ سالماڭ",
    "别放辣椒": "مۇچ سالماڭ",
    "不放辣椒": "مۇچ سالماڭ",
    "不加辣椒": "مۇچ سالماڭ",
    "不要辣": "ئاچچىق سالماڭ",
    "不辣": "ئاچچىق بولمىسۇن",
    "少辣": "ئاچچىقى ئاز",
    "微辣": "ئازراق ئاچچىق",
    "加辣": "ئاچچىق قوشۇڭ",
    "多辣": "ئاچچىقى كۆپ",
    "都不要辣椒": "ھەممىسىگە مۇچ سالماڭ",
    "不要香菜": "كەرەپشە سالماڭ",
    "别放香菜": "كەرەپشە سالماڭ",
    "不要葱": "پىياز سالماڭ",
    "别放葱": "پىياز سالماڭ",
    "不放葱": "پىياز سالماڭ",
    "不要洋葱": "پىياز سالماڭ",
    "都不要葱": "ھەممىسىگە پىياز سالماڭ",
    "不要蒜": "سامساق سالماڭ",
    "不要孜然": "زىرە سالماڭ",
    "少孜然": "زىرىسى ئاز",
    "少盐": "تۇزى ئاز",
    "多盐": "تۇزى كۆپ",
    "不要盐": "تۇز سالماڭ",
    "少糖": "قەنتى ئاز",
    "不要糖": "قەنت سالماڭ",
    "少冰": "مۇزى ئاز",
    "去冰": "مۇز سالماڭ",
    "不要冰": "مۇز سالماڭ",
    "打包": "ئېلىپ كېتىش"
  })
});
function translateOrderNoteByLanguage(raw, langKey = appDisplayLanguageKey) {
  const note = normalizeOrderItemNote(raw);
  if (!note) return "";
  const lang = normalizeAppDisplayLanguage(langKey);
  if (lang !== "ug_cn" || containsUyghurScript(note) && !containsChineseScript(note)) return note;
  const map = ORDER_NOTE_TRANSLATION_MAP[lang] || {};
  const translatePart = (part) => {
    const text = normalizeOrderItemNote(part);
    if (!text) return "";
    const cached = getOrderNoteI18nEntry(text, lang);
    if (cached) return String(cached.display_name || "").trim() || text;
    if (map[text]) return map[text];
    let translated = text;
    Object.keys(map).sort((a, b) => b.length - a.length).forEach((source) => {
      translated = translated.split(source).join(map[source]);
    });
    return translated;
  };
  return note.split(/([；;，,、])/).map((part) => {
    return /^[；;，,、]$/.test(part) ? "؛ " : translatePart(part);
  }).join("").replace(/\s+/g, " ").trim();
}
function normalizeOrderNoteFragment(raw) {
  return String(raw || "").replace(/^[（(]+|[)）]+$/g, "").replace(/\s+/g, " ").trim();
}
function loadOrderNoteI18nMap() {
  if (orderNoteI18nMap && Object.keys(orderNoteI18nMap).length) return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDER_NOTE_I18N_STORAGE_KEY) || "{}");
    orderNoteI18nMap = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    orderNoteI18nMap = {};
  }
}
function persistOrderNoteI18nMap() {
  try {
    window.localStorage.setItem(ORDER_NOTE_I18N_STORAGE_KEY, JSON.stringify(orderNoteI18nMap || {}));
  } catch {
  }
}
function getOrderNoteI18nEntry(note, langKey = appDisplayLanguageKey) {
  loadOrderNoteI18nMap();
  const normalizedNote = normalizeOrderNoteFragment(note);
  if (!normalizedNote) return null;
  const lang = normalizeAppDisplayLanguage(langKey);
  const langMap = orderNoteI18nMap && typeof orderNoteI18nMap === "object" ? orderNoteI18nMap[lang] : null;
  const entry = langMap && typeof langMap === "object" ? langMap[normalizedNote] : null;
  if (!entry || typeof entry !== "object") return null;
  const displayName = normalizeOrderNoteFragment(entry.display_name || "");
  return displayName ? entry : null;
}
function setOrderNoteI18nEntry(note, langKey, displayName) {
  const normalizedNote = normalizeOrderNoteFragment(note);
  const safeDisplayName = normalizeOrderNoteFragment(displayName);
  if (!normalizedNote || !safeDisplayName) return;
  const lang = normalizeAppDisplayLanguage(langKey);
  if (!orderNoteI18nMap || typeof orderNoteI18nMap !== "object") {
    orderNoteI18nMap = {};
  }
  if (!orderNoteI18nMap[lang] || typeof orderNoteI18nMap[lang] !== "object") {
    orderNoteI18nMap[lang] = {};
  }
  orderNoteI18nMap[lang][normalizedNote] = {
    source_note: normalizedNote,
    display_name: safeDisplayName
  };
}
function splitOrderNoteParts(raw) {
  const note = normalizeOrderItemNote(raw);
  if (!note) return [];
  const seen = new Set();
  return note.split(/[；;，,、\n]+/).map((part) => normalizeOrderNoteFragment(part)).filter((part) => {
    if (!part || seen.has(part)) return false;
    seen.add(part);
    return true;
  });
}
function joinOrderNoteParts(parts) {
  return (Array.isArray(parts) ? parts : []).map((part) => normalizeOrderNoteFragment(part)).filter(Boolean).join("；");
}
function collectOrderNotePartsFromSource(source) {
  const panel = !Array.isArray(source) && source && typeof source === "object" ? source : null;
  const items = Array.isArray(source) ? source : Array.isArray(panel == null ? void 0 : panel.items) ? panel.items : [];
  const breakdown = buildOrderRemarkBreakdown(items, panel == null ? void 0 : panel.order_note);
  const parts = [breakdown.commonNote, ...breakdown.itemNotes].filter(Boolean);
  if (!parts.length && !items.length) return [];
  const collected = [];
  const seen = new Set();
  parts.forEach((item) => {
    splitOrderNoteParts(item).forEach((part) => {
      if (!part || seen.has(part)) return;
      seen.add(part);
      collected.push(part);
    });
  });
  return collected;
}
function isOrderNoteSourceResolvedForLanguage(note, langKey = appDisplayLanguageKey) {
  const normalizedNote = normalizeOrderNoteFragment(note);
  if (!normalizedNote) return true;
  const lang = normalizeAppDisplayLanguage(langKey);
  if (lang !== "ug_cn") return true;
  if (containsUyghurScript(normalizedNote) && !containsChineseScript(normalizedNote)) return true;
  if (getOrderNoteI18nEntry(normalizedNote, lang)) return true;
  const map = ORDER_NOTE_TRANSLATION_MAP[lang] || {};
  if (map[normalizedNote]) return true;
  if (!containsChineseScript(normalizedNote)) return true;
  return false;
}
function redrawOrderNoteLanguageViews() {
  if (selectedTablePanelCache && typeof selectedTablePanelCache === "object") {
    renderSelectedOrderBoard(selectedTablePanelCache);
    applyBoardSelectionState();
  }
}
async function ensureOrderNoteI18nMapForCurrentLanguage(source = null, options = {}) {
  const lang = normalizeAppDisplayLanguage(appDisplayLanguageKey);
  if (lang !== "ug_cn") return;
  const parts = collectOrderNotePartsFromSource(source);
  if (!parts.length) return;
  loadOrderNoteI18nMap();
  const missing = parts.filter((part) => !isOrderNoteSourceResolvedForLanguage(part, lang));
  if (!missing.length) return;
  if (orderNoteI18nInFlight) {
    try {
      await orderNoteI18nInFlight;
    } catch {
    }
    if (options.recheck !== false) {
      await ensureOrderNoteI18nMapForCurrentLanguage(source, { ...options, recheck: false });
    }
    return;
  }
  orderNoteI18nInFlight = api("/api/order-notes/i18n-map", "POST", {
    target_language: lang,
    notes: missing
  }).then((data) => {
    const mappedItems = Array.isArray(data == null ? void 0 : data.items) ? data.items : [];
    for (const mapped of mappedItems) {
      const sourceNote = normalizeOrderNoteFragment((mapped == null ? void 0 : mapped.source_note) || "");
      const displayName = normalizeOrderNoteFragment((mapped == null ? void 0 : mapped.display_name) || "");
      if (!sourceNote || !displayName) continue;
      setOrderNoteI18nEntry(sourceNote, lang, displayName);
    }
    persistOrderNoteI18nMap();
    if (options.rerenderOnResolve !== false) {
      redrawOrderNoteLanguageViews();
    }
  }).catch((error) => {
    log(`Order note language map failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }).finally(() => {
    orderNoteI18nInFlight = null;
  });
  await orderNoteI18nInFlight;
}
function buildOrderRemarkBreakdown(items, orderNote = "") {
  const source = Array.isArray(items) ? items : [];
  const explicitOrderNote = normalizeOrderItemNote(orderNote);
  if (explicitOrderNote) {
    return {
      commonParts: splitOrderNoteParts(explicitOrderNote),
      commonNote: explicitOrderNote,
      itemNotes: source.map((item) => joinOrderNoteParts(splitOrderNoteParts(item == null ? void 0 : item.note)))
    };
  }
  const notePartsList = source.map((item) => splitOrderNoteParts(item == null ? void 0 : item.note));
  let commonParts = [];
  if (source.length > 1 && notePartsList.every((parts) => parts.length > 0)) {
    commonParts = notePartsList[0].filter((part, index, parts) => parts.indexOf(part) === index && notePartsList.every((candidate) => candidate.includes(part)));
  }
  const commonSet = new Set(commonParts);
  return {
    commonParts,
    commonNote: joinOrderNoteParts(commonParts),
    itemNotes: notePartsList.map((parts) => joinOrderNoteParts(parts.filter((part) => !commonSet.has(part))))
  };
}
function getUniformOrderRemark(items, orderNote = "") {
  return buildOrderRemarkBreakdown(items, orderNote).commonNote;
}
function renderSelectedTableStatus(data = null) {
  if (!selectedTableStatusEl) return;
  const panel = data && typeof data === "object" ? data : selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : null;
  const selectedNo = String((panel == null ? void 0 : panel.selected_table_no) || selectedTableNo || "").trim().toUpperCase();
  const items = String((panel == null ? void 0 : panel.selected_table_no) || "").trim().toUpperCase() === selectedNo ? panel == null ? void 0 : panel.items : [];
  const remark = buildOrderRemarkBreakdown(items, panel == null ? void 0 : panel.order_note).commonNote;
  const displayRemark = translateOrderNoteByLanguage(remark);
  selectedTableStatusEl.classList.toggle("hidden", !remark);
  selectedTableStatusEl.textContent = remark ? `${t("main_selected_prefix", "备注：")}${displayRemark || remark}` : "";
}
function getStoreDisplayName() {
  var _a2;
  const profile = klsAuthState.profile && typeof klsAuthState.profile === "object" ? klsAuthState.profile : null;
  const candidate = sanitizeDisplayName(((_a2 = profile == null ? void 0 : profile.display_name) == null ? void 0 : _a2.trim()) || "");
  return candidate || "烧烤店";
}
function normalizeApiBase(rawBase) {
  const value = String(rawBase || "").trim();
  if (!value) return "";
  return value.replace(/\/+$/, "");
}
function setSelectedTableNo(tableNo) {
  selectedTableNo = String(tableNo || "").trim().toUpperCase();
  renderSelectedTableStatus();
  if (selectedTotalLabelEl) {
    selectedTotalLabelEl.textContent = `${selectedTableNo || "--"} ${t("main_total_suffix", "总计")}`;
  }
  syncSelectedSummaryActionState();
}
function normalizeHexColor(value) {
  const text = String(value || "").trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(text);
  if (!match) return "";
  return `#${match[1].toLowerCase()}`;
}
function computeReadableTextColor(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return BOARD_SELECTED_FG_LIGHT;
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1e3;
  return luminance >= 150 ? BOARD_SELECTED_FG_LIGHT : BOARD_SELECTED_FG_DARK;
}
function applyBoardSelectedColor(rawColor, options = {}) {
  const normalized = normalizeHexColor(rawColor) || BOARD_SELECTED_BG_DEFAULT;
  const textColor = computeReadableTextColor(normalized);
  document.documentElement.style.setProperty("--board-selected-bg", normalized);
  document.documentElement.style.setProperty("--board-selected-fg", textColor);
  if (boardSelectedColorEl) boardSelectedColorEl.value = normalized;
  if (boardSelectedColorHexEl) boardSelectedColorHexEl.value = normalized;
  if (boardSelectedPreviewEl) {
    boardSelectedPreviewEl.style.backgroundColor = normalized;
    boardSelectedPreviewEl.style.color = textColor;
    boardSelectedPreviewEl.style.borderColor = normalized;
  }
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(BOARD_SELECTED_BG_STORAGE_KEY, normalized);
    } catch {
    }
  }
}
function installBoardSelectionColorOverride(rawColor = BOARD_SELECTED_BG_DEFAULT) {
  const normalized = normalizeHexColor(rawColor) || BOARD_SELECTED_BG_DEFAULT;
  const textColor = computeReadableTextColor(normalized);
  let style = document.getElementById("board-selection-color-override");
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement("style");
    style.id = "board-selection-color-override";
    document.head.appendChild(style);
  }
  style.textContent = `
    #board-body .is-selected td:first-child,
    #view-main #board-body .is-selected td:first-child {
      background: ${normalized} !important;
      border-color: ${normalized} !important;
      color: ${textColor} !important;
    }
    #board-body .is-selected:hover td:first-child,
    #view-main #board-body .is-selected:hover td:first-child {
      background: ${normalized} !important;
      border-color: ${normalized} !important;
      color: ${textColor} !important;
    }
  `;
}
function bindBoardSelectedColorPalette() {
  let storedColor = "";
  try {
    storedColor = window.localStorage.getItem(BOARD_SELECTED_BG_STORAGE_KEY) || "";
  } catch {
    storedColor = "";
  }
  let shouldForceDefault = false;
  try {
    shouldForceDefault = window.localStorage.getItem(BOARD_SELECTED_BG_MIGRATION_KEY) !== "1";
  } catch {
    shouldForceDefault = false;
  }
  if (shouldForceDefault) {
    storedColor = BOARD_SELECTED_BG_DEFAULT;
    try {
      window.localStorage.setItem(BOARD_SELECTED_BG_STORAGE_KEY, BOARD_SELECTED_BG_DEFAULT);
      window.localStorage.setItem(BOARD_SELECTED_BG_MIGRATION_KEY, "1");
    } catch {
    }
  }
  const initialColor = normalizeHexColor(storedColor) || BOARD_SELECTED_BG_DEFAULT;
  applyBoardSelectedColor(initialColor, { persist: false });
  installBoardSelectionColorOverride(initialColor);
  if (!boardSelectedColorEl && !boardSelectedColorHexEl) return;
  boardSelectedColorEl == null ? void 0 : boardSelectedColorEl.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    applyBoardSelectedColor(target.value);
    installBoardSelectionColorOverride(target.value);
  });
  boardSelectedColorHexEl == null ? void 0 : boardSelectedColorHexEl.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const normalized = normalizeHexColor(target.value);
    applyBoardSelectedColor(normalized || (boardSelectedColorEl == null ? void 0 : boardSelectedColorEl.value) || BOARD_SELECTED_BG_DEFAULT);
    installBoardSelectionColorOverride(normalized || (boardSelectedColorEl == null ? void 0 : boardSelectedColorEl.value) || BOARD_SELECTED_BG_DEFAULT);
  });
  boardSelectedColorApplyEl == null ? void 0 : boardSelectedColorApplyEl.addEventListener("click", () => {
    const raw = (boardSelectedColorHexEl == null ? void 0 : boardSelectedColorHexEl.value) || (boardSelectedColorEl == null ? void 0 : boardSelectedColorEl.value) || BOARD_SELECTED_BG_DEFAULT;
    const normalized = normalizeHexColor(raw);
    applyBoardSelectedColor(normalized || BOARD_SELECTED_BG_DEFAULT);
    installBoardSelectionColorOverride(normalized || BOARD_SELECTED_BG_DEFAULT);
  });
  boardSelectedColorResetEl == null ? void 0 : boardSelectedColorResetEl.addEventListener("click", () => {
    try {
      window.localStorage.removeItem(BOARD_SELECTED_BG_STORAGE_KEY);
    } catch {
    }
    applyBoardSelectedColor(BOARD_SELECTED_BG_DEFAULT, { persist: false });
    installBoardSelectionColorOverride(BOARD_SELECTED_BG_DEFAULT);
  });
}
function formatCny(cents) {
  const value = Number(cents || 0);
  if (!Number.isFinite(value)) return "¥ 0.00";
  return `¥ ${(value / 100).toFixed(2)}`;
}
function isServedOrderItem(item) {
  if (item && typeof item.served === "boolean") return item.served;
  const status = String((item == null ? void 0 : item.status) || "").trim().toUpperCase();
  return status === "SERVED";
}
function syncSelectedSummaryActionState(data = selectedTablePanelCache) {
  const selectedNo = String(selectedTableNo || "").trim().toUpperCase();
  const items = Array.isArray(data == null ? void 0 : data.items) ? data.items : [];
  const enabled = Boolean(selectedNo) && items.length > 0;
  if (selectedPrintBtnEl instanceof HTMLButtonElement) {
    selectedPrintBtnEl.disabled = !enabled;
  }
  if (selectedCheckoutBtnEl instanceof HTMLButtonElement) {
    selectedCheckoutBtnEl.disabled = !enabled;
  }
}
function getFixedViewBottomGap() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--fixed-view-bottom-gap") || getComputedStyle(document.body).getPropertyValue("--fixed-view-bottom-gap") || "16";
  const parsed = Number.parseFloat(String(raw).trim());
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 16;
}
function getFixedViewViewportHeight() {
  const inner = window.innerHeight || 0;
  const client = document.documentElement.clientHeight || 0;
  const visual = window.visualViewport ? Number(window.visualViewport.height || 0) : 0;
  const outer = window.outerHeight || 0;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportCandidates = [inner, client, visual].filter((value) => Number.isFinite(value) && value > 0);
  const viewportMax = viewportCandidates.length ? Math.max(...viewportCandidates) : 0;
  const viewportHeight = viewportMax;
  const isLandscape = viewportWidth > viewportHeight;
  const useTallDeviceFallback = !isLandscape && (viewportWidth <= 1200 || viewportHeight >= viewportWidth);
  const screenHeight = window.screen && useTallDeviceFallback ? Number(window.screen.height || 0) : 0;
  const screenAvailHeight = window.screen && useTallDeviceFallback ? Number(window.screen.availHeight || 0) : 0;
  const outerHeight = useTallDeviceFallback ? outer : 0;
  return Math.max(viewportHeight, outerHeight, screenHeight, screenAvailHeight);
}
function syncFixedViewViewportHeight() {
  const height = getFixedViewViewportHeight();
  if (height > 0) {
    document.documentElement.style.setProperty("--fixed-view-viewport-height", `${height}px`);
  }
  return height;
}
function updateMainOrderTableScrollLimit() {
  const view = document.getElementById("view-main");
  if (!(view instanceof Element) || !view.classList.contains("active")) return;
  const workspace = view.querySelector(".workspace-layout");
  const tableWrap = view.querySelector(".main-order-table-wrap");
  const actions = view.querySelector(".summary-actions");
  const summary = view.querySelector(".summary-box");
  const status = view.querySelector("#selected-table-status:not(.hidden)");
  if (!(workspace instanceof HTMLElement) || !(tableWrap instanceof HTMLElement)) return;
  const viewportHeight = syncFixedViewViewportHeight();
  const workspaceTop = workspace.getBoundingClientRect().top;
  if (!workspaceTop || !viewportHeight) return;
  const workspaceBottom = viewportHeight - getFixedViewBottomGap();
  const minWorkspaceHeight = window.matchMedia("(orientation: landscape) and (min-width: 520px)").matches ? 220 : 320;
  const workspaceHeight = Math.floor(Math.max(minWorkspaceHeight, workspaceBottom - workspaceTop));
  workspace.style.setProperty("--main-workspace-height", `${workspaceHeight}px`);
  const wrapTop = tableWrap.getBoundingClientRect().top;
  if (!wrapTop) return;
  const actionsHeight = actions instanceof HTMLElement ? actions.offsetHeight : 0;
  const summaryHeight = summary instanceof HTMLElement ? summary.offsetHeight : 0;
  const statusHeight = status instanceof HTMLElement ? status.offsetHeight : 0;
  const footerHeight = window.matchMedia("(orientation: landscape) and (min-width: 520px)").matches ? Math.max(actionsHeight, summaryHeight) : actionsHeight + summaryHeight;
  const reservedHeight = footerHeight + statusHeight + 28;
  const availableHeight = Math.floor(Math.max(120, workspaceBottom - wrapTop - reservedHeight));
  tableWrap.style.setProperty("--main-order-table-height", `${availableHeight}px`);
}
function updateMenuRecordScrollLimit() {
  const view = document.getElementById("view-menu");
  if (!(view instanceof Element) || !view.classList.contains("active")) return;
  const shell = view.querySelector(".menu-record-shell");
  if (!(shell instanceof HTMLElement)) return;
  const viewportHeight = syncFixedViewViewportHeight();
  const shellTop = shell.getBoundingClientRect().top;
  if (!shellTop || !viewportHeight) return;
  const shellBottom = viewportHeight - getFixedViewBottomGap();
  const minShellHeight = window.matchMedia("(orientation: landscape) and (min-width: 520px)").matches ? 220 : 320;
  const shellHeight = Math.floor(Math.max(minShellHeight, shellBottom - shellTop));
  shell.style.setProperty("--menu-record-height", `${shellHeight}px`);
}
function renderSelectedOrderBoard(data) {
  if (!selectedOrderBodyEl || !selectedTotalEl) return;
  if (data && typeof data === "object") {
    selectedTablePanelCache = data;
  }
  const selectedNo = String((data == null ? void 0 : data.selected_table_no) || "").trim().toUpperCase();
  const summary = (data == null ? void 0 : data.bill_summary) || {};
  const items = Array.isArray(data == null ? void 0 : data.items) ? data.items : [];
  const remarkBreakdown = buildOrderRemarkBreakdown(items, data == null ? void 0 : data.order_note);
  renderSelectedTableStatus(data);
  selectedTotalEl.textContent = formatCny(summary.total_cents || 0);
  syncSelectedSummaryActionState(data);
  if (!selectedNo) {
    selectedOrderBodyEl.innerHTML = `<tr><td colspan="4">${t("main_selected_empty", "请选择左侧桌台查看明细")}</td></tr>`;
    requestAnimationFrame(updateMainOrderTableScrollLimit);
    return;
  }
  if (!items.length) {
    selectedOrderBodyEl.innerHTML = `<tr><td colspan="4">${tFmt("main_table_empty", "桌台 {table} 暂无点菜记录", { table: selectedNo })}</td></tr>`;
    requestAnimationFrame(updateMainOrderTableScrollLimit);
    return;
  }
  selectedOrderBodyEl.innerHTML = items.map((item, index) => {
    const orderItemId = Number(item.order_item_id || 0);
    const qty = Number(item.qty || 0);
    const lineTotal = Number(item.line_total_cents || 0);
    const served = isServedOrderItem(item);
    const displayItemName = resolveDishNameByLanguage(item.item_name || "-");
    const note = String((remarkBreakdown.itemNotes[index] || "")).trim();
    const displayNote = translateOrderNoteByLanguage(note);
    const itemNoteHtml = note ? `<div class="selected-order-note">（${escapeHtml(displayNote || note)}）</div>` : "";
    const statusLabel = served ? t("main_status_served", "已上菜") : t("main_status_pending", "待上菜");
    return `<tr class="${served ? "is-served-row" : ""}" data-order-item-id="${orderItemId}" data-item-name="${encodeURIComponent(String(item.item_name || ""))}" data-table-no="${escapeHtml(selectedNo)}"><td><div class="selected-order-name">${escapeHtml(displayItemName)}</div>${itemNoteHtml}</td><td class="t-center">x${qty}</td><td class="t-right">${formatCny(
      lineTotal
    )}</td><td class="t-center item-status-cell"><label class="serve-toggle ${served ? "is-served" : "is-pending"}"><input class="order-serve-checkbox" type="checkbox" ${served ? "checked" : ""} ${orderItemId > 0 ? "" : "disabled"} data-order-item-id="${orderItemId}" aria-label="${t("main_mark_served", "标记上菜")}" /><span>${statusLabel}</span></label></td></tr>`;
  }).join("");
  bindSelectedOrderStatusLongPressDelete();
  requestAnimationFrame(updateMainOrderTableScrollLimit);
  if (appDisplayLanguageKey === "ug_cn") {
    void ensureOrderNoteI18nMapForCurrentLanguage({ items, order_note: remarkBreakdown.commonNote });
  }
}
function bindSelectedOrderStatusLongPressDelete() {
  if (!selectedOrderBodyEl || selectedOrderStatusLongPressBound) return;
  let pressTimer = null;
  let activePayload = null;
  let suppressToggleClickUntil = 0;
  const clearPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (activePayload && activePayload.toggle instanceof Element) {
      activePayload.toggle.classList.remove("is-delete-pressing");
    }
    activePayload = null;
  };
  const resolvePendingTogglePayload = (eventTarget) => {
    if (!(eventTarget instanceof Element)) return null;
    const toggle = eventTarget.closest(".serve-toggle.is-pending");
    if (!(toggle instanceof Element)) return null;
    const row = toggle.closest("tr[data-order-item-id]");
    if (!(row instanceof HTMLTableRowElement)) return null;
    const orderItemId = Number(row.getAttribute("data-order-item-id") || "0");
    const tableNo = String(row.getAttribute("data-table-no") || "").trim().toUpperCase();
    if (!Number.isFinite(orderItemId) || orderItemId <= 0 || !tableNo) return null;
    let itemName = "";
    try {
      itemName = decodeURIComponent(String(row.getAttribute("data-item-name") || ""));
    } catch {
      itemName = String(row.getAttribute("data-item-name") || "");
    }
    return { toggle, row, orderItemId, tableNo, itemName };
  };
  selectedOrderBodyEl.addEventListener("pointerdown", (event) => {
    if (typeof event.button === "number" && event.button !== 0) return;
    const payload = resolvePendingTogglePayload(event.target);
    if (!payload) return;
    clearPress();
    activePayload = payload;
    payload.toggle.classList.add("is-delete-pressing");
    pressTimer = setTimeout(() => {
      const current = activePayload;
      suppressToggleClickUntil = Date.now() + 900;
      clearPress();
      if (current) {
        void handleStatusLongPressDeleteSelectedOrderItem(current.tableNo, current.orderItemId, current.itemName);
      }
    }, 650);
  }, true);
  selectedOrderBodyEl.addEventListener("pointerup", clearPress, true);
  selectedOrderBodyEl.addEventListener("pointercancel", clearPress, true);
  selectedOrderBodyEl.addEventListener("pointerleave", clearPress, true);
  selectedOrderBodyEl.addEventListener("click", (event) => {
    if (Date.now() > suppressToggleClickUntil) return;
    const target = event.target;
    if (target instanceof Element && target.closest(".serve-toggle")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  selectedOrderStatusLongPressBound = true;
}
async function handleStatusLongPressDeleteSelectedOrderItem(tableNo, orderItemId, itemName) {
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  const safeName = String(itemName || "").trim() || `#${orderItemId}`;
  const ok = window.confirm(`确认删除菜品：${safeName}？`);
  if (!ok) {
    log(`Selected order status long-press delete dismissed: ${safeTableNo}/${safeName}`);
    return;
  }
  try {
    await api("/api/orders/items/remove", "POST", {
      table_no: safeTableNo,
      order_item_id: Number(orderItemId),
      operator_id: getCurrentOperatorId(),
      device_id: MAIN_DEVICE_ID,
      event_id: `order-item-delete-${Date.now()}`
    });
    const refreshTasks = [
      ["board", refreshBoard],
      ["stats", refreshStats],
      ["history", refreshOrderHistory],
      ["audit", refreshAuditLogs],
      ["selected", refreshSelectedTablePanel]
    ];
    const refreshResults = await Promise.allSettled(refreshTasks.map(([, fn]) => fn()));
    refreshResults.forEach((result, index) => {
      var _a2;
      if (result.status !== "rejected") return;
      const taskName = ((_a2 = refreshTasks[index]) == null ? void 0 : _a2[0]) || "unknown";
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason || "unknown error");
      log(`${taskName} refresh failed: ${reason}`);
    });
    log(`Selected order item deleted: ${safeTableNo}/${safeName}`);
  } catch (error) {
    log(`Selected order item delete failed: ${error.message}`);
  }
}
function bindMainOrderTableSizing() {
  window.addEventListener("resize", () => requestAnimationFrame(updateMainOrderTableScrollLimit));
  window.addEventListener("orientationchange", () => setTimeout(updateMainOrderTableScrollLimit, 180));
  window.addEventListener("resize", () => requestAnimationFrame(updateMenuRecordScrollLimit));
  window.addEventListener("orientationchange", () => setTimeout(updateMenuRecordScrollLimit, 180));
}
bindMainOrderTableSizing();
function bindFixedViewTouchGuard() {
  const allowedScrollSelector = [
    "#view-main .table-list",
    "#view-main .order-table tbody",
    "#view-menu .menu-record-category-inline",
    "#view-menu .menu-record-table-wrap",
    "#view-menu .menu-record-table tbody"
  ].join(",");
  document.addEventListener("touchmove", (event) => {
    const viewName = String(document.body.getAttribute("data-current-view") || "");
    if (viewName !== "main" && viewName !== "menu") return;
    const target = event.target;
    if (target instanceof Element && target.closest(allowedScrollSelector)) return;
    if (event.cancelable) event.preventDefault();
  }, { passive: false });
}
bindFixedViewTouchGuard();
function applyBoardSelectionState() {
  if (!boardBodyEl) return;
  boardBodyEl.querySelectorAll("tr[data-table-no]").forEach((row) => {
    const rowTable = String(row.getAttribute("data-table-no") || "").trim().toUpperCase();
    if (rowTable && rowTable === selectedTableNo) {
      row.classList.add("is-selected");
      return;
    }
    row.classList.remove("is-selected");
  });
}
async function selectBoardTable(tableNo) {
  const safe = String(tableNo || "").trim().toUpperCase();
  if (!safe) return;
  const data = await api("/api/tables/select", "POST", {
    operator_id: getCurrentOperatorId(),
    device_id: MAIN_DEVICE_ID,
    table_no: safe
  });
  setSelectedTableNo(data.selected_table_no || safe);
  renderSelectedOrderBoard(data);
  applyBoardSelectionState();
}
function bindBoardSelectionClicks() {
  if (!boardBodyEl || boardSelectionBound) return;
  boardBodyEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const row = target.closest("tr[data-table-no]");
    const tableNo = String((row == null ? void 0 : row.getAttribute("data-table-no")) || "").trim().toUpperCase();
    if (!tableNo) return;
    try {
      await selectBoardTable(tableNo);
    } catch (error) {
      log(`Table select failed: ${error.message}`);
    }
  });
  boardSelectionBound = true;
}
function bindSelectedOrderServeClicks() {
  if (!selectedOrderBodyEl || selectedOrderServeBound) return;
  selectedOrderBodyEl.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("order-serve-checkbox")) return;
    const orderItemId = Number(target.getAttribute("data-order-item-id") || "0");
    const tableNo = String(selectedTableNo || "").trim().toUpperCase();
    if (orderItemId <= 0 || !tableNo) return;
    const nextServed = target.checked;
    target.disabled = true;
    try {
      const data = await api("/api/orders/items/served", "POST", {
        operator_id: getCurrentOperatorId(),
        device_id: MAIN_DEVICE_ID,
        table_no: tableNo,
        order_item_id: orderItemId,
        served: nextServed
      });
      setSelectedTableNo((data == null ? void 0 : data.selected_table_no) || tableNo);
      renderSelectedOrderBoard(data || {});
      applyBoardSelectionState();
      await refreshBoard();
      log(`Table ${tableNo} item#${orderItemId} ${nextServed ? "served" : "pending"}`);
    } catch (error) {
      target.checked = !nextServed;
      log(`Item status update failed: ${error.message}`);
    } finally {
      target.disabled = false;
    }
  });
  selectedOrderServeBound = true;
}
function buildSelectedTablePrintPayload(previewData = null, options = {}) {
  const panel = selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : {};
  const tableNo = String((panel == null ? void 0 : panel.selected_table_no) || selectedTableNo || "").trim().toUpperCase();
  const summary = ((previewData == null ? void 0 : previewData.bill_summary) || (panel == null ? void 0 : panel.bill_summary) || {});
  const sourceItems = Array.isArray(panel == null ? void 0 : panel.items) ? panel.items : [];
  const storeName = getStoreDisplayName();
  const remarkBreakdown = buildOrderRemarkBreakdown(sourceItems, panel == null ? void 0 : panel.order_note);
  const forcedDisplayLanguage = String((options == null ? void 0 : options.forceDisplayLanguage) || "").trim();
  const displayLanguage = forcedDisplayLanguage ? normalizeAppDisplayLanguage(forcedDisplayLanguage) : normalizeAppDisplayLanguage(appDisplayLanguageKey);
  const isUyghur = displayLanguage === "ug_cn";
  const displayRemark = translateOrderNoteByLanguage(remarkBreakdown.commonNote, displayLanguage);
  if (!tableNo) throw new Error("请先选择桌台");
  if (!sourceItems.length) throw new Error("当前桌台暂无可打印菜品");
  const widthMm = Number((printerWidthMmEl == null ? void 0 : printerWidthMmEl.value) || "58") >= 76 ? 80 : 58;
  const items = sourceItems.map((item, index) => {
    const rawQty = Number((item == null ? void 0 : item.qty) || 1);
    const qty = Number.isFinite(rawQty) && rawQty > 0 ? rawQty : 1;
    const rawLineTotal = Number((item == null ? void 0 : item.line_total_cents) || 0);
    const lineTotal = Number.isFinite(rawLineTotal) && rawLineTotal > 0 ? rawLineTotal : 0;
    const rawUnitPrice = Number((item == null ? void 0 : item.unit_price_cents) || Math.round(lineTotal / qty) || 0);
    const unitPrice = Number.isFinite(rawUnitPrice) && rawUnitPrice > 0 ? rawUnitPrice : 0;
    const itemRemark = String((remarkBreakdown.itemNotes[index] || "")).trim();
    return {
      name: displayLanguage === "ug_cn" ? resolveDishNameByLanguage((item == null ? void 0 : item.item_name) || "-", displayLanguage) : String((item == null ? void 0 : item.item_name) || "-").trim() || "-",
      qty,
      price_cents: unitPrice,
      note: itemRemark ? translateOrderNoteByLanguage(itemRemark, displayLanguage) : ""
    };
  });
  const orderId = Number((previewData == null ? void 0 : previewData.order_id) || (panel == null ? void 0 : panel.order_id) || 0);
  return {
    title: isUyghur ? `${storeName} تالون` : `${storeName} 账单小票`,
    store_name: storeName,
    order_no: orderId > 0 ? `ORD-${orderId}` : `ORD-${Date.now()}`,
    table_no: tableNo,
    width_mm: widthMm,
    item_font_size: getPrinterItemFontSize(),
    display_language: displayLanguage,
    items,
    total_cents: Math.max(0, Number((summary == null ? void 0 : summary.total_cents) || 0)),
    remark: displayRemark,
    footer: isUyghur ? "قايتا كېلىڭ" : "欢迎下次光临"
  };
}
async function buildSelectedTablePrintPayloadResolved(previewData = null, options = {}) {
  const panel = selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : {};
  const sourceItems = Array.isArray(panel == null ? void 0 : panel.items) ? panel.items : [];
  const remarkBreakdown = buildOrderRemarkBreakdown(sourceItems, panel == null ? void 0 : panel.order_note);
  const forceDisplayLanguage = String((options == null ? void 0 : options.forceDisplayLanguage) || "").trim();
  if (normalizeAppDisplayLanguage(forceDisplayLanguage || appDisplayLanguageKey) === "ug_cn") {
    await ensureOrderNoteI18nMapForCurrentLanguage({ items: sourceItems, order_note: remarkBreakdown.commonNote }, { rerenderOnResolve: false });
  }
  return buildSelectedTablePrintPayload(previewData, options);
}
async function handleSelectedTablePrint() {
  const tableNo = String(selectedTableNo || "").trim().toUpperCase();
  if (!tableNo) throw new Error("请先选择桌台");
  const preview = await api("/api/orders/checkout-preview", "POST", { table_no: tableNo });
  const payload = await buildSelectedTablePrintPayloadResolved(preview);
  await printNativePrinterPayload(payload);
}
function getSelectedHistoryOrder() {
  if (!Array.isArray(historyOrdersCache) || !historyOrdersCache.length) return null;
  return historyOrdersCache.find((row) => Number(row == null ? void 0 : row.order_id) === selectedHistoryOrderId) || null;
}
function buildHistoryOrderPrintPayload(order) {
  if (!order || typeof order !== "object") {
    throw new Error("请先选择历史订单");
  }
  const widthMm = Number((printerWidthMmEl == null ? void 0 : printerWidthMmEl.value) || "58") >= 76 ? 80 : 58;
  const storeName = getStoreDisplayName();
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => {
    const qty = Math.max(0, Number((item == null ? void 0 : item.qty) || 0));
    const unitPrice = Math.max(0, Number((item == null ? void 0 : item.unit_price_cents) || 0));
    return {
      name: String((item == null ? void 0 : item.item_name) || "-").trim() || "-",
      qty,
      price_cents: unitPrice,
      note: String((item == null ? void 0 : item.note) || "").trim()
    };
  });
  return {
    title: `${storeName} 账单小票`,
    store_name: storeName,
    order_no: `ORD-${Number(order.order_id || 0) || Date.now()}`,
    table_no: String(order.table_no || "-").trim().toUpperCase() || "-",
    width_mm: widthMm,
    item_font_size: getPrinterItemFontSize(),
    display_language: "zh_cn",
    items,
    total_cents: Math.max(0, Number(order.total_cents || 0)),
    remark: String(order.order_note || "").trim(),
    footer: "欢迎下次光临"
  };
}
async function handleHistoryOrderPrint() {
  const order = getSelectedHistoryOrder();
  if (!order) throw new Error("请先选择历史订单");
  const payload = buildHistoryOrderPrintPayload(order);
  await printNativePrinterPayload(payload, { forceDisplayLanguage: "zh_cn" });
}
async function handleSelectedTableCheckout() {
  const tableNo = String(selectedTableNo || "").trim().toUpperCase();
  if (!tableNo) throw new Error("请先选择桌台");
  const panel = selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : null;
  const optimisticItems = Array.isArray(panel == null ? void 0 : panel.items) ? panel.items : [];
  const optimisticSummary = panel && typeof panel.bill_summary === "object" ? panel.bill_summary : null;
  openCheckoutConfirmModal(tableNo, optimisticSummary, { items: optimisticItems });
  try {
    const preview = await api("/api/orders/checkout-preview", "POST", { table_no: tableNo });
    checkoutModalPreviewSummaryCache = (preview == null ? void 0 : preview.bill_summary) || null;
    checkoutModalPreviewOptionsCache = { items: optimisticItems };
    if (checkoutPreviewViewEl && !(checkoutModalEl != null && checkoutModalEl.classList.contains("hidden")) && checkoutModalPreviewTableNo === tableNo) {
      checkoutPreviewViewEl.innerHTML = renderCheckoutPreviewHtml(tableNo, checkoutModalPreviewSummaryCache, checkoutModalPreviewOptionsCache || { items: optimisticItems });
    }
    return preview;
  } catch (error) {
    if (optimisticSummary || optimisticItems.length) {
      log(`checkout preview refresh failed, fallback to cached board data: ${error.message}`);
      return { table_no: tableNo, bill_summary: optimisticSummary || {} };
    }
    throw error;
  }
}
async function captureCheckoutAutoPrintPayloads(tableNos) {
  if (!printerAutoCheckoutEnabled || !Array.isArray(tableNos) || tableNos.length !== 1) return [];
  const tableNo = String(tableNos[0] || "").trim().toUpperCase();
  const panel = selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : null;
  if (!tableNo || String((panel == null ? void 0 : panel.selected_table_no) || selectedTableNo || "").trim().toUpperCase() !== tableNo) {
    return [];
  }
  if (!Array.isArray(panel == null ? void 0 : panel.items) || !(panel == null ? void 0 : panel.items.length)) {
    return [];
  }
  try {
    const previewData = checkoutModalPreviewTableNo === tableNo && checkoutModalPreviewSummaryCache ? { bill_summary: checkoutModalPreviewSummaryCache } : null;
    return [await buildSelectedTablePrintPayloadResolved(previewData, { forceDisplayLanguage: "zh_cn" })];
  } catch (error) {
    log(`table ${tableNo} checkout auto print payload build failed: ${error.message}`);
    return [];
  }
}
async function runCheckoutAutoPrint(payloads) {
  if (!Array.isArray(payloads) || !payloads.length) return;
  if (!isSettingsPrinterConnected()) {
    log("checkout auto print skipped: printer not connected");
    return;
  }
  for (const payload of payloads) {
    try {
      await printNativePrinterPayload(payload, { forceDisplayLanguage: "zh_cn" });
      log(`table ${String((payload == null ? void 0 : payload.table_no) || "-")} auto printed after checkout`);
    } catch (error) {
      log(`table ${String((payload == null ? void 0 : payload.table_no) || "-")} auto print after checkout failed: ${error.message}`);
    }
  }
}
function bindSelectedSummaryActions() {
  if (selectedPrintBtnEl instanceof HTMLButtonElement) {
    selectedPrintBtnEl.addEventListener("click", async () => {
      selectedPrintBtnEl.disabled = true;
      try {
        await handleSelectedTablePrint();
        showActionFeedback(true, t("main_print_success", "打印小票成功"));
        log(`table ${selectedTableNo || "-"} ticket printed`);
      } catch (error) {
        showActionFeedback(false, t("main_print_failed", "打印小票失败"));
        log(`Selected table print failed: ${error.message}`);
      } finally {
        syncSelectedSummaryActionState();
      }
    });
  }
  if (selectedCheckoutBtnEl instanceof HTMLButtonElement) {
    selectedCheckoutBtnEl.addEventListener("click", async () => {
      selectedCheckoutBtnEl.disabled = true;
      try {
        await handleSelectedTableCheckout();
        log(`table ${selectedTableNo || "-"} checkout confirmation opened`);
      } catch (error) {
        showActionFeedback(false, t("main_checkout_failed", "买单失败"));
        log(`Selected table checkout failed: ${error.message}`);
      } finally {
        syncSelectedSummaryActionState();
      }
    });
  }
}
async function refreshSelectedTablePanel() {
  const query = new URLSearchParams({
    operator: getCurrentOperatorId(),
    device_id: MAIN_DEVICE_ID
  });
  const data = await api(`/api/tables/selected?${query.toString()}`, "GET");
  setSelectedTableNo((data == null ? void 0 : data.selected_table_no) || "");
  renderSelectedOrderBoard(data || {});
  applyBoardSelectionState();
}
function ensureSpeechRecognizer() {
  if (!isLegacyWebSpeechDebugEnabled()) return null;
  if (speechRecognizer) return speechRecognizer;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  speechRecognizer = new SpeechRecognition();
  speechRecognizer.lang = "zh-CN";
  speechRecognizer.continuous = true;
  speechRecognizer.interimResults = true;
  speechRecognizer.maxAlternatives = 1;
  speechRecognizer.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript || "";
      if (event.results[i].isFinal) {
        dictationFinalText += text;
      } else {
        interim += text;
      }
    }
    voiceInputEl.value = `${dictationFinalText}${interim}`.trim();
    updateVoiceDebug({
      source: "legacy-dictation",
      interim_transcript: interim.trim(),
      final_transcript: dictationFinalText.trim(),
      note: "legacy dictation updated"
    });
  };
  speechRecognizer.onerror = (event) => {
    setDictationStatus(`Dictation failed: ${event.error}`);
    log(`Dictation failed: ${event.error}`);
    updateVoiceDebug({ source: "legacy-dictation", note: `dictation error: ${event.error}` });
  };
  speechRecognizer.onend = () => {
    dictationActive = false;
    const startBtn = document.getElementById("dictation-start");
    const stopBtn = document.getElementById("dictation-stop");
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    setDictationStatus("Dictation stopped");
  };
  return speechRecognizer;
}
function ensureDishRecognizer() {
  if (!isLegacyWebSpeechDebugEnabled()) return null;
  if (dishRecognizer) return dishRecognizer;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  dishRecognizer = new SpeechRecognition();
  dishRecognizer.lang = "zh-CN";
  dishRecognizer.continuous = true;
  dishRecognizer.interimResults = true;
  dishRecognizer.maxAlternatives = 1;
  dishRecognizer.onresult = (event) => {
    const draftEl = document.getElementById("dish-voice-draft");
    if (!draftEl) return;
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript || "";
      if (event.results[i].isFinal) {
        dishDraftFinalText += text;
      } else {
        interim += text;
      }
    }
    draftEl.value = `${dishDraftFinalText}${interim}`.trim();
    updateVoiceDebug({
      source: "menu-dictation",
      interim_transcript: interim.trim(),
      final_transcript: dishDraftFinalText.trim(),
      note: "menu dictation updated"
    });
  };
  dishRecognizer.onerror = (event) => {
    setDishDictationStatus(`Dish dictation failed: ${event.error}`);
    log(`Dish dictation failed: ${event.error}`);
    updateVoiceDebug({ source: "menu-dictation", note: `menu dictation error: ${event.error}` });
  };
  dishRecognizer.onend = () => {
    var _a2, _b2;
    dishDictationActive = false;
    (_a2 = document.getElementById("dish-dictation-start")) == null ? void 0 : _a2.removeAttribute("disabled");
    (_b2 = document.getElementById("dish-dictation-stop")) == null ? void 0 : _b2.setAttribute("disabled", "true");
    setDishDictationStatus("Dish dictation stopped");
  };
  return dishRecognizer;
}
function ensureSingleActionRecognizer() {
  if (!isLegacyWebSpeechDebugEnabled()) return null;
  if (singleActionRecognizer) return singleActionRecognizer;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  singleActionRecognizer = new SpeechRecognition();
  singleActionRecognizer.lang = "zh-CN";
  singleActionRecognizer.continuous = true;
  singleActionRecognizer.interimResults = true;
  singleActionRecognizer.maxAlternatives = 1;
  singleActionRecognizer.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript || "";
      if (event.results[i].isFinal) {
        singleActionFinalText += text;
      } else {
        interim += text;
      }
    }
    if (voiceCommandTextEl) {
      voiceCommandTextEl.value = `${singleActionFinalText}${interim}`.trim();
    }
    updateVoiceDebug({
      source: "single-button-recognizer",
      interim_transcript: interim.trim(),
      final_transcript: singleActionFinalText.trim(),
      note: "single button recognizer updated"
    });
  };
  singleActionRecognizer.onerror = (event) => {
    log(`Single button dictation failed: ${event.error}`);
    updateVoiceDebug({ source: "single-button-recognizer", note: `single recognizer error: ${event.error}` });
  };
  singleActionRecognizer.onend = () => {
  };
  return singleActionRecognizer;
}
function ensureMenuSingleRecognizer() {
  if (!isLegacyWebSpeechDebugEnabled()) return null;
  if (menuSingleRecognizer) return menuSingleRecognizer;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  menuSingleRecognizer = new SpeechRecognition();
  menuSingleRecognizer.lang = "zh-CN";
  menuSingleRecognizer.continuous = true;
  menuSingleRecognizer.interimResults = true;
  menuSingleRecognizer.maxAlternatives = 1;
  menuSingleRecognizer.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript || "";
      if (event.results[i].isFinal) {
        menuSingleFinalText += text;
      } else {
        interim += text;
      }
    }
    if (menuVoicePreviewEl) {
      menuVoicePreviewEl.textContent = `${menuSingleFinalText}${interim}`.trim() || t("menu_voice_preview_empty", "暂无菜品语音文本");
    }
    updateVoiceDebug({
      source: "menu-single-recognizer",
      interim_transcript: interim.trim(),
      final_transcript: menuSingleFinalText.trim(),
      note: "menu single recognizer updated"
    });
  };
  menuSingleRecognizer.onerror = (event) => {
    log(`Menu single dictation failed: ${event.error}`);
    updateVoiceDebug({ source: "menu-single-recognizer", note: `menu single recognizer error: ${event.error}` });
  };
  menuSingleRecognizer.onend = () => {
  };
  return menuSingleRecognizer;
}
function isKlsLoggedIn() {
  return Boolean(String(klsAuthState.accessToken || "").trim());
}
function syncRouteGuardUi() {
  const locked = !isKlsLoggedIn();
  const busy = isVoiceInteractionLocked() || appUpdateForceLockActive;
  document.body.classList.toggle("auth-locked", locked);
  document.body.classList.toggle("voice-interaction-locked", busy);
  document.body.classList.toggle("app-update-force-locked", appUpdateForceLockActive);
  if (baseSkinEl instanceof HTMLLinkElement) {
    baseSkinEl.disabled = !locked;
    baseSkinEl.media = locked ? "all" : "not all";
  }
  if (previewFullSkinEl instanceof HTMLLinkElement) {
    previewFullSkinEl.disabled = locked;
    previewFullSkinEl.media = locked ? "not all" : "all";
  }
  if (runtimeCompatSkinEl instanceof HTMLLinkElement) {
    runtimeCompatSkinEl.disabled = locked;
    runtimeCompatSkinEl.media = locked ? "not all" : "all";
  }
  document.querySelectorAll(".top-links .nav-tab").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    btn.disabled = locked || busy;
  });
  if (topSettingsBtnEl instanceof HTMLButtonElement) {
    topSettingsBtnEl.disabled = locked || busy;
  }
  if (topProfileBtnEl instanceof HTMLButtonElement) {
    topProfileBtnEl.disabled = locked || busy;
  }
  if (busy) {
    topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
  }
}
function logUiRuntimeSnapshot(tag = "runtime") {
  try {
    const nav = document.querySelector(".top-links");
    const navGap = nav ? getComputedStyle(nav).gap : "n/a";
    const secondNavTab = nav ? nav.querySelector(".nav-tab + .nav-tab") : null;
    const tabMarginLeft = secondNavTab ? getComputedStyle(secondNavTab).marginLeft : "n/a";
    const activeSkin = previewFullSkinEl instanceof HTMLLinkElement && previewFullSkinEl.disabled !== true ? "preview_nonauth.css" : "styles.css";
    let hasTabMarginRule = false;
    try {
      for (const sheet of Array.from(document.styleSheets || [])) {
        const href = String(sheet && sheet.href || "");
        if (!/preview_nonauth\.css/i.test(href)) continue;
        for (const rule of Array.from(sheet.cssRules || [])) {
          if (String(rule && rule.selectorText || "").trim() === ".top-links .nav-tab + .nav-tab") {
            hasTabMarginRule = true;
            break;
          }
        }
      }
    } catch {
    }
    log(`UI snapshot(${tag}): view=${currentViewName} locked=${!isKlsLoggedIn()} skin=${activeSkin} top_links_gap=${navGap} top_tab_margin_left=${tabMarginLeft} tab_margin_rule=${hasTabMarginRule} native_bridge=${hasNativeVoiceBridge()}`);
  } catch (error) {
    log(`UI snapshot(${tag}) failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
}
function setView(viewName, options = {}) {
  var _a2, _b2, _c2, _d2, _e2, _f2;
  const requestedView = String(viewName || "").trim();
  const force = Boolean(options.force);
  let targetViewName = requestedView;
  if (!force && isVoiceInteractionLocked() && requestedView && requestedView !== currentViewName) {
    return false;
  }
  if (!force && PROTECTED_VIEWS.has(requestedView) && !isKlsLoggedIn()) {
    targetViewName = "auth";
    if (options.silent !== true) {
      showActionFeedback(false, "请先登录");
    }
  }
  const map = {
    auth: { view: "view-auth" },
    main: { view: "view-main", nav: "nav-main" },
    menu: { view: "view-menu", nav: "nav-menu" },
    sales: { view: "view-sales", nav: "nav-sales" },
    settings: { view: "view-settings" },
    profile: { view: "view-profile" }
  };
  const target = map[targetViewName];
  if (!target) return false;
  (_a2 = document.getElementById(target.view)) == null ? void 0 : _a2.classList.add("active");
  if (target.nav) {
    (_b2 = document.getElementById(target.nav)) == null ? void 0 : _b2.classList.add("active");
  }
  for (const key of Object.keys(map)) {
    if (key === targetViewName) continue;
    const entry = map[key];
    (_c2 = document.getElementById(entry.view)) == null ? void 0 : _c2.classList.remove("active");
    if (entry.nav) {
      (_d2 = document.getElementById(entry.nav)) == null ? void 0 : _d2.classList.remove("active");
    }
  }
  if (currentViewName && currentViewName !== targetViewName) {
    const currentEntry = map[currentViewName];
    (_e2 = currentEntry == null ? void 0 : document.getElementById(currentEntry.view)) == null ? void 0 : _e2.classList.remove("active");
    if (currentEntry == null ? void 0 : currentEntry.nav) {
      (_f2 = document.getElementById(currentEntry.nav)) == null ? void 0 : _f2.classList.remove("active");
    }
  }
  currentViewName = targetViewName;
  document.body.classList.toggle("view-auth-active", targetViewName === "auth");
  document.body.setAttribute("data-current-view", targetViewName);
  if (targetViewName === "settings") {
    recoverSettingsPrinterStateOnViewEnter();
  }
  if (targetViewName === "main") {
    requestAnimationFrame(updateMainOrderTableScrollLimit);
  } else if (targetViewName === "menu") {
    requestAnimationFrame(updateMenuRecordScrollLimit);
  }
  return targetViewName === requestedView;
}
function bindTopActionIcons() {
  topNoticeBtnEl == null ? void 0 : topNoticeBtnEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!topNoticePanelEl) return;
    const isHidden = topNoticePanelEl.hasAttribute("hidden");
    if (isHidden) {
      topNoticePanelEl.removeAttribute("hidden");
    } else {
      topNoticePanelEl.setAttribute("hidden", "");
    }
  });
  topNoticeCloseEl == null ? void 0 : topNoticeCloseEl.addEventListener("click", (event) => {
    event.stopPropagation();
    topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
  });
  topNoticeClearEl == null ? void 0 : topNoticeClearEl.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (!isKlsLoggedIn()) {
      showActionFeedback(false, "请先登录");
      return;
    }
    try {
      const visibleItems = Array.isArray(klsNotificationState.items) ? klsNotificationState.items : [];
      visibleItems.forEach((item) => {
        if (item && item.id) klsNotificationState.dismissedIds.add(String(item.id));
      });
      persistKlsNotificationDismissedIds();
      await klsNotificationsReadAllAction();
      klsNotificationState.unreadCount = 0;
      renderKlsNotifications();
    } catch (error) {
      log(`KLS notification clear failed: ${String((error == null ? void 0 : error.message) || error)}`);
      showActionFeedback(false, "通知清空失败");
    }
  });
  topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
  topNoticePanelEl == null ? void 0 : topNoticePanelEl.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  document.addEventListener("click", (event) => {
    if (!topNoticePanelEl || topNoticePanelEl.hasAttribute("hidden")) return;
    const target = event.target;
    if (topNoticePanelEl.contains(target) || (topNoticeBtnEl == null ? void 0 : topNoticeBtnEl.contains(target))) return;
    topNoticePanelEl.setAttribute("hidden", "");
  });
  topProfileBtnEl == null ? void 0 : topProfileBtnEl.addEventListener("click", () => {
    topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
    bindProfilePage();
    if (!setView("profile")) return;
    if (isKlsLoggedIn()) {
      void klsProfileGetAction().catch((error) => {
        log(`Profile refresh failed: ${String((error == null ? void 0 : error.message) || error)}`);
      });
    }
  });
  topSettingsBtnEl == null ? void 0 : topSettingsBtnEl.addEventListener("click", async () => {
    topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
    if (!setView("settings")) return;
    bindSettingsCopyPage();
    await refreshTableNumberingConfig();
  });
}
function bindProfilePage() {
  if (profilePageBound) return;
  installProfilePagePolishStyle();
  profileShowPlansBtnEl == null ? void 0 : profileShowPlansBtnEl.addEventListener("click", () => {
    profileCurrentPlanEl == null ? void 0 : profileCurrentPlanEl.classList.add("hidden");
    profilePlanPickerEl == null ? void 0 : profilePlanPickerEl.classList.remove("hidden");
  });
  profileHidePlansBtnEl == null ? void 0 : profileHidePlansBtnEl.addEventListener("click", () => {
    profilePlanPickerEl == null ? void 0 : profilePlanPickerEl.classList.add("hidden");
    profileCurrentPlanEl == null ? void 0 : profileCurrentPlanEl.classList.remove("hidden");
  });
  document.querySelectorAll(".profile-plan-cta[data-plan-id]").forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const planId = String(btn.getAttribute("data-plan-id") || "").trim();
      if (!planId) return;
      showActionFeedback(true, `已选择套餐：${planId}`);
      log(`Profile plan selected: ${planId}`);
    });
  });
  profileEditNameBtnEl == null ? void 0 : profileEditNameBtnEl.addEventListener("click", () => {
    var _a2, _b2;
    if (!isKlsLoggedIn()) {
      showActionFeedback(false, "请先登录");
      return;
    }
    const currentName = sanitizeDisplayName(
      ((_a2 = klsAuthState.profile) == null ? void 0 : _a2.display_name) || ((_b2 = klsAuthState.user) == null ? void 0 : _b2.account) || (profileUserNameEl == null ? void 0 : profileUserNameEl.textContent) || ""
    );
    if (profileNameInputEl) profileNameInputEl.value = currentName;
    profileNameRowEl == null ? void 0 : profileNameRowEl.classList.add("is-editing");
    profileNameEditorEl == null ? void 0 : profileNameEditorEl.classList.remove("hidden");
    profileNameInputEl == null ? void 0 : profileNameInputEl.focus();
    profileNameInputEl == null ? void 0 : profileNameInputEl.select();
    void klsProfileGetAction().catch((error) => {
      log(`Profile refresh before edit failed: ${String((error == null ? void 0 : error.message) || error)}`);
    });
  });
  profileNameCancelBtnEl == null ? void 0 : profileNameCancelBtnEl.addEventListener("click", () => {
    closeProfileNameEditor();
  });
  profileNameSaveBtnEl == null ? void 0 : profileNameSaveBtnEl.addEventListener("click", async () => {
    const nextName = sanitizeDisplayName((profileNameInputEl == null ? void 0 : profileNameInputEl.value) || "");
    if (!nextName) {
      showActionFeedback(false, "店名（昵称）不能为空");
      return;
    }
    try {
      await klsProfileUpdateAction(nextName);
      closeProfileNameEditor();
      showActionFeedback(true, "店名已更新");
      log(`Store name updated: ${nextName}`);
    } catch (error) {
      const message = String((error == null ? void 0 : error.message) || error);
      if (message.includes("[401]")) {
        clearKlsAuthState();
        setView("auth", { force: true, silent: true });
        closeProfileNameEditor();
        showActionFeedback(false, "登录已过期，请重新登录");
        log(`Profile name update failed: ${message}`);
        return;
      }
      const reason = message.includes("->") ? String(message.split("->").pop() || "").trim() : "";
      showActionFeedback(false, reason ? `店名更新失败：${reason}` : "店名更新失败");
      log(`Profile name update failed: ${message}`);
    }
  });
  profileNameInputEl == null ? void 0 : profileNameInputEl.addEventListener("keydown", async (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeProfileNameEditor();
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    profileNameSaveBtnEl == null ? void 0 : profileNameSaveBtnEl.click();
  });
  profileLogoutBtnEl == null ? void 0 : profileLogoutBtnEl.addEventListener("click", async () => {
    if (!isKlsLoggedIn()) {
      clearKlsAuthState();
      setView("auth", { force: true, silent: true });
      showActionFeedback(false, "请先登录");
      return;
    }
    try {
      await klsLogoutAction();
      showActionFeedback(true, "已退出登录");
      setView("auth", { force: true, silent: true });
      log("Profile logout success");
    } catch (error) {
      clearKlsAuthState();
      setView("auth", { force: true, silent: true });
      showActionFeedback(false, "登录已失效，请重新登录");
      log(`Profile logout failed: ${String((error == null ? void 0 : error.message) || error)}`);
    }
  });
  profilePageBound = true;
}
function initLucideIcons() {
  const lucideApi = window.lucide;
  if (!lucideApi || typeof lucideApi.createIcons !== "function") return;
  try {
    lucideApi.createIcons();
  } catch {
  }
}
function resolveApiActionName(path, method = "GET") {
  const methodUpper = String(method || "GET").toUpperCase();
  const normalized = String(path || "").split("?")[0];
  if (/\/api\/voice-command/i.test(normalized)) return "语音指令";
  if (/\/api\/menu\/voice-command/i.test(normalized)) return "菜品录入";
  if (/\/api\/menu\/items/i.test(normalized) && methodUpper !== "GET") return "菜品配置";
  if (/\/api\/orders\/checkout-confirm/i.test(normalized)) return "买单";
  if (/\/api\/orders\/checkout-preview/i.test(normalized)) return "账单预览";
  if (/\/api\/orders\/items\/remove/i.test(normalized)) return "减菜";
  if (/\/api\/orders\/cancel-confirm/i.test(normalized)) return "撤桌";
  if (/\/api\/orders\/serve-item/i.test(normalized)) return "上菜状态";
  if (/\/api\/settings\/table-numbering/i.test(normalized)) return "桌号设置";
  if (/\/api\/stats\/config/i.test(normalized)) return "统计口径";
  if (/\/api\/sessions/i.test(normalized)) return "会话操作";
  if (methodUpper === "GET") return "查询";
  return "操作";
}
function speakActionFeedback(text) {
  const clean = String(text || "").trim();
  if (!clean) return;
  try {
    const bridge = window.AndroidVoiceBridge;
    if (bridge && typeof bridge.speakText === "function") {
      ensureNativeVoiceBridgeHandler();
      const accepted = Boolean(bridge.speakText(clean));
      if (accepted) {
        setVoicePromptPlaybackActive(true);
        return;
      }
    }
  } catch {
  }
  if (!("speechSynthesis" in window)) return;
  try {
    setVoicePromptPlaybackActive(false);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "zh-CN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setVoicePromptPlaybackActive(true);
    };
    utterance.onend = () => {
      setVoicePromptPlaybackActive(false);
    };
    utterance.onerror = () => {
      setVoicePromptPlaybackActive(false);
    };
    window.speechSynthesis.speak(utterance);
  } catch {
    setVoicePromptPlaybackActive(false);
  }
}
function stopActionFeedbackSpeech() {
  setVoicePromptPlaybackActive(false);
  try {
    const bridge = window.AndroidVoiceBridge;
    if (bridge && typeof bridge.stopSpeak === "function") {
      bridge.stopSpeak();
    }
  } catch {
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
    }
  }
}
async function interruptVoicePromptPlayback() {
  if (!voicePromptPlaybackActive) return;
  stopActionFeedbackSpeech();
  const waitStartAt = Date.now();
  while (voicePromptPlaybackActive && Date.now() - waitStartAt < 320) {
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }
}
function showActionFeedback(ok, text) {
  if (!actionFeedbackOverlayEl || !actionFeedbackBoxEl) return;
  ensureActionFeedbackOverlayLayer();
  const message = String(text || (ok ? "操作成功" : "操作失败")).trim() || (ok ? "操作成功" : "操作失败");
  actionFeedbackBoxEl.textContent = message;
  actionFeedbackBoxEl.classList.toggle("is-success", Boolean(ok));
  actionFeedbackBoxEl.classList.toggle("is-fail", !ok);
  actionFeedbackOverlayEl.style.display = "flex";
  actionFeedbackOverlayEl.removeAttribute("hidden");
  clearTimeout(actionFeedbackTimer);
  actionFeedbackTimer = setTimeout(() => {
    actionFeedbackOverlayEl.setAttribute("hidden", "");
    actionFeedbackOverlayEl.style.display = "none";
    actionFeedbackTimer = null;
  }, 1e3);
  speakActionFeedback(message);
}
function resolveIntentLabel(intent, fallback = "指令") {
  const key = String(intent || "").trim().toUpperCase();
  const map = {
    OPEN_TABLE: "开桌",
    ORDER_ITEM: "点菜",
    ADD_ITEM: "加菜",
    ADD_ORDER_NOTE: "备注",
    UPDATE_ORDER_NOTE: "修改备注",
    REMOVE_ORDER_NOTE: "删除备注",
    ADD_ITEM_NOTE: "新增菜品备注",
    UPDATE_ITEM_NOTE: "修改菜品备注",
    REMOVE_ITEM_NOTE: "删除菜品备注",
    REMOVE_ITEM: "减菜",
    CHECKOUT: "买单",
    CANCEL_TABLE: "撤桌",
    UNDO_LAST_ACTION: "取消账单",
    MENU_ADD: "新增菜品",
    MENU_DELETE: "删除菜品",
    MENU_EDIT: "修改菜品"
  };
  return map[key] || String(fallback || "指令");
}
function isAgentResultApplied(data) {
  if (!data || typeof data !== "object") return false;
  const perTableResults = Array.isArray(data.per_table_results) ? data.per_table_results : [];
  if (perTableResults.length) {
    return perTableResults.every((item) => isAgentResultApplied(item));
  }
  return data.applied === true;
}
function resolveAgentFailureReason(data) {
  if (!data || typeof data !== "object") return "";
  const message = String((data == null ? void 0 : data.message) || "").trim();
  if (message) return localizeAgentFailureMessage(message);
  const perTableResults = Array.isArray(data == null ? void 0 : data.per_table_results) ? data.per_table_results : [];
  for (const item of perTableResults) {
    const child = resolveAgentFailureReason(item);
    if (child) return child;
  }
  const stepResults = Array.isArray(data == null ? void 0 : data.step_results) ? data.step_results : [];
  for (const item of stepResults) {
    const child = resolveAgentFailureReason(item);
    if (child) return child;
  }
  return "";
}
function localizeAgentFailureMessage(rawMessage, fallback = "操作失败，请稍后重试") {
  const message = String(rawMessage || "").trim();
  if (!message) return String(fallback || "").trim() || "操作失败，请稍后重试";
  const normalized = message.toUpperCase();
  const codeMap = {
    AMBIGUOUS_COMMAND: "指令不够明确，请补充桌号或菜品后重试",
    INVALID_INPUT: "输入无效，请检查后重试",
    TARGET_NOT_FOUND: "未找到对应目标，请核对后重试",
    TARGET_ALREADY_EXISTS: "目标已存在，无需重复操作",
    RULE_VIOLATION: "当前操作不符合规则，请调整后重试",
    PROMPT_INJECTION_DETECTED: "检测到异常指令，已拒绝执行",
    MODEL_PLAN_ERROR: "语音解析失败，请重试",
    AGENT_FAILED: "语音执行失败，请重试"
  };
  if (Object.prototype.hasOwnProperty.call(codeMap, normalized)) {
    return codeMap[normalized];
  }
  const matchedCode = Object.keys(codeMap).find((code) => normalized.includes(code));
  if (matchedCode) {
    return codeMap[matchedCode];
  }
  return localizeRuntimeErrorMessage(message) || message;
}
function showAgentCommandFeedback(data, fallbackLabel = "指令") {
  const label = resolveIntentLabel(data == null ? void 0 : data.intent, fallbackLabel);
  const ok = isAgentResultApplied(data);
  if (ok) {
    showActionFeedback(true, `${label}成功`);
    return;
  }
  const reason = resolveAgentFailureReason(data);
  showActionFeedback(false, reason ? `${label}失败: ${reason}` : `${label}失败`);
}
function dispatchAgentFailureFeedback(data, fallbackLabel = "指令") {
  var _a2;
  if (!data || typeof data !== "object") return false;
  const action = String((data == null ? void 0 : data.ui_action) || "").trim().toUpperCase();
  if (action !== "AGENT_FAILED") return false;
  const label = resolveIntentLabel(data == null ? void 0 : data.intent, fallbackLabel);
  const message = localizeAgentFailureMessage(
    String((data == null ? void 0 : data.ui_text) || ((_a2 = data == null ? void 0 : data.ui_feedback) == null ? void 0 : _a2.text) || resolveAgentFailureReason(data) || "").trim()
  );
  const finalText = message || `${label}失败`;
  showActionFeedback(false, finalText);
  log(`Agent failure callback | action=${action} | text=${finalText}`);
  return true;
}
function normalizeApiPath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      return new URL(raw).pathname || "";
    }
  } catch {
  }
  return raw.split("?")[0] || "";
}
function parseKlsUtcMs(rawDateTime) {
  const text = String(rawDateTime || "").trim();
  if (!text) return NaN;
  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const withZone = /[zZ]|[+\-]\d{2}:\d{2}$/.test(normalized) ? normalized : `${normalized}Z`;
  const ms = Date.parse(withZone);
  return Number.isFinite(ms) ? ms : NaN;
}
function localizeRuntimeErrorMessage(rawMessage) {
  const message = String(rawMessage || "").trim();
  if (!message) return "";
  if (/subscription expired/i.test(message)) return "订阅已过期，请续费后重试";
  if (/login expired/i.test(message)) return "登录态已过期，请重新登录";
  if (/missing access token/i.test(message)) return "登录态缺失，请重新登录";
  if (/asr auth expired/i.test(message)) return "语音鉴权已过期，请重新登录";
  return message;
}
function getKlsSubscriptionExpireRaw() {
  const sub = klsAuthState.subscription && typeof klsAuthState.subscription === "object" ? klsAuthState.subscription : null;
  if (sub) {
    return String((sub == null ? void 0 : sub.expire_at) || "").trim();
  }
  return String(klsAuthState.gatewayExpireAt || "").trim();
}
function resetKlsSubscriptionNoticeState() {
  klsSubscriptionNoticeMarker = "";
  klsSubscriptionNoticeSent.day = false;
  klsSubscriptionNoticeSent.hour = false;
  klsSubscriptionNoticeSent.expired = false;
}
function syncKlsSubscriptionNoticeMarker(expireMarker) {
  const marker = String(expireMarker || "").trim();
  if (!marker) {
    resetKlsSubscriptionNoticeState();
    return;
  }
  if (marker === klsSubscriptionNoticeMarker) return;
  klsSubscriptionNoticeMarker = marker;
  klsSubscriptionNoticeSent.day = false;
  klsSubscriptionNoticeSent.hour = false;
  klsSubscriptionNoticeSent.expired = false;
}
function maybeNotifyKlsSubscriptionExpiry() {
  if (!isKlsLoggedIn()) {
    resetKlsSubscriptionNoticeState();
    return;
  }
  const expireRaw = getKlsSubscriptionExpireRaw();
  if (!expireRaw) {
    resetKlsSubscriptionNoticeState();
    return;
  }
  const expireMs = parseKlsUtcMs(expireRaw);
  if (!Number.isFinite(expireMs)) {
    resetKlsSubscriptionNoticeState();
    return;
  }
  syncKlsSubscriptionNoticeMarker(String(expireMs));
  const remainMs = expireMs - Date.now();
  if (remainMs <= 0) {
    if (!klsSubscriptionNoticeSent.expired) {
      klsSubscriptionNoticeSent.expired = true;
      showActionFeedback(false, "订阅已过期，请续费后重试");
      log(`Subscription expired locally: expire_at=${expireRaw}`);
    }
    return;
  }
  if (remainMs <= KLS_SUBSCRIPTION_NOTICE_HOUR_MS) {
    if (!klsSubscriptionNoticeSent.hour) {
      klsSubscriptionNoticeSent.hour = true;
      showActionFeedback(false, `订阅将于 1 小时内到期（${expireRaw}），请尽快续费`);
      log(`Subscription reminder(1h): expire_at=${expireRaw}`);
    }
    return;
  }
  if (remainMs <= KLS_SUBSCRIPTION_NOTICE_DAY_MS && !klsSubscriptionNoticeSent.day) {
    klsSubscriptionNoticeSent.day = true;
    showActionFeedback(false, `订阅将于 24 小时内到期（${expireRaw}），请及时续费`);
    log(`Subscription reminder(24h): expire_at=${expireRaw}`);
  }
}
function isKlsSubscriptionExpiredLocal() {
  const sub = klsAuthState.subscription && typeof klsAuthState.subscription === "object" ? klsAuthState.subscription : null;
  const subStatus = String((sub == null ? void 0 : sub.subscription_status) || "").trim().toUpperCase();
  if (subStatus && subStatus !== "ACTIVE") return true;
  const expireRaw = sub ? String((sub == null ? void 0 : sub.expire_at) || "").trim() : String(klsAuthState.gatewayExpireAt || "").trim();
  if (!expireRaw) return false;
  const expireMs = parseKlsUtcMs(expireRaw);
  if (!Number.isFinite(expireMs)) return false;
  return expireMs <= Date.now();
}
async function ensureKlsSubscriptionStatusFresh(options = {}) {
  const force = Boolean(options.force);
  if (!isKlsLoggedIn()) return null;
  const stale = Date.now() - Number(klsSubscriptionLastSyncedAtMs || 0) >= KLS_SUBSCRIPTION_SYNC_INTERVAL_MS;
  const needSync = force || !klsAuthState.subscription || stale;
  if (!needSync) return klsAuthState.subscription || null;
  if (klsSubscriptionSyncPromise) {
    return klsSubscriptionSyncPromise;
  }
  klsSubscriptionSyncPromise = (async () => {
    try {
      return await klsSubscriptionStatusAction();
    } finally {
      klsSubscriptionSyncPromise = null;
    }
  })();
  return klsSubscriptionSyncPromise;
}
function ensureKlsSubscriptionWatchLoop() {
  if (klsSubscriptionWatchTimer) return;
  klsSubscriptionWatchTimer = window.setInterval(() => {
    if (!isKlsLoggedIn()) {
      resetKlsSubscriptionNoticeState();
      klsSubscriptionLastSyncedAtMs = 0;
      return;
    }
    maybeNotifyKlsSubscriptionExpiry();
    void ensureKlsSubscriptionStatusFresh().catch((error) => {
      log(`KLS subscription watch sync failed: ${String((error == null ? void 0 : error.message) || error)}`);
    });
  }, 3e4);
}
function normalizeKlsNotificationItem(raw) {
  const item = raw && typeof raw === "object" ? raw : {};
  const id = String(item.id || item.notification_id || item.uuid || item.message_id || "").trim();
  const title = String(item.title || item.subject || item.type || "通知").trim() || "通知";
  const message = String(item.message || item.content || item.body || item.text || "").trim();
  const createdAt = String(item.created_at || item.createdAt || item.time || item.timestamp || "").trim();
  const readAt = String(item.read_at || item.readAt || "").trim();
  return {
    id: id || `${createdAt}:${title}:${message}`.slice(0, 96),
    title,
    message,
    createdAt,
    unread: !readAt && item.read !== true && item.is_read !== true
  };
}
function installKlsNotificationUiStyles() {
  if (document.getElementById("kls-notification-ui-style")) return;
  const style = document.createElement("style");
  style.id = "kls-notification-ui-style";
  style.textContent = `
    .top-nav{z-index:240!important;}
    .top-icon-btn{position:relative;}
    .top-icon-btn.has-unread::after{content:"";position:absolute;right:4px;top:4px;width:8px;height:8px;border-radius:999px;background:#ef4444;border:2px solid #fff;box-shadow:0 0 0 1px rgba(239,68,68,.18);}
    .top-notice-actions{display:flex;align-items:center;gap:8px;}
    .top-notice-close{padding:0;}
    .top-notice-item{display:grid!important;grid-template-columns:1fr;gap:4px;line-height:1.25;}
    .top-notice-item strong{display:block;color:#183b50;font-size:13px;font-weight:800;}
    .top-notice-item span{display:block;color:#475569;font-size:12px;white-space:normal;word-break:break-word;}
    .top-notice-item em{display:block;color:#94a3b8;font-size:11px;font-style:normal;}
    .top-notice-item.is-unread{border-color:#bae6fd;background:#f0f9ff;}
    .top-notice-empty{margin:0;padding:18px 12px;border:1px dashed #d6e4f4;border-radius:12px;background:#f8fbff;color:#64748b;font-size:13px;text-align:center;}
    .notification-detail-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(9,16,28,.48);backdrop-filter:blur(3px);}
    .notification-detail-overlay[hidden]{display:none!important;}
    .notification-detail-card{width:min(420px,calc(100vw - 32px));display:grid;gap:10px;padding:18px 16px;border-radius:18px;background:#fff;box-shadow:0 18px 44px rgba(15,23,42,.22);}
    .notification-detail-card h4{margin:0;color:#183b50;font-size:17px;font-weight:800;}
    .notification-detail-card p{margin:0;color:#334155;font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;}
    .notification-detail-card time{color:#64748b;font-size:12px;}
  `;
  document.head.appendChild(style);
}
function installGlobalTextSelectionGuard() {
  if (document.getElementById("global-text-selection-guard")) return;
  const style = document.createElement("style");
  style.id = "global-text-selection-guard";
  style.textContent = `
    .app-shell,
    .app-shell *{
      -webkit-user-select:none!important;
      user-select:none!important;
      -webkit-touch-callout:none;
    }
    input,
    textarea,
    select,
    [contenteditable="true"]{
      -webkit-user-select:text!important;
      user-select:text!important;
      -webkit-touch-callout:default;
    }
  `;
  document.head.appendChild(style);
}
function ensureKlsNotificationDetailOverlay() {
  let overlay = document.getElementById("notification-detail-overlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "notification-detail-overlay";
  overlay.className = "notification-detail-overlay";
  overlay.setAttribute("hidden", "");
  overlay.innerHTML = `
    <div class="notification-detail-card" role="dialog" aria-modal="true" aria-labelledby="notification-detail-title">
      <h4 id="notification-detail-title">通知详情</h4>
      <p id="notification-detail-message">暂无详情</p>
      <time id="notification-detail-time"></time>
    </div>
  `;
  document.body.appendChild(overlay);
  const card = overlay.querySelector(".notification-detail-card");
  ensureViewportOverlayLayer(overlay, card, {
    backdrop: "rgba(9, 16, 28, 0.48)",
    zOverlay: "2147483000",
    zBox: "2147483001"
  });
  overlay.setAttribute("hidden", "");
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeKlsNotificationDetail();
  });
  card == null ? void 0 : card.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  return overlay;
}
function openKlsNotificationDetail(item) {
  installKlsNotificationUiStyles();
  const items = Array.isArray(klsNotificationState.items) ? klsNotificationState.items : [];
  const matched = items.find((entry) => String(entry.id || "") === String((item == null ? void 0 : item.id) || "")) || item || {};
  const overlay = ensureKlsNotificationDetailOverlay();
  const titleEl = overlay.querySelector("#notification-detail-title");
  const messageEl = overlay.querySelector("#notification-detail-message");
  const timeEl = overlay.querySelector("#notification-detail-time");
  if (titleEl) titleEl.textContent = String(matched.title || "通知详情").trim() || "通知详情";
  if (messageEl) messageEl.textContent = String(matched.message || matched.title || "暂无详情").trim() || "暂无详情";
  if (timeEl) timeEl.textContent = String(matched.createdAt || "").trim();
  overlay.removeAttribute("hidden");
  overlay.style.display = "flex";
  overlay.style.pointerEvents = "auto";
}
function closeKlsNotificationDetail() {
  const overlay = document.getElementById("notification-detail-overlay");
  overlay == null ? void 0 : overlay.setAttribute("hidden", "");
  if (overlay instanceof HTMLElement) {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
  }
}
function renderKlsNotifications() {
  installKlsNotificationUiStyles();
  if (topNoticeBtnEl) {
    const count = Math.max(0, Number(klsNotificationState.unreadCount || 0));
    topNoticeBtnEl.setAttribute("aria-label", count > 0 ? `通知，${count} 条未读` : "通知");
    topNoticeBtnEl.classList.toggle("has-unread", count > 0);
  }
  if (topNoticeListEl) {
    const items = Array.isArray(klsNotificationState.items) ? klsNotificationState.items : [];
    const visibleItems = items.filter((item) => {
      const id = String((item == null ? void 0 : item.id) || "").trim();
      return id ? !klsNotificationState.dismissedIds.has(id) : true;
    }).slice(0, 20);
    if (!visibleItems.length) {
      topNoticeListEl.innerHTML = `<li class="top-notice-empty">暂无通知</li>`;
      return;
    }
    topNoticeListEl.innerHTML = visibleItems.map((item) => {
      const title = escapeHtml(item.title || "通知");
      const message = escapeHtml(item.message || "");
      const time = escapeHtml(item.createdAt || "");
      return `<li><button type="button" class="top-notice-item${item.unread ? " is-unread" : ""}" data-notification-id="${escapeHtml(item.id)}"><strong>${title}</strong>${message ? `<span>${message}</span>` : ""}${time ? `<em>${time}</em>` : ""}</button></li>`;
    }).join("");
    if (topNoticeListEl instanceof HTMLElement && topNoticeListEl.dataset.detailBound !== "1") {
      topNoticeListEl.dataset.detailBound = "1";
      topNoticeListEl.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-notification-id]") : null;
        if (!(target instanceof HTMLElement)) return;
        const id = String(target.getAttribute("data-notification-id") || "").trim();
        if (!id) return;
        const currentItems = Array.isArray(klsNotificationState.items) ? klsNotificationState.items : [];
        const item = currentItems.find((entry) => String(entry.id || "") === id);
        topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
        openKlsNotificationDetail(item || { id });
        void klsNotificationMarkReadAction(id).catch((error) => {
          log(`KLS notification mark-read failed: ${String((error == null ? void 0 : error.message) || error)}`);
        });
      });
    }
  }
}
async function klsRegisterPushTokenAction() {
  const { platform, appVersion, deviceId } = getKlsClientContext();
  const pushToken = `android-local-${deviceId}`;
  return await klsApi("/api/me/push/register", "POST", {
    provider: "local",
    push_token: pushToken,
    device_id: deviceId,
    platform,
    app_version_code: appVersion
  }, { auth: true });
}
async function klsNotificationsAction() {
  const data = await klsApi("/api/me/notifications", "GET", null, { auth: true });
  const list = Array.isArray(data) ? data : Array.isArray(data == null ? void 0 : data.items) ? data.items : Array.isArray(data == null ? void 0 : data.notifications) ? data.notifications : [];
  klsNotificationState.items = list.map(normalizeKlsNotificationItem);
  return klsNotificationState.items;
}
async function klsNotificationsUnreadCountAction() {
  const data = await klsApi("/api/me/notifications/unread-count", "GET", null, { auth: true });
  const count = Number((data == null ? void 0 : data.unread_count) || (data == null ? void 0 : data.count) || data || 0);
  klsNotificationState.unreadCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return klsNotificationState.unreadCount;
}
async function klsNotificationMarkReadAction(id) {
  if (!id) return null;
  const data = await klsApi(`/api/me/notifications/${encodeURIComponent(id)}/read`, "POST", {}, { auth: true });
  await refreshKlsNotifications({ silent: true, notifyNew: false });
  return data;
}
async function klsNotificationsReadAllAction() {
  const data = await klsApi("/api/me/notifications/read-all", "POST", {}, { auth: true });
  await refreshKlsNotifications({ silent: true, notifyNew: false });
  return data;
}
function notifyKlsNotificationItems(items) {
  for (const item of items) {
    if (!item || !item.id || !item.unread || klsNotificationState.seenIds.has(item.id)) continue;
    klsNotificationState.seenIds.add(item.id);
    showNativeLocalNotification(item.title || "易点点通知", item.message || item.title || "", item.id);
  }
}
async function refreshKlsNotifications({ silent = false, notifyNew = false } = {}) {
  if (!isKlsLoggedIn()) return;
  try {
    const [items] = await Promise.all([
      klsNotificationsAction(),
      klsNotificationsUnreadCountAction()
    ]);
    renderKlsNotifications();
    if (notifyNew) notifyKlsNotificationItems(items);
  } catch (error) {
    if (!silent) {
      log(`KLS notification refresh failed: ${String((error == null ? void 0 : error.message) || error)}`);
    }
  }
}
function handleKlsNotificationStreamEvent(raw) {
  const payload = raw && typeof raw === "object" ? raw : {};
  if (Array.isArray(payload.items) || Array.isArray(payload.notifications)) {
    const list = (payload.items || payload.notifications).map(normalizeKlsNotificationItem);
    klsNotificationState.items = list;
    if (Number.isFinite(Number(payload.unread_count))) {
      klsNotificationState.unreadCount = Math.max(0, Math.floor(Number(payload.unread_count)));
    }
    renderKlsNotifications();
    notifyKlsNotificationItems(list);
    return;
  }
  const item = normalizeKlsNotificationItem(payload.notification || payload);
  if (!item.id) return;
  klsNotificationState.items = [item, ...klsNotificationState.items.filter((x) => x.id !== item.id)].slice(0, 50);
  if (item.unread) klsNotificationState.unreadCount = Math.max(Number(klsNotificationState.unreadCount || 0), 0) + 1;
  renderKlsNotifications();
  notifyKlsNotificationItems([item]);
}
function stopKlsNotificationRuntime() {
  if (klsNotificationState.pollTimer) {
    window.clearInterval(klsNotificationState.pollTimer);
    klsNotificationState.pollTimer = null;
  }
  if (klsNotificationState.streamReconnectTimer) {
    window.clearTimeout(klsNotificationState.streamReconnectTimer);
    klsNotificationState.streamReconnectTimer = null;
  }
  if (klsNotificationState.stream) {
    try {
      klsNotificationState.stream.close();
    } catch {
    }
    klsNotificationState.stream = null;
  }
}
function startKlsNotificationRuntime() {
  if (!isKlsLoggedIn()) return;
  if (!klsNotificationState.pollTimer) {
    klsNotificationState.pollTimer = window.setInterval(() => {
      void refreshKlsNotifications({ silent: true, notifyNew: true });
    }, 3e4);
  }
  const runtimeHost = String((window.location && window.location.hostname) || "").trim();
  const canUseDirectSse = !/^(localhost|127\.0\.0\.1)$/i.test(runtimeHost);
  if (canUseDirectSse && typeof EventSource === "function" && !klsNotificationState.stream) {
    try {
      const base = normalizeKlsBase((klsBaseUrlEl == null ? void 0 : klsBaseUrlEl.value) || "");
      const { platform, appVersion, deviceId } = getKlsClientContext();
      const query = new URLSearchParams({
        access_token: String(klsAuthState.accessToken || "").trim(),
        device_id: deviceId,
        platform,
        app_version_code: String(appVersion)
      });
      const stream = new EventSource(`${base}/api/me/notifications/stream?${query.toString()}`);
      klsNotificationState.stream = stream;
      stream.onmessage = (event) => {
        try {
          handleKlsNotificationStreamEvent(JSON.parse(String((event == null ? void 0 : event.data) || "{}")));
        } catch {
        }
      };
      stream.onerror = () => {
        stopKlsNotificationRuntime();
        if (isKlsLoggedIn()) {
          klsNotificationState.streamReconnectTimer = window.setTimeout(() => startKlsNotificationRuntime(), 3e4);
        }
      };
    } catch (error) {
      log(`KLS notification stream disabled: ${String((error == null ? void 0 : error.message) || error)}`);
    }
  }
  void refreshKlsNotifications({ silent: true, notifyNew: false });
}
function stopKlsBackgroundTasks() {
  stopKlsNotificationRuntime();
  if (klsSessionWatchTimer) {
    window.clearInterval(klsSessionWatchTimer);
    klsSessionWatchTimer = null;
  }
  if (klsSubscriptionWatchTimer) {
    window.clearInterval(klsSubscriptionWatchTimer);
    klsSubscriptionWatchTimer = null;
  }
}
function pathRequiresGatewayInjection(path, method = "GET") {
  const methodUpper = String(method || "GET").toUpperCase();
  const apiPath = normalizeApiPath(path);
  if (!apiPath.startsWith("/api/")) return false;
  if (apiPath === "/api/commands/voice") return true;
  if (apiPath === "/api/commands/voice-audio") return true;
  if (apiPath === "/api/menu/commands/voice") return true;
  if (apiPath === "/api/menu/items/voice-draft") return true;
  if (apiPath === "/api/menu/ocr/parse") return true;
  if (apiPath === "/api/menu/ocr/import") return true;
  if (methodUpper === "POST" && apiPath === "/api/sessions") return true;
  if (methodUpper === "POST" && /^\/api\/sessions\/[^/]+\/parse$/.test(apiPath)) return true;
  if (methodUpper === "POST" && /^\/api\/orders\/(checkout-preview|checkout-confirm|cancel-confirm|undo-confirm|items\/served)$/.test(apiPath)) return true;
  return false;
}
function getEffectiveGatewayModelAlias() {
  const model = String(klsAuthState.chatModelAlias || "").trim();
  if (model) return model;
  return DEFAULT_GATEWAY_CHAT_MODEL;
}
function getEffectiveGatewayApiKey() {
  const gatewayKey = String(klsAuthState.gatewayKey || "").trim();
  if (gatewayKey) return gatewayKey;
  return String(klsAuthState.accessToken || "").trim();
}
async function ensureGatewayInjectionForRequest(path, method = "GET") {
  if (!pathRequiresGatewayInjection(path, method)) return;
  if (!isKlsLoggedIn()) {
    throw new Error("链路未登录，缺少网关凭证注入");
  }
  if (isKlsSubscriptionExpiredLocal() || Date.now() - Number(klsSubscriptionLastSyncedAtMs || 0) >= KLS_SUBSCRIPTION_SYNC_INTERVAL_MS) {
    try {
      await ensureKlsSubscriptionStatusFresh({ force: true });
    } catch (error) {
      log(`KLS subscription refresh before gateway injection failed: ${String((error == null ? void 0 : error.message) || error)}`);
    }
  }
  if (isKlsSubscriptionExpiredLocal()) {
    klsAuthState.gatewayKey = "";
    klsAuthState.gatewayExpireAt = "";
    klsAuthState.chatModelAlias = "";
    persistKlsAuthState();
    renderKlsAuthState();
    throw new Error("订阅已过期，请续费后重试");
  }
  const hasKey = Boolean(getEffectiveGatewayApiKey());
  const hasBase = Boolean(String(klsAuthState.gatewayBaseUrl || "").trim());
  const hasModel = Boolean(getEffectiveGatewayModelAlias());
  const runtimeRefreshDue = Date.now() - Number(klsRuntimeConfigLastFetchedAtMs || 0) >= KLS_RUNTIME_CONFIG_REFRESH_MS;
  if (hasKey && hasBase && hasModel && !runtimeRefreshDue) return;
  if (!hasBase || !hasModel || runtimeRefreshDue) {
    try {
      await klsRuntimeConfigAction();
    } catch (error) {
      log(`KLS runtime config bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
    }
  }
  if (!String(klsAuthState.chatModelAlias || "").trim()) {
    klsAuthState.chatModelAlias = getEffectiveGatewayModelAlias();
    persistKlsAuthState();
  }
  const ready = Boolean(getEffectiveGatewayApiKey()) && Boolean(String(klsAuthState.gatewayBaseUrl || "").trim()) && Boolean(getEffectiveGatewayModelAlias());
  if (!ready) {
    throw new Error("网关凭证注入失败，请重新登录后重试");
  }
}
async function api(path, method = "GET", payload = null, requestOptions = {}) {
  var _a2;
  const apiStartedAtMs = Date.now();
  const methodUpper = String(method || "GET").toUpperCase();
  const notify = Boolean(requestOptions.notify);
  const actionName = String(requestOptions.actionName || "").trim() || resolveApiActionName(path, methodUpper);
  const injectStartedAtMs = Date.now();
  await ensureGatewayInjectionForRequest(path, methodUpper);
  const injectMs = Date.now() - injectStartedAtMs;
  const options = { method: methodUpper, headers: {} };
  const { platform, appVersion, deviceId } = getKlsClientContext();
  options.headers["X-Client-Platform"] = platform;
  options.headers["X-App-Version-Code"] = String(appVersion);
  options.headers["X-Device-Id"] = deviceId;
  const gatewayKey = getEffectiveGatewayApiKey();
  const gatewayBaseUrl = String(klsAuthState.gatewayBaseUrl || "").trim();
  const gatewayModel = getEffectiveGatewayModelAlias();
  if (gatewayKey) {
    options.headers["X-Gateway-Api-Key"] = gatewayKey;
  }
  if (gatewayBaseUrl) {
    options.headers["X-Gateway-Base-Url"] = gatewayBaseUrl;
  }
  if (gatewayModel) {
    options.headers["X-Gateway-Model"] = gatewayModel;
  }
  if (payload !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }
  const rawPath = String(path || "").trim();
  if (!rawPath) {
    throw new Error("api path is required");
  }
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const configuredBase = normalizeApiBase(window.__BBQ_API_BASE__ || window.BBQ_API_BASE);
  const target = /^https?:\/\//i.test(rawPath) ? rawPath : configuredBase ? `${configuredBase}${normalizedPath}` : normalizedPath;
  try {
    const fetchStartedAtMs = Date.now();
    let response;
    try {
      response = await fetch(target, options);
    } catch (error) {
      const emsg = String((error == null ? void 0 : error.message) || error || "fetch error");
      throw new Error(`fetch failed: ${methodUpper} ${target} -> ${emsg}`);
    }
    const fetchMs = Date.now() - fetchStartedAtMs;
    const raw = await response.text();
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      const hint = raw.slice(0, 120).replace(/\s+/g, " ");
      throw new Error(`[${response.status}] ${method} ${target} returned non-JSON response: ${hint}`);
    }
    if (!response.ok || !(body == null ? void 0 : body.ok)) {
      const message = ((_a2 = body == null ? void 0 : body.error) == null ? void 0 : _a2.message) || `Request failed with ${response.status}`;
      throw new Error(`[${response.status}] ${method} ${target} -> ${message}`);
    }
    if (requestOptions.attachClientTiming && body && body.data && typeof body.data === "object") {
      body.data.__client_timing = {
        request_path: normalizedPath,
        method: methodUpper,
        inject_ms: injectMs,
        fetch_ms: fetchMs,
        total_ms: Date.now() - apiStartedAtMs
      };
    }
    if (notify) {
      showActionFeedback(true, `${actionName}成功`);
    }
    return body.data;
  } catch (error) {
    if (notify) {
      showActionFeedback(false, `${actionName}失败`);
    }
    throw error;
  }
}
function normalizeKlsBase(rawBase) {
  var _a2, _b2;
  const explicit = normalizeApiBase(rawBase);
  const runtimeHost = String(((_a2 = window.location) == null ? void 0 : _a2.hostname) || "").trim();
  const runtimeProtocol = ((_b2 = window.location) == null ? void 0 : _b2.protocol) === "https:" ? "https:" : "http:";
  const runtimeIsLocal = /^(localhost|127\.0\.0\.1)$/i.test(runtimeHost);
  const isLoopbackHost = (value) => {
    try {
      const parsed = new URL(normalizeApiBase(value));
      return /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
    } catch {
      return false;
    }
  };
  const remapLoopbackBase = (value) => {
    const normalized = normalizeApiBase(value);
    if (!normalized) return "";
    if (!runtimeHost || runtimeIsLocal) return normalized;
    try {
      const parsed = new URL(normalized);
      if (/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)) {
        return `${runtimeProtocol}//${runtimeHost}:${parsed.port || "8100"}`;
      }
    } catch {
      return normalized;
    }
    return normalized;
  };
  const configured = normalizeApiBase(window.__KLS_API_BASE__ || window.KLS_API_BASE || KLS_QUERY_BASE);
  if (explicit) {
    if (isLoopbackHost(explicit) && configured && !isLoopbackHost(configured)) {
      return remapLoopbackBase(configured);
    }
    return remapLoopbackBase(explicit);
  }
  if (configured) return remapLoopbackBase(configured);
  return remapLoopbackBase(KLS_DEFAULT_BASE) || KLS_DEFAULT_BASE;
}
function getKlsClientContext() {
  const platform = "android";
  if (klsPlatformEl) klsPlatformEl.value = platform;
  if (authPlatformEl) authPlatformEl.value = platform;
  const rawVersion = Number((klsAppVersionEl == null ? void 0 : klsAppVersionEl.value) || 120);
  const appVersion = Number.isFinite(rawVersion) && rawVersion >= 0 ? Math.floor(rawVersion) : 120;
  const deviceId = String((klsDeviceIdEl == null ? void 0 : klsDeviceIdEl.value) || MAIN_DEVICE_ID).trim() || MAIN_DEVICE_ID;
  return { platform, appVersion, deviceId };
}
function randomTraceId(prefix = "kls") {
  const seed = Math.random().toString(16).slice(2, 10);
  return `${prefix}-${Date.now()}-${seed}`;
}
function maskSecret(value, keep = 6) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= keep) return "*".repeat(text.length);
  return `${"*".repeat(Math.max(3, text.length - keep))}${text.slice(-keep)}`;
}
function syncKlsInputsFromAuthPage() {
  if (authKlsBaseUrlEl && klsBaseUrlEl) klsBaseUrlEl.value = authKlsBaseUrlEl.value || klsBaseUrlEl.value;
  if (authPhoneEl && klsPhoneEl) klsPhoneEl.value = authPhoneEl.value || klsPhoneEl.value;
  if (authDeviceIdEl && klsDeviceIdEl) klsDeviceIdEl.value = authDeviceIdEl.value || klsDeviceIdEl.value;
  if (authAppVersionEl && klsAppVersionEl) klsAppVersionEl.value = authAppVersionEl.value || klsAppVersionEl.value;
  if (authPlatformEl && klsPlatformEl) klsPlatformEl.value = authPlatformEl.value || klsPlatformEl.value;
  if (authSmsPurposeEl && klsSmsPurposeEl) klsSmsPurposeEl.value = authSmsPurposeEl.value || klsSmsPurposeEl.value;
  if (authSmsCodeEl && klsSmsCodeEl) klsSmsCodeEl.value = authSmsCodeEl.value || klsSmsCodeEl.value;
  if (authAppIdEl && klsAppIdEl) klsAppIdEl.value = authAppIdEl.value || klsAppIdEl.value;
  if (authSignSecretEl && klsSignSecretEl) klsSignSecretEl.value = authSignSecretEl.value || klsSignSecretEl.value;
}
function syncAuthInputsFromKlsPanel() {
  if (authKlsBaseUrlEl && klsBaseUrlEl && !authKlsBaseUrlEl.value) authKlsBaseUrlEl.value = klsBaseUrlEl.value || KLS_DEFAULT_BASE;
  if (authPhoneEl && klsPhoneEl && !authPhoneEl.value) authPhoneEl.value = klsPhoneEl.value || "";
  if (authDeviceIdEl && klsDeviceIdEl && !authDeviceIdEl.value) authDeviceIdEl.value = klsDeviceIdEl.value || MAIN_DEVICE_ID;
  if (authAppVersionEl && klsAppVersionEl && !authAppVersionEl.value) authAppVersionEl.value = klsAppVersionEl.value || "120";
  if (authPlatformEl && klsPlatformEl && !authPlatformEl.value) authPlatformEl.value = klsPlatformEl.value || "android";
  if (authSmsPurposeEl) authSmsPurposeEl.value = "LOGIN";
  if (authSmsCodeEl && klsSmsCodeEl && !authSmsCodeEl.value) authSmsCodeEl.value = klsSmsCodeEl.value || "";
  if (authAppIdEl && klsAppIdEl && !authAppIdEl.value) authAppIdEl.value = klsAppIdEl.value || "";
  if (authSignSecretEl && klsSignSecretEl && !authSignSecretEl.value) authSignSecretEl.value = klsSignSecretEl.value || "";
}
function initializeKlsBaseInputs() {
  const preferredBase = normalizeKlsBase("");
  const hasQueryBase = Boolean(KLS_QUERY_BASE);
  if (klsBaseUrlEl) {
    const current = String(klsBaseUrlEl.value || "").trim();
    if (!current || hasQueryBase) {
      klsBaseUrlEl.value = preferredBase;
    }
  }
  if (authKlsBaseUrlEl) {
    const current = String(authKlsBaseUrlEl.value || "").trim();
    if (!current || hasQueryBase) {
      authKlsBaseUrlEl.value = preferredBase;
    }
  }
  if (klsBaseUrlEl && authKlsBaseUrlEl) {
    if (!String(klsBaseUrlEl.value || "").trim() && String(authKlsBaseUrlEl.value || "").trim()) {
      klsBaseUrlEl.value = authKlsBaseUrlEl.value;
    }
    if (!String(authKlsBaseUrlEl.value || "").trim() && String(klsBaseUrlEl.value || "").trim()) {
      authKlsBaseUrlEl.value = klsBaseUrlEl.value;
    }
  }
  log(`KLS base normalized: preferred=${preferredBase || "-"} query=${KLS_QUERY_BASE || "-"} input=${(klsBaseUrlEl == null ? void 0 : klsBaseUrlEl.value) || "-"}`);
}
function persistKlsAuthState() {
  const payload = {
    accessToken: String(klsAuthState.accessToken || ""),
    refreshToken: String(klsAuthState.refreshToken || ""),
    role: String(klsAuthState.role || ""),
    user: klsAuthState.user || null,
    subscription: klsAuthState.subscription || null,
    profile: klsAuthState.profile || null,
    gatewayKey: String(klsAuthState.gatewayKey || ""),
    gatewayExpireAt: String(klsAuthState.gatewayExpireAt || ""),
    gatewayBaseUrl: String(klsAuthState.gatewayBaseUrl || ""),
    chatModelAlias: String(klsAuthState.chatModelAlias || ""),
    lastUpdateCheck: klsAuthState.lastUpdateCheck || null
  };
  setStoredAuthState(JSON.stringify(payload));
}
function restoreKlsAuthState() {
  try {
    const raw = getStoredAuthState();
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    klsAuthState.accessToken = String(parsed.accessToken || "");
    klsAuthState.refreshToken = String(parsed.refreshToken || "");
    klsAuthState.role = String(parsed.role || "");
    klsAuthState.user = parsed.user || null;
    klsAuthState.subscription = parsed.subscription || null;
    klsAuthState.profile = parsed.profile || null;
    klsAuthState.gatewayKey = String(parsed.gatewayKey || "");
    klsAuthState.gatewayExpireAt = String(parsed.gatewayExpireAt || "");
    klsAuthState.gatewayBaseUrl = String(parsed.gatewayBaseUrl || "");
    klsAuthState.chatModelAlias = String(parsed.chatModelAlias || "").trim() || DEFAULT_GATEWAY_CHAT_MODEL;
    klsAuthState.lastUpdateCheck = parsed.lastUpdateCheck || null;
    klsRuntimeConfigLastFetchedAtMs = 0;
    klsRuntimeConfigLastConfigId = 0;
  } catch {
  }
}
function readAppUpdateDismissedVersionCode() {
  try {
    return Number(window.localStorage.getItem(APP_UPDATE_DISMISSED_VERSION_STORAGE_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}
function writeAppUpdateDismissedVersionCode(versionCode) {
  try {
    window.localStorage.setItem(APP_UPDATE_DISMISSED_VERSION_STORAGE_KEY, String(Math.max(0, Number(versionCode) || 0)));
  } catch {
  }
}
function readAppUpdateOpenedVersionCode() {
  try {
    return Number(window.localStorage.getItem(APP_UPDATE_OPENED_VERSION_STORAGE_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}
function writeAppUpdateOpenedVersionCode(versionCode) {
  try {
    window.localStorage.setItem(APP_UPDATE_OPENED_VERSION_STORAGE_KEY, String(Math.max(0, Number(versionCode) || 0)));
  } catch {
  }
}
function firstDefinedValue(values, fallback) {
  for (const value of values) {
    if (value !== void 0 && value !== null) return value;
  }
  return fallback;
}
function resolveUpdateLatestVersionCode(data) {
  const candidate = Number(firstDefinedValue([
    data == null ? void 0 : data.latest_version_code,
    data == null ? void 0 : data.latestVersionCode,
    data == null ? void 0 : data.version_code,
    data == null ? void 0 : data.versionCode
  ], 0));
  return Number.isFinite(candidate) && candidate > 0 ? Math.floor(candidate) : 0;
}
function resolveUpdateLatestVersionLabel(data, fallbackVersionCode = 0) {
  const text = String(firstDefinedValue([
    data == null ? void 0 : data.latest_version_name,
    data == null ? void 0 : data.latestVersionName,
    data == null ? void 0 : data.version_name,
    data == null ? void 0 : data.versionName
  ], "")).trim();
  if (text) return text;
  return fallbackVersionCode > 0 ? `v${fallbackVersionCode}` : "新版本";
}
function resolveUpdateDownloadUrl(data) {
  const candidates = [
    data == null ? void 0 : data.download_url,
    data == null ? void 0 : data.downloadUrl,
    data == null ? void 0 : data.apk_url,
    data == null ? void 0 : data.apkUrl,
    data == null ? void 0 : data.url,
    APP_UPDATE_DEFAULT_LANDING_URL
  ];
  for (const candidate of candidates) {
    const safeUrl = String(candidate || "").trim();
    if (/^https?:\/\//i.test(safeUrl)) return safeUrl;
  }
  return APP_UPDATE_DEFAULT_LANDING_URL;
}
function resolveUpdateReleaseNotes(data) {
  return String(firstDefinedValue([
    data == null ? void 0 : data.release_notes,
    data == null ? void 0 : data.releaseNotes
  ], "")).trim();
}
function isForceAppUpdate(data) {
  return Boolean((data == null ? void 0 : data.force_update) === true || (data == null ? void 0 : data.forceUpdate) === true);
}
function hasAppUpdateAvailable(data) {
  const { appVersion } = getKlsClientContext();
  const latestVersionCode = resolveUpdateLatestVersionCode(data);
  if (latestVersionCode <= 0) {
    return Boolean((data == null ? void 0 : data.has_update) === true || (data == null ? void 0 : data.hasUpdate) === true);
  }
  return latestVersionCode > Number(appVersion || 0);
}
async function maybePromptAppUpdate(data, options = {}) {
  const forcePrompt = options.forcePrompt === true;
  if (!data || !hasAppUpdateAvailable(data)) {
    appUpdateForceLockActive = false;
    syncRouteGuardUi();
    return false;
  }
  const latestVersionCode = resolveUpdateLatestVersionCode(data);
  const forceUpdate = isForceAppUpdate(data);
  if (!forcePrompt && !forceUpdate) {
    const dismissedVersion = readAppUpdateDismissedVersionCode();
    const openedVersion = readAppUpdateOpenedVersionCode();
    if (latestVersionCode > 0 && (dismissedVersion >= latestVersionCode || openedVersion >= latestVersionCode)) {
      return false;
    }
  }
  const versionLabel = resolveUpdateLatestVersionLabel(data, latestVersionCode);
  const downloadUrl = resolveUpdateDownloadUrl(data);
  const releaseNotes = resolveUpdateReleaseNotes(data);
  const messageParts = [
    tFmt("app_update_found_message", "检测到新版本 {version}，是否前往下载更新？", { version: versionLabel })
  ];
  if (releaseNotes) {
    messageParts.push("", releaseNotes);
  }
  let confirmed = false;
  if (forceUpdate) {
    appUpdateForceLockActive = true;
    syncRouteGuardUi();
    window.alert(`${t("app_update_found_title", "发现新版本")}\n\n${messageParts.join("\n")}`);
    confirmed = true;
  } else {
    confirmed = window.confirm(`${t("app_update_found_title", "发现新版本")}\n\n${messageParts.join("\n")}`);
  }
  if (!confirmed) {
    if (latestVersionCode > 0) {
      writeAppUpdateDismissedVersionCode(latestVersionCode);
    }
    return false;
  }
  const opened = openExternalUrl(downloadUrl);
  if (!opened) {
    showActionFeedback(false, t("app_update_open_failed", "无法打开下载页面，请稍后重试"));
    return false;
  }
  if (latestVersionCode > 0) {
    writeAppUpdateOpenedVersionCode(latestVersionCode);
  }
  try {
    await klsUpdateAckAction();
  } catch (error) {
    log(`KLS update ack failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  return true;
}
async function runKlsPostLoginBootstrap() {
  if (!isKlsLoggedIn()) return { runtime_ok: false, gateway_ok: false, update_ok: false, subscription_ok: false, profile_ok: false, notification_ok: false };
  let runtimeOk = false;
  let asrSessionOk = false;
  let gatewayOk = false;
  let updateOk = false;
  let subscriptionOk = false;
  let profileOk = false;
  let notificationOk = false;
  try {
    await syncRuntimeAccountScope();
    await klsRuntimeConfigAction();
    runtimeOk = true;
  } catch (error) {
    log(`KLS runtime config bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  try {
    const asrOptions = getCurrentAsrLanguageOptions();
    await klsGetRealtimeAsrSession(true);
    asrSessionOk = true;
    log(`KLS ASR session synced: language=${asrOptions.language} accent=${asrOptions.accent}`);
  } catch (error) {
    log(`KLS ASR session bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  gatewayOk = Boolean(getEffectiveGatewayApiKey());
  try {
    await klsUpdateCheckAction();
    updateOk = true;
  } catch (error) {
    log(`KLS update check bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  try {
    await klsSubscriptionStatusAction();
    subscriptionOk = true;
  } catch (error) {
    log(`KLS subscription bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  try {
    await klsProfileGetAction();
    await syncRuntimeAccountScope();
    profileOk = true;
  } catch (error) {
    log(`KLS profile bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  try {
    await klsRegisterPushTokenAction();
    startKlsNotificationRuntime();
    notificationOk = true;
  } catch (error) {
    log(`KLS notification bootstrap failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  return { runtime_ok: runtimeOk, asr_session_ok: asrSessionOk, gateway_ok: gatewayOk, update_ok: updateOk, subscription_ok: subscriptionOk, profile_ok: profileOk, notification_ok: notificationOk };
}
function formatPhoneDisplay(phone) {
  const digits = String(phone || "").replace(/\D+/g, "");
  if (digits.length !== 11) return String(phone || "--");
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}
function roleDisplayLabel(role) {
  const key = String(role || "").trim().toUpperCase();
  const map = {
    ADMIN: t("role_admin", "管理员"),
    OPERATOR: t("role_operator", "店员")
  };
  return map[key] || (key || t("profile_logged_out", "未登录"));
}
function planDisplayLabel(planCode) {
  const key = String(planCode || "").trim().toLowerCase();
  const map = {
    basic: t("plan_basic", "基础版"),
    pro: t("plan_pro", "专业版"),
    enterprise: t("plan_enterprise", "企业版")
  };
  return map[key] || (String(planCode || "").trim() || t("plan_empty", "未订阅"));
}
function renewalStatusDisplayLabel(status) {
  const key = String(status || "").trim().toUpperCase();
  const map = {
    ACTIVE: t("renewal_active", "自动续费中"),
    CANCELED: t("renewal_canceled", "已关闭自动续费"),
    FAILED: t("renewal_failed", "自动续费失败"),
    PAUSED: t("renewal_paused", "续费已暂停")
  };
  return map[key] || (key || "--");
}
function sanitizeDisplayName(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 32);
}
function closeProfileNameEditor() {
  profileNameRowEl == null ? void 0 : profileNameRowEl.classList.remove("is-editing");
  profileNameEditorEl == null ? void 0 : profileNameEditorEl.classList.add("hidden");
  if (profileNameInputEl) profileNameInputEl.value = "";
}
function renderProfileAuthInfo() {
  const loggedIn = isKlsLoggedIn();
  if (!loggedIn) {
    closeProfileNameEditor();
  }
  const user = klsAuthState.user && typeof klsAuthState.user === "object" ? klsAuthState.user : {};
  const profile = klsAuthState.profile && typeof klsAuthState.profile === "object" ? klsAuthState.profile : null;
  const account = String(user.account || "").trim();
  const phone = String(user.phone || "").trim();
  const userId = Number(user.user_id || 0);
  const displayName = sanitizeDisplayName((profile == null ? void 0 : profile.display_name) || "");
  const roleText = roleDisplayLabel(klsAuthState.role);
  const avatarSeed = displayName || account || phone || "?";
  const avatar = avatarSeed ? avatarSeed.charAt(0).toUpperCase() : "?";
  const sub = klsAuthState.subscription && typeof klsAuthState.subscription === "object" ? klsAuthState.subscription : null;
  const planName = planDisplayLabel((sub == null ? void 0 : sub.plan_code) || "");
  const expireAt = String((sub == null ? void 0 : sub.expire_at) || klsAuthState.gatewayExpireAt || "").trim() || "--";
  const renewalLabel = renewalStatusDisplayLabel((sub == null ? void 0 : sub.renewal_status) || "");
  const profilePhone = String((profile == null ? void 0 : profile.phone) || phone || "").trim();
  const profileGatewayExpire = String((profile == null ? void 0 : profile.gateway_expire_at) || klsAuthState.gatewayExpireAt || "").trim() || "--";
  if (profileRoleChipEl) profileRoleChipEl.textContent = loggedIn ? roleText : t("profile_logged_out", "未登录");
  if (profileAvatarEl) profileAvatarEl.textContent = loggedIn ? avatar : "?";
  if (profileUserNameEl) profileUserNameEl.textContent = loggedIn ? displayName || t("profile_store_name_empty", "未设置店名") : t("profile_logged_out", "未登录");
  if (profileUserSubtitleEl) {
    profileUserSubtitleEl.textContent = loggedIn ? t("profile_subtitle_logged_in", "昵称即店名，将用于首页展示和打印小票") : t("profile_subtitle_logged_out", "登录后可设置店名（昵称）");
  }
  if (profilePhoneEl) profilePhoneEl.textContent = loggedIn ? formatPhoneDisplay(profilePhone) : "--";
  if (profileGatewayExpireEl) {
    profileGatewayExpireEl.textContent = loggedIn ? profileGatewayExpire : "--";
  }
  if (profilePlanNameEl) profilePlanNameEl.textContent = loggedIn ? planName : t("profile_logged_out", "未登录");
  if (profilePlanDetailEl) {
    if (!loggedIn) {
      profilePlanDetailEl.textContent = t("profile_plan_need_login", "请先登录查看套餐信息");
    } else if (!sub) {
      profilePlanDetailEl.textContent = t("profile_plan_empty", "暂无订阅套餐信息");
    } else {
      profilePlanDetailEl.textContent = tFmt("profile_plan_detail", "有效期 {expireAt}，续费状态 {renewalLabel}", { expireAt, renewalLabel });
    }
  }
  if (profileEditNameBtnEl instanceof HTMLButtonElement) {
    profileEditNameBtnEl.disabled = !loggedIn;
  }
  if (!loggedIn) {
    closeProfileNameEditor();
  }
}
function renderKlsAuthState() {
  const snapshot = {
    logged_in: Boolean(klsAuthState.accessToken),
    role: klsAuthState.role || "",
    user: klsAuthState.user || null,
    subscription: klsAuthState.subscription || null,
    profile: klsAuthState.profile || null,
    access_token_tail: maskSecret(klsAuthState.accessToken, 10),
    refresh_token_tail: maskSecret(klsAuthState.refreshToken, 10),
    gateway_key_tail: maskSecret(klsAuthState.gatewayKey, 10),
    gateway_expire_at: klsAuthState.gatewayExpireAt || "",
    gateway_base_url: klsAuthState.gatewayBaseUrl || "",
    last_update_check: klsAuthState.lastUpdateCheck || null
  };
  if (klsAuthViewEl) {
    klsAuthViewEl.textContent = JSON.stringify(snapshot, null, 2);
  }
  if (authStatusViewEl) {
    authStatusViewEl.textContent = JSON.stringify(snapshot, null, 2);
  }
  renderProfileAuthInfo();
  maybeNotifyKlsSubscriptionExpiry();
  syncRouteGuardUi();
}
function setKlsLastResponse(title, data) {
  const payload = {
    title: String(title || "KLS 响应"),
    at: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    data: data != null ? data : null
  };
  if (klsLastResponseEl) {
    klsLastResponseEl.textContent = JSON.stringify(payload, null, 2);
  }
  if (authLastResponseEl) {
    authLastResponseEl.textContent = JSON.stringify(payload, null, 2);
  }
}
function toHex(bytes) {
  return Array.from(bytes).map((n) => n.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(text) {
  var _a2;
  if (!((_a2 = window.crypto) == null ? void 0 : _a2.subtle)) {
    throw new Error("当前浏览器不支持 WebCrypto，无法计算签名");
  }
  const data = new TextEncoder().encode(String(text || ""));
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}
async function hmacSha256Hex(secret, text) {
  var _a2;
  if (!((_a2 = window.crypto) == null ? void 0 : _a2.subtle)) {
    throw new Error("当前浏览器不支持 WebCrypto，无法计算签名");
  }
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await window.crypto.subtle.sign("HMAC", key, enc.encode(text));
  return toHex(new Uint8Array(sig));
}
function decodeJwtPayload(token) {
  const raw = String(token || "").trim();
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const pad = payload.length % 4;
  if (pad) payload += "=".repeat(4 - pad);
  try {
    return JSON.parse(window.atob(payload));
  } catch {
    return null;
  }
}
function isAccessTokenExpiringSoon(token, skewSeconds = 30) {
  const payload = decodeJwtPayload(token);
  const exp = Number((payload == null ? void 0 : payload.exp) || 0);
  if (!Number.isFinite(exp) || exp <= 0) return false;
  const now = Math.floor(Date.now() / 1e3);
  return exp <= now + Math.max(0, Number(skewSeconds || 0));
}
function isKlsRefreshUnauthorizedError(error) {
  const message = String((error == null ? void 0 : error.message) || error || "");
  return /\[401\]/.test(message) || /unauthorized/i.test(message);
}
async function revalidateKlsSessionOnForeground({ force = false, silent = true } = {}) {
  if (!isKlsLoggedIn()) return true;
  const refreshToken = String(klsAuthState.refreshToken || "").trim();
  if (!refreshToken) return true;
  const now = Date.now();
  if (!force && now - Number(klsSessionLastValidatedAtMs || 0) < KLS_SESSION_REVALIDATE_INTERVAL_MS) {
    return true;
  }
  if (klsSessionRevalidatePromise) {
    return await klsSessionRevalidatePromise;
  }
  klsSessionRevalidatePromise = (async () => {
    try {
      await klsRefreshTokenAction();
      klsSessionLastValidatedAtMs = Date.now();
      return true;
    } catch (error) {
      if (isKlsRefreshUnauthorizedError(error)) {
        log("KLS session invalidated by another login; clearing local auth state");
        clearKlsAuthState();
        if (!silent) {
          showActionFeedback(false, "账号已在其他设备登录，请重新登录");
        }
        return false;
      }
      log(`KLS foreground session revalidate failed: ${String((error == null ? void 0 : error.message) || error)}`);
      return true;
    } finally {
      klsSessionRevalidatePromise = null;
    }
  })();
  return await klsSessionRevalidatePromise;
}
function ensureKlsSessionForegroundWatchLoop() {
  if (klsSessionWatchTimer) return;
  klsSessionWatchTimer = window.setInterval(() => {
    if (document.hidden || !isKlsLoggedIn()) return;
    void revalidateKlsSessionOnForeground({ force: false, silent: true });
  }, 15 * 1e3);
}
async function handleKlsAppForeground({ forceRefresh = true, silentInvalidation = true } = {}) {
  const stillValid = await revalidateKlsSessionOnForeground({ force: forceRefresh, silent: silentInvalidation });
  if (!stillValid || !isKlsLoggedIn()) return false;
  try {
    await syncRuntimeAccountScope();
  } catch (error) {
    log(`Runtime account scope sync failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }
  void runKlsPostLoginBootstrap();
  return true;
}
async function buildKlsSignatureHeaders(method, pathname, bodyText) {
  const appId = String((klsAppIdEl == null ? void 0 : klsAppIdEl.value) || "").trim();
  const signSecret = String((klsSignSecretEl == null ? void 0 : klsSignSecretEl.value) || "").trim();
  if (!appId || !signSecret) {
    return {};
  }
  const timestamp = String(Math.floor(Date.now() / 1e3));
  const nonce = randomTraceId("nonce");
  const bodyHash = await sha256Hex(bodyText || "");
  const signText = [method.toUpperCase(), pathname, appId, timestamp, nonce, bodyHash].join("\n");
  const signature = await hmacSha256Hex(signSecret, signText);
  return {
    "X-App-Id": appId,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature
  };
}
async function klsApi(path, method = "GET", payload = null, requestOptions = {}) {
  const base = normalizeKlsBase((klsBaseUrlEl == null ? void 0 : klsBaseUrlEl.value) || "");
  const rawPath = String(path || "").trim();
  const fullUrl = /^https?:\/\//i.test(rawPath) ? rawPath : `${base}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`;
  const url = new URL(fullUrl);
  const runtimeHost = String((window.location && window.location.hostname) || "").trim();
  const shouldProxyViaLocalBackend = /^(localhost|127\.0\.0\.1)$/i.test(runtimeHost);
  const proxyPath = `/api/kls-proxy${url.pathname}${url.search || ""}`;
  const requestUrl = shouldProxyViaLocalBackend ? `${window.location.origin}${proxyPath}` : url.toString();
  const { platform, appVersion, deviceId } = getKlsClientContext();
  const methodUpper = String(method || "GET").toUpperCase();
  const headers = {
    "X-Client-Platform": platform,
    "X-App-Version-Code": String(appVersion),
    "X-Device-Id": deviceId
  };
  let bodyText = "";
  if (payload !== null) {
    bodyText = JSON.stringify(payload);
    headers["Content-Type"] = "application/json";
  }
  if (requestOptions.auth) {
    const refreshToken = String(klsAuthState.refreshToken || "").trim();
    if (!requestOptions.skipAutoRefresh && refreshToken && isAccessTokenExpiringSoon(klsAuthState.accessToken, 45)) {
      try {
        await klsRefreshTokenAction();
      } catch {
        clearKlsAuthState();
        throw new Error("登录态已过期，请重新登录");
      }
    }
    if (!klsAuthState.accessToken) {
      throw new Error("未登录，缺少 access_token");
    }
    headers.Authorization = `Bearer ${klsAuthState.accessToken}`;
  }
  if (requestOptions.idempotent) {
    headers["X-Idempotency-Key"] = String(requestOptions.idempotencyKey || randomTraceId("idem"));
  }
  const signHeaders = await buildKlsSignatureHeaders(methodUpper, url.pathname, bodyText);
  Object.assign(headers, signHeaders);
  if (shouldProxyViaLocalBackend) {
    headers["X-KLS-Base-Url"] = base;
  }
  let response;
  try {
    response = await fetch(requestUrl, {
      method: methodUpper,
      headers,
      body: payload !== null ? bodyText : void 0
    });
  } catch (error) {
    const emsg = String((error == null ? void 0 : error.message) || error || "fetch error");
    throw new Error(`KLS fetch failed: ${methodUpper} ${url.pathname} -> ${emsg}`);
  }
  const raw = await response.text();
  let body = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`[${response.status}] ${methodUpper} ${url.pathname} returned non-JSON`);
  }
  const okCode = Number(body == null ? void 0 : body.code) === 0;
  if (!response.ok || !okCode) {
    const message = localizeRuntimeErrorMessage(
      String((body == null ? void 0 : body.message) || (body == null ? void 0 : body.detail) || `request failed with ${response.status}`)
    );
    const canRetryWithRefresh = Boolean(requestOptions.auth) && !requestOptions.skipAutoRefresh && !requestOptions.__refreshRetried && response.status === 401 && !url.pathname.startsWith("/api/auth/") && Boolean(String(klsAuthState.refreshToken || "").trim());
    if (canRetryWithRefresh) {
      try {
        await klsRefreshTokenAction();
        return await klsApi(path, method, payload, { ...requestOptions, __refreshRetried: true });
      } catch {
        clearKlsAuthState();
        throw new Error("登录态已过期，请重新登录");
      }
    }
    if (response.status === 401 && (requestOptions.auth || url.pathname === "/api/auth/refresh")) {
      clearKlsAuthState();
      throw new Error("登录态已过期，请重新登录");
    }
    throw new Error(`[${response.status}] ${methodUpper} ${url.pathname} -> ${message}`);
  }
  return body.data;
}
async function klsAsrTranscribeBlob(blob, transcriptHint = "") {
  if (!(blob instanceof Blob) || blob.size <= 0) {
    throw new Error("audio blob is empty");
  }
  const audioBase64 = await blobToBase64(blob);
  const data = await klsApi(
    "/api/asr/transcribe",
    "POST",
    {
      audio_base64: audioBase64,
      mime_type: blob.type || "audio/webm",
      transcript: String(transcriptHint || "").trim(),
      ...getCurrentAsrLanguageOptions()
    },
    { auth: true }
  );
  const transcript = String((data == null ? void 0 : data.transcript) || "").trim();
  if (!transcript) {
    throw new Error("ASR returned empty transcript");
  }
  return {
    transcript,
    provider: String((data == null ? void 0 : data.provider) || "").trim(),
    meta: (data == null ? void 0 : data.meta) || null
  };
}
async function ensureKlsAccessTokenForRealtimeWs() {
  const refreshToken = String(klsAuthState.refreshToken || "").trim();
  if (refreshToken && isAccessTokenExpiringSoon(klsAuthState.accessToken, 90)) {
    try {
      await klsRefreshTokenAction();
    } catch {
      clearKlsAuthState();
      throw new Error("登录态已过期，请重新登录");
    }
  }
  const accessToken = String(klsAuthState.accessToken || "").trim();
  if (!accessToken) {
    throw new Error("登录态缺失，请重新登录");
  }
  return accessToken;
}
async function klsGetRealtimeAsrSession(forceRefresh = false) {
  const asrOptions = getCurrentAsrLanguageOptions();
  const asrOptionsKey = JSON.stringify(asrOptions);
  const now = Date.now();
  if (!forceRefresh && klsAsrRealtimeSessionCache && now < Number(klsAsrRealtimeSessionCache.expiresAtMs || 0) && String(klsAsrRealtimeSessionCache.optionsKey || "") === asrOptionsKey) {
    return klsAsrRealtimeSessionCache.data || {};
  }
  log(`ASR session request: language=${asrOptions.language} accent=${asrOptions.accent} force=${forceRefresh ? 1 : 0}`);
  const data = await klsApi("/api/asr/xfyun/session", "POST", asrOptions, { auth: true });
  klsAsrRealtimeSessionCache = {
    data: data || {},
    optionsKey: asrOptionsKey,
    expiresAtMs: now + 12e4
  };
  return data || {};
}
function buildKlsAsrRelayWsUrl(accessToken, deviceId = "") {
  const base = normalizeKlsBase((klsBaseUrlEl == null ? void 0 : klsBaseUrlEl.value) || "");
  const wsBase = base.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  const query = new URLSearchParams({
    access_token: String(accessToken || "").trim(),
    device_id: String(deviceId || MAIN_DEVICE_ID || "").trim() || MAIN_DEVICE_ID
  });
  return `${wsBase}/api/asr/xfyun/relay?${query.toString()}`;
}
function downsampleAudioFloat32(input, inputRate, outputRate = 16e3) {
  if (!(input instanceof Float32Array) || input.length === 0) return new Float32Array(0);
  const inRate = Number(inputRate || 0);
  const outRate = Number(outputRate || 16e3);
  if (!Number.isFinite(inRate) || inRate <= 0 || inRate <= outRate) {
    return input;
  }
  const ratio = inRate / outRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  let outputOffset = 0;
  let inputOffset = 0;
  while (outputOffset < outputLength) {
    const nextInputOffset = Math.min(input.length, Math.round((outputOffset + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let i = inputOffset; i < nextInputOffset; i += 1) {
      sum += input[i];
      count += 1;
    }
    output[outputOffset] = count > 0 ? sum / count : 0;
    outputOffset += 1;
    inputOffset = nextInputOffset;
  }
  return output;
}
function float32ToPcm16(samples) {
  if (!(samples instanceof Float32Array) || samples.length === 0) return new Int16Array(0);
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, Number(samples[i] || 0)));
    out[i] = value < 0 ? Math.round(value * 32768) : Math.round(value * 32767);
  }
  return out;
}
function int16ToBase64(samples) {
  if (!(samples instanceof Int16Array) || samples.length === 0) return "";
  const bytes = new Uint8Array(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i];
    bytes[i * 2] = value & 255;
    bytes[i * 2 + 1] = value >> 8 & 255;
  }
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
function extractXfyunResultText(result) {
  var _a2;
  const wsList = Array.isArray(result == null ? void 0 : result.ws) ? result.ws : [];
  const parts = [];
  for (const wsItem of wsList) {
    const cwList = Array.isArray(wsItem == null ? void 0 : wsItem.cw) ? wsItem.cw : [];
    if (!cwList.length) continue;
    const token = String(((_a2 = cwList[0]) == null ? void 0 : _a2.w) || "").trim();
    if (token) parts.push(token);
  }
  return parts.join("").trim();
}
function applyXfyunResultSegment(segments, result) {
  const text = extractXfyunResultText(result);
  if (!text) return;
  const pgs = String((result == null ? void 0 : result.pgs) || "").trim().toLowerCase();
  const rg = Array.isArray(result == null ? void 0 : result.rg) ? result.rg : null;
  if (pgs === "rpl" && rg && rg.length === 2) {
    const start = Math.max(0, Number.parseInt(rg[0], 10) - 1);
    const end = Math.max(start, Number.parseInt(rg[1], 10) - 1);
    while (segments.length < start) {
      segments.push("");
    }
    segments.splice(start, end - start + 1, text);
    return;
  }
  segments.push(text);
}
async function createKlsRealtimeAsrCapture(options = {}) {
  var _a2;
  const sourceName = String(options.source || "asr-realtime").trim();
  const onTranscript = typeof options.onTranscript === "function" ? options.onTranscript : () => {
  };
  const onAudioLevel = typeof options.onAudioLevel === "function" ? options.onAudioLevel : () => {
  };
  const continuousUntilStopped = options.continuousUntilStopped === true;
  const preferNativeSource = options.preferNativeSource !== false;
  const canUseNativeSource = preferNativeSource && hasNativeVoiceBridge();
  const canUseWebMicSource = Boolean((_a2 = navigator.mediaDevices) == null ? void 0 : _a2.getUserMedia);
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!canUseNativeSource && !canUseWebMicSource) {
    throw new Error("microphone capture is not supported");
  }
  if (!canUseNativeSource && !AudioContextCtor) {
    throw new Error("audio context is not supported");
  }
  const sessionInfo = await klsGetRealtimeAsrSession(false);
  const appId = String((sessionInfo == null ? void 0 : sessionInfo.app_id) || "").trim();
  if (!appId) {
    throw new Error("asr session missing app_id");
  }
  const business = {
    language: String((sessionInfo == null ? void 0 : sessionInfo.language) || "zh_cn").trim() || "zh_cn",
    domain: String((sessionInfo == null ? void 0 : sessionInfo.domain) || "iat").trim() || "iat",
    accent: String((sessionInfo == null ? void 0 : sessionInfo.accent) || "").trim(),
    vad_eos: Number((sessionInfo == null ? void 0 : sessionInfo.vad_eos) || 1e3),
    ptt: Number((sessionInfo == null ? void 0 : sessionInfo.ptt) || 1)
  };
  const dwa = String((sessionInfo == null ? void 0 : sessionInfo.dwa) || "").trim();
  if (dwa) {
    business.dwa = dwa;
  }
  if (continuousUntilStopped) {
    business.vad_eos = Math.max(Number(business.vad_eos) || 0, 1e4);
  }
  if (!business.accent) {
    delete business.accent;
  }
  let socket = null;
  let socketOpenPromise = null;
  let stream = null;
  let audioContext = null;
  let sourceNode = null;
  let processorNode = null;
  let usingNativeSource = false;
  let removeNativeChunkListener = () => {
  };
  let segments = [];
  let finalizedTranscript = "";
  let transcript = "";
  let lastFinalTranscript = "";
  let receivedFinalStatus = false;
  let errorMessage = "";
  let firstFrameSent = false;
  let stopped = false;
  let doneResolved = false;
  let doneResolve = null;
  const donePromise = new Promise((resolve) => {
    doneResolve = resolve;
  });
  const resolveDone = () => {
    if (doneResolved) return;
    doneResolved = true;
    if (typeof doneResolve === "function") doneResolve();
  };
  function combineAsrTranscript(prefix, suffix) {
    const left = String(prefix || "").trim();
    const right = String(suffix || "").trim();
    if (!left) return right;
    if (!right) return left;
    return `${left}${right}`.trim();
  }
  async function openAsrSocketWithRetry() {
    let lastOpenError = null;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const accessToken = await ensureKlsAccessTokenForRealtimeWs();
        const { deviceId } = getKlsClientContext();
        const wsUrl = buildKlsAsrRelayWsUrl(accessToken, deviceId);
        return await new Promise((resolve, reject) => {
          const ws = new WebSocket(wsUrl);
          let settled = false;
          const timer = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            try {
              ws.close();
            } catch {
            }
            reject(new Error("ASR websocket open timeout"));
          }, 1e4);
          ws.onopen = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            resolve(ws);
          };
          ws.onerror = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            reject(new Error("ASR websocket open failed"));
          };
          ws.onclose = (event) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            reject(new Error(`ASR websocket closed early (${Number((event == null ? void 0 : event.code) || 0)})`));
          };
        });
      } catch (error) {
        lastOpenError = error;
        if (attempt >= 2) break;
        klsAsrRealtimeSessionCache = null;
      }
    }
    throw new Error(String((lastOpenError == null ? void 0 : lastOpenError.message) || lastOpenError || "ASR websocket open failed"));
  }
  function attachAsrSocketHandlers(ws) {
    ws.onmessage = (event) => {
      var _a3;
      let payload = null;
      try {
        payload = JSON.parse(String((event == null ? void 0 : event.data) || "{}"));
      } catch {
        return;
      }
      const code = Number((payload == null ? void 0 : payload.code) || 0);
      if (code !== 0) {
        errorMessage = `ASR provider error ${code}: ${String((payload == null ? void 0 : payload.message) || "unknown")}`;
        resolveDone();
        return;
      }
      const data = (payload == null ? void 0 : payload.data) && typeof payload.data === "object" ? payload.data : {};
      const result = (data == null ? void 0 : data.result) && typeof data.result === "object" ? data.result : {};
      applyXfyunResultSegment(segments, result);
      const currentSegment = segments.join("").trim();
      transcript = continuousUntilStopped ? combineAsrTranscript(finalizedTranscript, currentSegment) : currentSegment;
      const isFinal = Number((_a3 = data == null ? void 0 : data.status) != null ? _a3 : -1) === 2;
      if (!isFinal && currentSegment) {
        receivedFinalStatus = false;
      }
      try {
        onTranscript(transcript, { final: isFinal, payload });
      } catch {
      }
      if (isFinal && continuousUntilStopped) {
        finalizedTranscript = combineAsrTranscript(finalizedTranscript, currentSegment);
        transcript = finalizedTranscript;
        lastFinalTranscript = transcript;
        receivedFinalStatus = true;
        segments = [];
        firstFrameSent = false;
        try {
          if (ws.readyState === WebSocket.OPEN) ws.close(1e3, "segment-final");
        } catch {
        }
        return;
      }
      if (isFinal) {
        lastFinalTranscript = transcript;
        receivedFinalStatus = true;
        resolveDone();
      }
    };
    ws.onerror = () => {
      if (!continuousUntilStopped && !errorMessage) {
        errorMessage = "ASR websocket transport error";
      }
    };
    ws.onclose = (event) => {
      if (socket === ws) {
        socket = null;
        firstFrameSent = false;
      }
      if (!errorMessage && !stopped && Number((event == null ? void 0 : event.code) || 0) === 4401) {
        errorMessage = "语音鉴权已过期，请重新登录";
        resolveDone();
        return;
      }
      if (stopped || !continuousUntilStopped) {
        resolveDone();
      }
    };
  }
  async function ensureStreamingAsrSocket() {
    if (stopped) return null;
    if (socket && socket.readyState === WebSocket.OPEN) return socket;
    if (socketOpenPromise) return socketOpenPromise;
    socketOpenPromise = openAsrSocketWithRetry().then((ws) => {
      socket = ws;
      firstFrameSent = false;
      attachAsrSocketHandlers(ws);
      return ws;
    }).catch((error) => {
      if (!errorMessage) {
        errorMessage = String((error == null ? void 0 : error.message) || error || "ASR websocket open failed");
      }
      resolveDone();
      throw error;
    }).finally(() => {
      socketOpenPromise = null;
    });
    return socketOpenPromise;
  }
  function sendAudioFrame(audioBase64, status = firstFrameSent ? 1 : 0, targetSocket = socket) {
    if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) return;
    const frame = {
      data: {
        status,
        format: "audio/L16;rate=16000",
        encoding: "raw",
        audio: String(audioBase64 || "")
      }
    };
    if (status === 0) {
      frame.common = { app_id: appId };
      frame.business = business;
    }
    try {
      targetSocket.send(JSON.stringify(frame));
      firstFrameSent = true;
    } catch (sendError) {
      errorMessage = String((sendError == null ? void 0 : sendError.message) || sendError || "ASR send failed");
    }
  }
  function sendAudioFrameWhenReady(audioBase64) {
    if (stopped) return;
    const currentSocket = socket;
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      sendAudioFrame(audioBase64, firstFrameSent ? 1 : 0, currentSocket);
      return;
    }
    if (!continuousUntilStopped) return;
    ensureStreamingAsrSocket().then((ws) => {
      if (stopped || !ws || ws.readyState !== WebSocket.OPEN) return;
      sendAudioFrame(audioBase64, firstFrameSent ? 1 : 0, ws);
    }).catch(() => {
    });
  }
  await ensureStreamingAsrSocket();
  if (canUseNativeSource) {
    try {
      removeNativeChunkListener = addNativeVoiceChunkListener((payload = {}) => {
        const audio = String(payload.pcm16_base64 || "");
        if (!audio) return;
        sendAudioFrameWhenReady(audio);
      });
      await startNativeVoiceCapture(String(options.nativeMode || (sourceName.indexOf("menu") >= 0 ? "menu" : "main")));
      usingNativeSource = true;
    } catch (nativeError) {
      removeNativeChunkListener();
      removeNativeChunkListener = () => {
      };
      if (!canUseWebMicSource || !AudioContextCtor) {
        throw nativeError;
      }
      log(`Native realtime source unavailable, fallback web mic: ${String((nativeError == null ? void 0 : nativeError.message) || nativeError)}`);
    }
  }
  if (!usingNativeSource) {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContextCtor();
    sourceNode = audioContext.createMediaStreamSource(stream);
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    processorNode.onaudioprocess = (event) => {
      var _a3;
      if (stopped) return;
      const input = (_a3 = event == null ? void 0 : event.inputBuffer) == null ? void 0 : _a3.getChannelData(0);
      if (!(input instanceof Float32Array) || input.length === 0) return;
      let energy = 0;
      for (let i = 0; i < input.length; i += 1) {
        const sample = Number(input[i] || 0);
        energy += sample * sample;
      }
      const rms = Math.sqrt(energy / input.length);
      try {
        onAudioLevel(rms);
      } catch {
      }
      const downsampled = downsampleAudioFloat32(input, audioContext.sampleRate, 16e3);
      const pcm16 = float32ToPcm16(downsampled);
      if (!pcm16.length) return;
      sendAudioFrameWhenReady(int16ToBase64(pcm16));
    };
    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);
    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch {
      }
    }
  }
  log(`ASR realtime opened (${sourceName}${usingNativeSource ? ", native-stream" : ", web-mic"})`);
  async function closeAudioGraph() {
    if (usingNativeSource) {
      removeNativeChunkListener();
      removeNativeChunkListener = () => {
      };
      try {
        await stopNativeVoiceCapture();
      } catch {
      }
      return;
    }
    try {
      processorNode.disconnect();
    } catch {
    }
    try {
      sourceNode.disconnect();
    } catch {
    }
    try {
      stream.getTracks().forEach((track) => track.stop());
    } catch {
    }
    try {
      await audioContext.close();
    } catch {
    }
  }
  async function stopAndGetTranscript() {
    if (stopped) {
      return String(lastFinalTranscript || transcript || "").trim();
    }
    if (socketOpenPromise) {
      await Promise.race([socketOpenPromise.catch(() => null), new Promise((resolve) => window.setTimeout(resolve, 700))]);
    }
    stopped = true;
    await closeAudioGraph();
    const currentSocket = socket;
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      try {
        if (!firstFrameSent) {
          currentSocket.send(
            JSON.stringify({
              common: { app_id: appId },
              business,
              data: {
                status: 0,
                format: "audio/L16;rate=16000",
                encoding: "raw",
                audio: ""
              }
            })
          );
          firstFrameSent = true;
        }
        currentSocket.send(
          JSON.stringify({
            data: {
              status: 2,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: ""
            }
          })
        );
      } catch (sendError) {
        if (!errorMessage) {
          errorMessage = String((sendError == null ? void 0 : sendError.message) || sendError || "ASR finalize send failed");
        }
      }
    }
    const finalTranscriptBeforeWait = String(lastFinalTranscript || transcript || "").trim();
    const finalizeWaitMs = receivedFinalStatus ? 0 : 3200;
    await Promise.race([donePromise, new Promise((resolve) => window.setTimeout(resolve, finalizeWaitMs))]);
    if (!receivedFinalStatus) {
      errorMessage = errorMessage || "ASR 未收到最终帧 status=2，已停止发送";
    }
    try {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    } catch {
    }
    const finalTranscript = String(lastFinalTranscript || transcript || finalTranscriptBeforeWait || "").trim();
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    return finalTranscript;
  }
  async function abort() {
    stopped = true;
    await closeAudioGraph();
    try {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    } catch {
    }
    resolveDone();
  }
  return { stopAndGetTranscript, abort };
}
async function safeStopRealtimeAsrCapture(capture) {
  if (!capture) return;
  try {
    await capture.abort();
  } catch {
  }
}
function replaceKlsAuthTokens(data, { resetRuntime = false } = {}) {
  const nextAccessToken = String((data == null ? void 0 : data.access_token) || "");
  const nextRefreshToken = String((data == null ? void 0 : data.refresh_token) || "");
  if (!nextAccessToken || !nextRefreshToken) {
    throw new Error("登录响应缺少 token");
  }
  const nextRole = String((data == null ? void 0 : data.role) || klsAuthState.role || "");
  const nextUser = (data == null ? void 0 : data.user) || klsAuthState.user || null;
  Object.assign(klsAuthState, {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
    role: nextRole,
    user: nextUser
  });
  if (resetRuntime) {
    klsAuthState.subscription = null;
    klsAuthState.profile = null;
    klsAuthState.gatewayKey = "";
    klsAuthState.gatewayExpireAt = "";
    klsAuthState.gatewayBaseUrl = "";
    klsAuthState.chatModelAlias = "";
    klsRuntimeConfigLastFetchedAtMs = 0;
    klsRuntimeConfigLastConfigId = 0;
    resetKlsSubscriptionNoticeState();
    currentRuntimeAccountScopeKey = "";
  }
  klsSubscriptionLastSyncedAtMs = 0;
  klsSubscriptionSyncPromise = null;
  klsSessionLastValidatedAtMs = 0;
  klsSessionRevalidatePromise = null;
  klsAsrRealtimeSessionCache = null;
  persistKlsAuthState();
  renderKlsAuthState();
}
function setKlsAuthByLogin(data) {
  stopKlsBackgroundTasks();
  replaceKlsAuthTokens(data, { resetRuntime: true });
}
function clearKlsAuthState() {
  if (klsAuthClearing) return;
  klsAuthClearing = true;
  stopKlsBackgroundTasks();
  topNoticePanelEl == null ? void 0 : topNoticePanelEl.setAttribute("hidden", "");
  closeKlsNotificationDetail();
  klsAuthState.accessToken = "";
  klsAuthState.refreshToken = "";
  klsAuthState.role = "";
  klsAuthState.user = null;
  klsAuthState.subscription = null;
  klsAuthState.profile = null;
  klsAuthState.gatewayKey = "";
  klsAuthState.gatewayExpireAt = "";
  klsAuthState.gatewayBaseUrl = "";
  klsAuthState.chatModelAlias = "";
  klsRuntimeConfigLastFetchedAtMs = 0;
  klsRuntimeConfigLastConfigId = 0;
  klsSubscriptionLastSyncedAtMs = 0;
  klsSubscriptionSyncPromise = null;
  klsSessionLastValidatedAtMs = 0;
  klsSessionRevalidatePromise = null;
  klsRefreshTokenPromise = null;
  resetKlsSubscriptionNoticeState();
  klsAuthState.lastUpdateCheck = null;
  appUpdateForceLockActive = false;
  klsAsrRealtimeSessionCache = null;
  klsNotificationState.dismissedIds.clear();
  klsNotificationState.items = [];
  klsNotificationState.unreadCount = 0;
  renderKlsNotifications();
  currentRuntimeAccountScopeKey = "";
  clearStoredAuthState();
  renderKlsAuthState();
  void syncRuntimeAccountScope({ accountKey: "guest", force: true, resetCaches: true });
  if (PROTECTED_VIEWS.has(currentViewName)) {
    setView("auth", { force: true, silent: true });
  }
  klsAuthClearing = false;
}
async function klsSendSmsAction() {
  const phone = String((klsPhoneEl == null ? void 0 : klsPhoneEl.value) || "").trim();
  if (!phone) throw new Error("手机号为空");
  const purpose = String((klsSmsPurposeEl == null ? void 0 : klsSmsPurposeEl.value) || "LOGIN").trim().toUpperCase();
  const { deviceId } = getKlsClientContext();
  const data = await klsApi("/api/auth/sms/send", "POST", {
    phone,
    purpose,
    device_id: deviceId
  });
  const debugCode = String((data == null ? void 0 : data.debug_sms_code) || "").trim();
  if (debugCode) {
    if (klsSmsCodeEl) klsSmsCodeEl.value = debugCode;
    if (authSmsCodeEl) authSmsCodeEl.value = debugCode;
  }
  return data;
}
async function klsRegisterSmsAction() {
  const phone = String((klsPhoneEl == null ? void 0 : klsPhoneEl.value) || "").trim();
  const smsCode = String((klsSmsCodeEl == null ? void 0 : klsSmsCodeEl.value) || "").trim();
  const { deviceId, appVersion } = getKlsClientContext();
  if (!phone || !smsCode) throw new Error("手机号或验证码为空");
  const data = await klsApi(
    "/api/auth/register/sms",
    "POST",
    {
      phone,
      sms_code: smsCode,
      device_id: deviceId,
      app_version_code: appVersion
    },
    { idempotent: true, idempotencyKey: randomTraceId("register") }
  );
  setKlsAuthByLogin(data);
  return data;
}
async function klsLoginSmsAction() {
  const phone = String((klsPhoneEl == null ? void 0 : klsPhoneEl.value) || "").trim();
  const smsCode = String((klsSmsCodeEl == null ? void 0 : klsSmsCodeEl.value) || "").trim();
  const { deviceId, appVersion } = getKlsClientContext();
  if (!phone || !smsCode) throw new Error("手机号或验证码为空");
  const data = await klsApi(
    "/api/auth/login/sms",
    "POST",
    {
      phone,
      sms_code: smsCode,
      device_id: deviceId,
      app_version_code: appVersion
    },
    { idempotent: true, idempotencyKey: randomTraceId("login") }
  );
  setKlsAuthByLogin(data);
  return data;
}
async function klsEntrySmsAction() {
  const phone = String((klsPhoneEl == null ? void 0 : klsPhoneEl.value) || "").trim();
  const smsCode = String((klsSmsCodeEl == null ? void 0 : klsSmsCodeEl.value) || "").trim();
  const { deviceId, appVersion } = getKlsClientContext();
  if (!phone || !smsCode) throw new Error("手机号或验证码为空");
  const data = await klsApi(
    "/api/auth/entry/sms",
    "POST",
    {
      phone,
      sms_code: smsCode,
      device_id: deviceId,
      app_version_code: appVersion
    },
    { idempotent: true, idempotencyKey: randomTraceId("entry") }
  );
  setKlsAuthByLogin(data);
  return data;
}
async function klsRefreshTokenAction() {
  if (!klsAuthState.refreshToken) {
    throw new Error("缺少 refresh_token");
  }
  if (klsRefreshTokenPromise) {
    return await klsRefreshTokenPromise;
  }
  const refreshToken = String(klsAuthState.refreshToken || "").trim();
  klsRefreshTokenPromise = (async () => {
    try {
      const data = await klsApi("/api/auth/refresh", "POST", { refresh_token: refreshToken }, { skipAutoRefresh: true });
      replaceKlsAuthTokens(data, { resetRuntime: false });
      return data;
    } catch (error) {
      if (isKlsRefreshUnauthorizedError(error)) {
        clearKlsAuthState();
      }
      throw error;
    } finally {
      klsRefreshTokenPromise = null;
    }
  })();
  return await klsRefreshTokenPromise;
}
async function klsGatewayKeyAction() {
  const data = await klsApi("/api/me/gateway-key", "GET", null, { auth: true });
  klsAuthState.gatewayKey = String((data == null ? void 0 : data.gateway_api_key) || "");
  klsAuthState.gatewayExpireAt = String((data == null ? void 0 : data.expire_at) || "");
  klsAuthState.gatewayBaseUrl = String((data == null ? void 0 : data.gateway_base_url) || "");
  persistKlsAuthState();
  renderKlsAuthState();
  return data;
}
async function klsRuntimeConfigAction() {
  const data = await klsApi("/api/me/runtime-config", "GET", null, { auth: true });
  const prevModelAlias = String(klsAuthState.chatModelAlias || "").trim();
  const prevGatewayBase = String(klsAuthState.gatewayBaseUrl || "").trim();
  const gatewayBaseUrl = String((data == null ? void 0 : data.gateway_base_url) || "").trim();
  const chatModelAlias = String((data == null ? void 0 : data.chat_model_alias) || (data == null ? void 0 : data.chat_model) || (data == null ? void 0 : data.model) || "").trim();
  const configId = Number((data == null ? void 0 : data.config_id) || 0);
  if (gatewayBaseUrl) {
    klsAuthState.gatewayBaseUrl = gatewayBaseUrl;
  }
  klsAuthState.chatModelAlias = chatModelAlias || String(klsAuthState.chatModelAlias || "").trim() || DEFAULT_GATEWAY_CHAT_MODEL;
  klsRuntimeConfigLastFetchedAtMs = Date.now();
  klsRuntimeConfigLastConfigId = Number.isFinite(configId) ? Math.max(0, Math.floor(configId)) : 0;
  const nextModelAlias = String(klsAuthState.chatModelAlias || "").trim();
  const nextGatewayBase = String(klsAuthState.gatewayBaseUrl || "").trim();
  if (nextModelAlias !== prevModelAlias || nextGatewayBase !== prevGatewayBase) {
    log(`KLS runtime config applied: model=${nextModelAlias || "-"} base=${nextGatewayBase || "-"} config_id=${klsRuntimeConfigLastConfigId}`);
  }
  persistKlsAuthState();
  renderKlsAuthState();
  return data;
}
async function klsSubscriptionStatusAction() {
  const data = await klsApi("/api/me/subscription/status", "GET", null, { auth: true });
  klsAuthState.subscription = data || null;
  const expireAt = String((data == null ? void 0 : data.expire_at) || "").trim();
  if (expireAt) {
    klsAuthState.gatewayExpireAt = expireAt;
  }
  klsSubscriptionLastSyncedAtMs = Date.now();
  persistKlsAuthState();
  renderKlsAuthState();
  return data;
}
async function klsProfileGetAction() {
  const data = await klsApi("/api/me/profile", "GET", null, { auth: true });
  klsAuthState.profile = data || null;
  persistKlsAuthState();
  renderKlsAuthState();
  return data;
}
async function klsProfileUpdateAction(displayName) {
  const name = sanitizeDisplayName(displayName);
  if (!name) {
    throw new Error("店名（昵称）不能为空");
  }
  const data = await klsApi("/api/me/profile", "POST", { display_name: name }, { auth: true });
  klsAuthState.profile = data || null;
  persistKlsAuthState();
  renderKlsAuthState();
  return data;
}
async function klsUpdateCheckAction(options = {}) {
  const { platform, appVersion } = getKlsClientContext();
  const query = new URLSearchParams({
    platform,
    current_version: String(appVersion)
  });
  const rolloutKey = String((klsRolloutKeyEl == null ? void 0 : klsRolloutKeyEl.value) || "").trim();
  if (rolloutKey) {
    query.set("rollout_key", rolloutKey);
  }
  const data = await klsApi(`/api/app/update/check?${query.toString()}`, "GET", null, {
    auth: Boolean(klsAuthState.accessToken)
  });
  klsAuthState.lastUpdateCheck = data || null;
  persistKlsAuthState();
  renderKlsAuthState();
  await maybePromptAppUpdate(data, { forcePrompt: options.forcePrompt === true });
  return data;
}
async function klsUpdateAckAction() {
  var _a2;
  const { platform, appVersion, deviceId } = getKlsClientContext();
  const latestVersion = Number(((_a2 = klsAuthState.lastUpdateCheck) == null ? void 0 : _a2.latest_version_code) || 0);
  const payload = {
    platform,
    current_version: appVersion,
    latest_version_code: Number.isFinite(latestVersion) && latestVersion > 0 ? latestVersion : null,
    ack_type: "SEEN",
    result: "OK",
    device_id: deviceId,
    note: "update dialog shown"
  };
  return klsApi("/api/app/update/ack", "POST", payload, {
    auth: true,
    idempotent: true,
    idempotencyKey: randomTraceId("update-ack")
  });
}
async function klsLogoutAction() {
  if (!klsAuthState.refreshToken) {
    throw new Error("缺少 refresh_token");
  }
  const data = await klsApi(
    "/api/auth/logout",
    "POST",
    { refresh_token: klsAuthState.refreshToken },
    { auth: true }
  );
  clearKlsAuthState();
  return data;
}
function bindKlsDebugPanel() {
  const sendBtn = document.getElementById("kls-send-sms-btn");
  const registerBtn = document.getElementById("kls-register-sms-btn");
  const loginBtn = document.getElementById("kls-login-sms-btn");
  const refreshBtn = document.getElementById("kls-refresh-token-btn");
  const gatewayBtn = document.getElementById("kls-gateway-key-btn");
  const updateCheckBtn = document.getElementById("kls-update-check-btn");
  const updateAckBtn = document.getElementById("kls-update-ack-btn");
  const logoutBtn = document.getElementById("kls-logout-btn");
  if (!sendBtn || !registerBtn || !loginBtn || !refreshBtn || !gatewayBtn || !updateCheckBtn || !updateAckBtn || !logoutBtn) {
    return;
  }
  const run = async (label, fn) => {
    try {
      const data = await fn();
      setKlsLastResponse(label, data);
      showActionFeedback(true, `${label}成功`);
      log(`KLS ${label} success`);
    } catch (error) {
      const message = String((error == null ? void 0 : error.message) || error);
      setKlsLastResponse(`${label}失败`, { error: message });
      showActionFeedback(false, `${label}失败`);
      log(`KLS ${label} failed: ${message}`);
    }
  };
  sendBtn.addEventListener("click", async () => {
    await run("发送验证码", klsSendSmsAction);
  });
  registerBtn.addEventListener("click", async () => {
    await run("短信注册", klsRegisterSmsAction);
  });
  loginBtn.addEventListener("click", async () => {
    await run("短信登录", klsLoginSmsAction);
  });
  refreshBtn.addEventListener("click", async () => {
    await run("刷新令牌", klsRefreshTokenAction);
  });
  gatewayBtn.addEventListener("click", async () => {
    await run("获取网关Key", klsGatewayKeyAction);
  });
  updateCheckBtn.addEventListener("click", async () => {
    try {
      const data = await klsUpdateCheckAction({ forcePrompt: true });
      setKlsLastResponse("检查更新", data);
      showActionFeedback(true, hasAppUpdateAvailable(data) ? "检查更新成功" : t("app_update_none", "当前已是最新版本"));
      log("KLS 检查更新 success");
    } catch (error) {
      const message = String((error == null ? void 0 : error.message) || error);
      setKlsLastResponse("检查更新失败", { error: message });
      showActionFeedback(false, "检查更新失败");
      log(`KLS 检查更新 failed: ${message}`);
    }
  });
  updateAckBtn.addEventListener("click", async () => {
    await run("上报更新回执", klsUpdateAckAction);
  });
  logoutBtn.addEventListener("click", async () => {
    await run("退出登录", klsLogoutAction);
  });
  renderKlsAuthState();
}
function bindAuthPage() {
  const sendBtn = document.getElementById("auth-send-sms-btn");
  const loginSmsBtn = document.getElementById("auth-login-sms-btn");
  if (!sendBtn || !loginSmsBtn) return;
  const syncAuthEntryPurpose = () => {
    if (authSmsPurposeEl) authSmsPurposeEl.value = "LOGIN";
    if (klsSmsPurposeEl) klsSmsPurposeEl.value = "LOGIN";
    loginSmsBtn.textContent = t("auth_login_register", "登录/注册");
  };
  const setSmsCooldownUi = (secondsLeft) => {
    const safeLeft = Math.max(0, Number(secondsLeft) || 0);
    authSmsCooldownLeft = safeLeft;
    const inCooldown = safeLeft > 0;
    sendBtn.disabled = inCooldown;
    sendBtn.classList.toggle("is-countdown", inCooldown);
    sendBtn.textContent = inCooldown ? tFmt("auth_send_code_wait", "{seconds}s后重发", { seconds: safeLeft }) : t("auth_send_code", "发送验证码");
  };
  const startSmsCooldown = (seconds = 60) => {
    if (authSmsCooldownTimer) {
      window.clearInterval(authSmsCooldownTimer);
      authSmsCooldownTimer = null;
    }
    setSmsCooldownUi(seconds);
    authSmsCooldownTimer = window.setInterval(() => {
      if (authSmsCooldownLeft <= 1) {
        window.clearInterval(authSmsCooldownTimer);
        authSmsCooldownTimer = null;
        setSmsCooldownUi(0);
        return;
      }
      setSmsCooldownUi(authSmsCooldownLeft - 1);
    }, 1e3);
  };
  const run = async (label, fn, goMainOnSuccess = false) => {
    try {
      syncKlsInputsFromAuthPage();
      const data = await fn();
      setKlsLastResponse(label, data);
      showActionFeedback(true, `${label}成功`);
      log(`Auth ${label} success`);
      if (goMainOnSuccess && isKlsLoggedIn()) {
        const bootstrap = await runKlsPostLoginBootstrap();
        if (!bootstrap.runtime_ok) {
          showActionFeedback(
            false,
            "登录成功，但运行配置获取失败，请重试"
          );
          return;
        }
        setView("main", { force: true, silent: true });
        await refreshBoard();
      }
    } catch (error) {
      const message = String((error == null ? void 0 : error.message) || error);
      setKlsLastResponse(`${label}失败`, { error: message });
      showActionFeedback(false, `${label}失败`);
      log(`Auth ${label} failed: ${message}`);
    }
  };
  sendBtn.addEventListener("click", async () => {
    if (authSmsCooldownLeft > 0) return;
    syncAuthEntryPurpose();
    try {
      syncKlsInputsFromAuthPage();
      const data = await klsSendSmsAction();
      setKlsLastResponse("发送验证码", data);
      showActionFeedback(true, `${t("auth_send_code", "发送验证码")}成功`);
      log("Auth 发送验证码 success");
      startSmsCooldown(60);
    } catch (error) {
      const message = String((error == null ? void 0 : error.message) || error);
      setKlsLastResponse("发送验证码失败", { error: message });
      showActionFeedback(false, `${t("auth_send_code", "发送验证码")}失败`);
      log(`Auth 发送验证码 failed: ${message}`);
    }
  });
  loginSmsBtn.addEventListener("click", async () => {
    syncAuthEntryPurpose();
    await run("登录/注册", klsEntrySmsAction, true);
  });
  syncAuthInputsFromKlsPanel();
  syncAuthEntryPurpose();
  setSmsCooldownUi(0);
  renderKlsAuthState();
}
function getIsoWeekBucket(rawDate) {
  const date = /* @__PURE__ */ new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 864e5 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
function buildTrendItemsFromHistory(historyRows, view) {
  const rows = Array.isArray(historyRows) ? historyRows : [];
  const grouped = /* @__PURE__ */ new Map();
  rows.forEach((row) => {
    const billedAt = String((row == null ? void 0 : row.billed_at) || "").trim();
    const dateToken = billedAt.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToken)) return;
    const label = view === "weekly" ? getIsoWeekBucket(dateToken) : dateToken;
    if (!label) return;
    const cents = Number((row == null ? void 0 : row.total_cents) || 0);
    grouped.set(label, (grouped.get(label) || 0) + (Number.isFinite(cents) ? cents : 0));
  });
  return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([label, totalCents]) => ({ label, total_cents: totalCents }));
}
function renderActiveBoardRows(tables) {
  if (!boardBodyEl) return;
  const rows = Array.isArray(tables) ? tables : [];
  boardBodyEl.innerHTML = rows.map((row) => {
    const summaryRaw = row.menu_summary && row.menu_summary.trim() ? row.menu_summary : t("board_summary_pending", "待补充菜品");
    const summary = formatLocalizedMenuSummary(summaryRaw) || t("board_summary_pending", "待补充菜品");
    const rowTable = String(row.table_no || "").toUpperCase();
    const selectedClass = rowTable && rowTable === selectedTableNo ? "is-selected" : "";
    return `<tr data-table-no="${rowTable}" class="${selectedClass}"><td>${row.table_no}</td><td>${escapeHtml(summary)}</td></tr>`;
  }).join("");
  bindBoardSelectionClicks();
  applyBoardSelectionState();
}
async function refreshBoard() {
  if (!boardBodyEl) return;
  try {
    const query = new URLSearchParams({
      operator: getCurrentOperatorId(),
      device_id: MAIN_DEVICE_ID
    });
    const data = await api(`/api/tables/active?${query.toString()}`, "GET");
    if (data && typeof data.selected_table_no === "string") {
      setSelectedTableNo(data.selected_table_no);
    }
    const tables = Array.isArray(data.tables) ? data.tables : [];
    activeBoardTablesCache = tables;
    if (!tables.length) {
      setSelectedTableNo("");
      activeBoardTablesCache = [];
      boardBodyEl.innerHTML = `
        <tr>
          <td>--</td>
          <td>${t("board_no_active_tables", "暂无进行中的桌台")}</td>
        </tr>
      `;
      renderSelectedOrderBoard({});
      applyBoardSelectionState();
      return;
    }
    renderActiveBoardRows(tables);
    await refreshSelectedTablePanel();
  } catch (error) {
    log(`Board refresh failed: ${error.message}`);
    setSelectedTableNo("");
    activeBoardTablesCache = [];
    renderSelectedOrderBoard({});
    if (boardBodyEl) {
      boardBodyEl.innerHTML = `
        <tr>
          <td>--</td>
          <td>${t("board_load_failed", "桌台数据加载失败")}</td>
        </tr>
      `;
    }
  }
}
function escapeHtml(text) {
  return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function formatSalesTrendLabel(rawLabel, view = "daily") {
  const label = String(rawLabel || "").trim();
  if (!label) return "N/A";
  if (view === "weekly") {
    if (label.includes("W")) return label.replace(/^.*?W/, "W");
    return label.length > 7 ? label.slice(-7) : label;
  }
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label);
  if (dateMatch) return `${dateMatch[2]}-${dateMatch[3]}`;
  return label.length > 5 ? label.slice(-5) : label;
}
function formatSalesYAxisValue(yuan) {
  const value = Number(yuan || 0);
  if (value >= 1e4) return `${(value / 1e4).toFixed(1)}w`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return String(Math.round(value));
}
function renderSalesTrendChart() {
  if (!salesTrendChartEl || !salesTrendYAxisEl) return;
  installSalesTrendCompatStyle();
  const rawItems = salesTrendView === "weekly" ? salesTrendWeeklyItems : salesTrendDailyItems;
  const items = (Array.isArray(rawItems) ? rawItems : []).slice(-12);
  const caption = salesTrendView === "weekly" ? "当前：每周视图（近90天）" : "当前：每日视图（近7天）";
  if (salesTrendCaptionEl) salesTrendCaptionEl.textContent = caption;
  salesViewDailyBtnEl == null ? void 0 : salesViewDailyBtnEl.classList.toggle("is-active", salesTrendView === "daily");
  salesViewWeeklyBtnEl == null ? void 0 : salesViewWeeklyBtnEl.classList.toggle("is-active", salesTrendView === "weekly");
  salesTrendYAxisEl.innerHTML = "";
  if (!items.length) {
    salesTrendChartEl.innerHTML = `<div class="sales-trend-empty-state"><div><strong>暂无图表数据</strong><span>当前仅统计已结订单，完成买单后会显示趋势。</span></div></div>`;
    return;
  }
  const maxCents = Math.max(...items.map((item) => Number((item == null ? void 0 : item.total_cents) || 0)), 0);
  const svgWidth = 1000;
  const svgHeight = 360;
  const chartTop = 18;
  const chartBottom = 78;
  const chartLeft = 18;
  const chartRight = 18;
  const plotWidth = svgWidth - chartLeft - chartRight;
  const plotHeight = svgHeight - chartTop - chartBottom;
  const colWidth = plotWidth / Math.max(items.length, 1);
  const barWidth = Math.max(22, Math.min(52, colWidth * 0.44));
  const chartFloor = chartTop + plotHeight;
  const gridLineCount = 4;
  const gridLines = Array.from({ length: gridLineCount }, (_, index) => {
    const y = chartTop + plotHeight * (index / Math.max(gridLineCount - 1, 1));
    return `<line x1="${chartLeft}" y1="${y.toFixed(1)}" x2="${(svgWidth - chartRight).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d8e3f1" stroke-width="1" stroke-dasharray="5 5" />`;
  }).join("");
  const bars = items.map((item, index) => {
    const totalCents = Number((item == null ? void 0 : item.total_cents) || 0);
    const axisLabel = formatSalesTrendLabel(item == null ? void 0 : item.label, salesTrendView);
    const valueLabel = `¥${(totalCents / 100).toFixed(2)}`;
    const hoverLabel = `${axisLabel} / ${valueLabel}`;
    const barHeight = maxCents > 0 ? Math.max(12, totalCents / maxCents * plotHeight) : 12;
    const x = chartLeft + index * colWidth + (colWidth - barWidth) / 2;
    const y = chartFloor - barHeight;
    const textY = Math.max(chartTop + 18, y - 12);
    const labelX = x + barWidth / 2;
    return `
      <g>
        <title>${escapeHtml(hoverLabel)}</title>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="10" ry="10" fill="url(#salesTrendBarFill)" />
        <text x="${labelX.toFixed(1)}" y="${textY.toFixed(1)}" text-anchor="middle" font-size="54" font-weight="700" fill="#0f6f93">${escapeHtml(valueLabel)}</text>
        <text x="${labelX.toFixed(1)}" y="${(svgHeight - 20).toFixed(1)}" text-anchor="middle" font-size="40" fill="#64748b">${escapeHtml(axisLabel)}</text>
      </g>
    `;
  }).join("");
  salesTrendChartEl.innerHTML = `
    <div class="sales-trend-svg-stage">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" aria-label="营收趋势图">
        <defs>
          <linearGradient id="salesTrendBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2bb6d6"></stop>
            <stop offset="100%" stop-color="#0f78b5"></stop>
          </linearGradient>
        </defs>
        ${gridLines}
        ${bars}
      </svg>
    </div>
  `;
}
function setSalesTrendView(view) {
  if (view !== "daily" && view !== "weekly") return;
  salesTrendView = view;
  renderSalesTrendChart();
}
function bindSalesTrendToggle() {
  salesViewDailyBtnEl == null ? void 0 : salesViewDailyBtnEl.addEventListener("click", () => setSalesTrendView("daily"));
  salesViewWeeklyBtnEl == null ? void 0 : salesViewWeeklyBtnEl.addEventListener("click", () => setSalesTrendView("weekly"));
}
function renderProfitPeriodMetric() {
  const cents = profitPeriodView === "month" ? profitPeriodMonthCents : profitPeriodWeekCents;
  if (profitPeriodValueEl) {
    profitPeriodValueEl.textContent = `¥ ${(Number(cents || 0) / 100).toFixed(2)}`;
  }
  profitPeriodWeekBtnEl == null ? void 0 : profitPeriodWeekBtnEl.classList.toggle("is-active", profitPeriodView === "week");
  profitPeriodMonthBtnEl == null ? void 0 : profitPeriodMonthBtnEl.classList.toggle("is-active", profitPeriodView === "month");
}
function setProfitPeriodView(view) {
  if (view !== "week" && view !== "month") return;
  profitPeriodView = view;
  renderProfitPeriodMetric();
}
function bindProfitPeriodToggle() {
  profitPeriodWeekBtnEl == null ? void 0 : profitPeriodWeekBtnEl.addEventListener("click", () => setProfitPeriodView("week"));
  profitPeriodMonthBtnEl == null ? void 0 : profitPeriodMonthBtnEl.addEventListener("click", () => setProfitPeriodView("month"));
}
async function refreshStats() {
  var _a2, _b2, _c2, _d2, _e2, _f2;
  try {
    const [currentResult, todayResult, weekTotalResult, monthTotalResult, weeklyResult, monthlyResult] = await Promise.allSettled([
      api("/api/stats/profit/current", "GET"),
      api("/api/stats/profit/today", "GET"),
      api("/api/stats/profit/this-week", "GET"),
      api("/api/stats/profit/this-month", "GET"),
      api("/api/stats/profit/weekly", "GET"),
      api("/api/stats/profit/monthly", "GET")
    ]);
    const current = currentResult.status === "fulfilled" ? currentResult.value : null;
    const today = todayResult.status === "fulfilled" ? todayResult.value : null;
    const weekTotal = weekTotalResult.status === "fulfilled" ? weekTotalResult.value : null;
    const monthTotal = monthTotalResult.status === "fulfilled" ? monthTotalResult.value : null;
    const weekly = weeklyResult.status === "fulfilled" ? weeklyResult.value : null;
    const monthly = monthlyResult.status === "fulfilled" ? monthlyResult.value : null;
    if (currentResult.status === "rejected") {
      log(`Stats current failed: ${((_a2 = currentResult.reason) == null ? void 0 : _a2.message) || currentResult.reason}`);
    }
    if (todayResult.status === "rejected") {
      log(`Stats today failed: ${((_b2 = todayResult.reason) == null ? void 0 : _b2.message) || todayResult.reason}`);
    }
    if (weekTotalResult.status === "rejected") {
      log(`Stats this-week failed: ${((_c2 = weekTotalResult.reason) == null ? void 0 : _c2.message) || weekTotalResult.reason}`);
    }
    if (monthTotalResult.status === "rejected") {
      log(`Stats this-month failed: ${((_d2 = monthTotalResult.reason) == null ? void 0 : _d2.message) || monthTotalResult.reason}`);
    }
    if (weeklyResult.status === "rejected") {
      log(`Stats weekly failed: ${((_e2 = weeklyResult.reason) == null ? void 0 : _e2.message) || weeklyResult.reason}`);
    }
    if (monthlyResult.status === "rejected") {
      log(`Stats monthly failed: ${((_f2 = monthlyResult.reason) == null ? void 0 : _f2.message) || monthlyResult.reason}`);
    }
    const billedTodayCents = Number((today == null ? void 0 : today.total_cents) || 0);
    const currentCents = Number((current == null ? void 0 : current.total_cents) || billedTodayCents);
    const openSubtotalCents = Math.max(0, currentCents - billedTodayCents);
    const weekCents = Number((weekTotal == null ? void 0 : weekTotal.total_cents) || 0) + openSubtotalCents;
    const monthCents = Number((monthTotal == null ? void 0 : monthTotal.total_cents) || 0) + openSubtotalCents;
    if (profitCurrentEl) {
      profitCurrentEl.textContent = `¥ ${(currentCents / 100).toFixed(2)}`;
    }
    profitPeriodWeekCents = weekCents;
    profitPeriodMonthCents = monthCents;
    renderProfitPeriodMetric();
    if (statsScopeNoteEl) {
      statsScopeNoteEl.textContent = "口径：默认含未结单";
    }
    salesTrendDailyItems = Array.isArray(weekly == null ? void 0 : weekly.items) ? weekly.items : [];
    salesTrendWeeklyItems = Array.isArray(monthly == null ? void 0 : monthly.items) ? monthly.items : [];
    if (!salesTrendDailyItems.length || !salesTrendWeeklyItems.length) {
      const history = await api("/api/orders/history?limit=300", "GET");
      const historyRows = Array.isArray(history == null ? void 0 : history.items) ? history.items : [];
      if (!salesTrendDailyItems.length) {
        salesTrendDailyItems = buildTrendItemsFromHistory(historyRows, "daily");
      }
      if (!salesTrendWeeklyItems.length) {
        salesTrendWeeklyItems = buildTrendItemsFromHistory(historyRows, "weekly");
      }
    }
    log(`Stats loaded: daily=${salesTrendDailyItems.length}, weekly=${salesTrendWeeklyItems.length}`);
    renderSalesTrendChart();
  } catch (error) {
    log(`Stats refresh failed: ${error.message}`);
  }
}
async function refreshStatsConfig() {
  try {
    const cfg = await api("/api/stats/config", "GET");
    const enabled = Boolean(cfg.include_open_orders_in_current);
    if (statsIncludeOpenEl) {
      statsIncludeOpenEl.checked = enabled;
    }
    if (!enabled) {
      await api("/api/stats/config", "POST", {
        include_open_orders_in_current: true
      }, { notify: false });
      log("Stats scope defaulted to include open orders");
    }
  } catch (error) {
    log(`Stats config load failed: ${error.message}`);
  }
}
async function updateStatsConfig() {
  if (!statsIncludeOpenEl) return;
  try {
    await api("/api/stats/config", "POST", {
      include_open_orders_in_current: Boolean(statsIncludeOpenEl.checked)
    });
    await refreshStats();
    log(`Stats scope updated: include_open_orders=${statsIncludeOpenEl.checked ? "true" : "false"}`);
  } catch (error) {
    log(`Stats config update failed: ${error.message}`);
  }
}
function numberOr(defaultValue, raw, minValue = 1) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < minValue) return defaultValue;
  return Math.floor(value);
}
function sanitizeSingleLetter(value, fallback = "") {
  const formatted = String(value || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
  if (!formatted && fallback) return fallback;
  return formatted;
}
function sanitizeTableCount(value, fallback = "10") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  const number = Number.parseInt(text, 10);
  if (!Number.isFinite(number)) return fallback;
  if (number < 1) return "1";
  if (number > 99) return "99";
  return String(number);
}
const ASR_LANGUAGE_PRESETS = {
  "zh_cn:mandarin": { language: "zh_cn", domain: "iat", accent: "mandarin", label: "中文普通话" },
  "zh_cn:cantonese": { language: "zh_cn", domain: "iat", accent: "cantonese", label: "中文粤语" },
  "zh_cn:lmz": { language: "zh_cn", domain: "iat", accent: "lmz", label: "中文四川话" }
};
function normalizeAsrLanguagePresetKey(raw) {
  const text = String(raw || "").trim().toLowerCase();
  if (ASR_LANGUAGE_PRESETS[text]) return text;
  return "zh_cn:mandarin";
}
function getAsrLanguagePresetKeyFromUi() {
  if (!(settingsCopyAsrLanguageEl instanceof HTMLSelectElement)) return "";
  return normalizeAsrLanguagePresetKey(settingsCopyAsrLanguageEl.value || "");
}
function syncAsrLanguagePresetFromUi() {
  const uiKey = getAsrLanguagePresetKeyFromUi();
  if (!uiKey) return;
  if (asrLanguagePresetKey === uiKey) return;
  asrLanguagePresetKey = uiKey;
  klsAsrRealtimeSessionCache = null;
}
function getCurrentAsrLanguageOptions() {
  syncAsrLanguagePresetFromUi();
  const key = normalizeAsrLanguagePresetKey(asrLanguagePresetKey);
  const preset = ASR_LANGUAGE_PRESETS[key] || ASR_LANGUAGE_PRESETS["zh_cn:mandarin"];
  return {
    language: preset.language,
    domain: preset.domain,
    accent: preset.accent
  };
}
function applyAsrLanguagePreset(rawKey, options = {}) {
  const key = normalizeAsrLanguagePresetKey(rawKey);
  asrLanguagePresetKey = key;
  if (settingsCopyAsrLanguageEl instanceof HTMLSelectElement) {
    settingsCopyAsrLanguageEl.value = key;
  }
  klsAsrRealtimeSessionCache = null;
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(ASR_LANGUAGE_PREF_STORAGE_KEY, key);
    } catch {
    }
  }
}
function restoreAsrLanguagePreset() {
  let stored = "";
  try {
    stored = String(window.localStorage.getItem(ASR_LANGUAGE_PREF_STORAGE_KEY) || "").trim();
  } catch {
    stored = "";
  }
  const uiValue = settingsCopyAsrLanguageEl instanceof HTMLSelectElement ? String(settingsCopyAsrLanguageEl.value || "").trim() : "";
  const resolved = normalizeAsrLanguagePresetKey(stored || uiValue || "zh_cn:mandarin");
  const shouldPersist = Boolean(stored) && stored !== resolved;
  applyAsrLanguagePreset(resolved, { persist: shouldPersist });
}
function setSummaryActionButtonText(button, mainText, subText) {
  if (!button) return;
  button.textContent = mainText;
}
function normalizeVoiceCaptureMode(raw) {
  return String(raw || "").trim().toLowerCase() === "hold" ? "hold" : "toggle";
}
function applyDisplayLanguageTexts() {
  const navMainEl = document.getElementById("nav-main");
  const navMenuEl = document.getElementById("nav-menu");
  const navSalesEl = document.getElementById("nav-sales");
  const mainColDishEl = document.getElementById("main-col-dish");
  const mainColQtyEl = document.getElementById("main-col-qty");
  const mainColPriceEl = document.getElementById("main-col-price");
  const mainColStatusEl = document.getElementById("main-col-status");
  const selectedOrderEmptyEl = document.getElementById("selected-order-empty");
  const mainPlaceholderTitleEl = document.getElementById("main-placeholder-title");
  const mainVoiceCardTitleEl = document.getElementById("main-voice-card-title");
  const menuDbTitleEl = document.getElementById("menu-db-title");
  const menuCategoryLoadingEl = document.getElementById("menu-category-loading");
  const menuColNameEl = document.getElementById("menu-col-name");
  const menuColCategoryEl = document.getElementById("menu-col-category");
  const menuColPriceEl = document.getElementById("menu-col-price");
  const menuColUnitEl = document.getElementById("menu-col-unit");
  const menuColAliasEl = document.getElementById("menu-col-alias");
  const dishTableEmptyEl = document.getElementById("dish-table-empty");
  const menuOcrNativeMainEl = document.getElementById("menu-ocr-native-main");
  const menuOcrNativeSubEl = document.getElementById("menu-ocr-native-sub");
  const menuOcrImportBtnViewEl = document.getElementById("menu-ocr-import");
  const menuOcrPreviewConfirmBtnViewEl = document.getElementById("menu-ocr-preview-confirm-btn");
  const menuPlaceholderTitleEl = document.getElementById("menu-placeholder-title");
  const menuSingleCardTitleEl = document.getElementById("menu-single-card-title");
  const asrCardTitleEl = document.getElementById("sc-asr-card-title");
  const asrLanguageTitleEl = document.getElementById("sc-asr-language-title");
  const asrLanguageDescEl = document.getElementById("sc-asr-language-desc");
  const voiceCaptureTitleEl = document.getElementById("sc-voice-capture-title");
  const voiceCaptureDescEl = document.getElementById("sc-voice-capture-desc");
  const displayLanguageTitleEl = document.getElementById("sc-display-language-title");
  const displayLanguageDescEl = document.getElementById("sc-display-language-desc");
  const printerItemFontSizeTitleEl = document.getElementById("printer-item-font-size-title");
  const printerItemFontSizeDescEl = document.getElementById("printer-item-font-size-desc");
  const printerAutoCheckoutTitleEl = document.getElementById("printer-auto-checkout-title");
  const printerAutoCheckoutDescEl = document.getElementById("printer-auto-checkout-desc");
  const authTaglineEl = document.querySelector(".auth-shell-brand p");
  const authTitleEl = document.querySelector(".auth-hero h2");
  const authDescEl = document.querySelector(".auth-hero .muted");
  const authPhoneLabelEl = document.querySelector('label[for="auth-phone"]');
  const authPhoneInputEl = document.getElementById("auth-phone");
  const authCodeLabelEl = document.querySelector('label[for="auth-sms-code"]');
  const authCodeInputEl = document.getElementById("auth-sms-code");
  const authSendSmsBtnEl = document.getElementById("auth-send-sms-btn");
  const authLoginSmsBtnEl = document.getElementById("auth-login-sms-btn");
  const authDisclaimerEl = document.querySelector(".auth-disclaimer");
  const profileAccountTitleEl = document.querySelector("#view-profile .profile-card-head h3");
  const profilePlanTitleEl = document.querySelector("#profile-current-plan .profile-card-head h3");
  const profileUpgradePlanBtnEl = document.getElementById("profile-show-plans-btn");
  const profilePickPlanTitleEl = document.querySelector("#profile-plan-picker .profile-plan-picker-head h3");
  const profileHidePlansBtnEl = document.getElementById("profile-hide-plans-btn");
  const profileLogoutTextEl = document.querySelector("#profile-logout-btn");
  const checkoutModalTitleEl = document.querySelector("#checkout-modal .confirm-modal-head h3");
  const checkoutModalDescEl = document.querySelector("#checkout-modal .confirm-modal-head p");
  const checkoutTableLabelEl = document.querySelector('label[for="checkout-table-no"]');
  if (navMainEl) navMainEl.textContent = t("nav_main", "主页面");
  if (navMenuEl) navMenuEl.textContent = t("nav_menu", "菜品录入");
  if (navSalesEl) navSalesEl.textContent = t("nav_sales", "数据查看");
  if (mainColDishEl) mainColDishEl.textContent = t("main_col_dish", "菜品");
  if (mainColQtyEl) mainColQtyEl.textContent = t("main_col_qty", "数量");
  if (mainColPriceEl) mainColPriceEl.textContent = t("main_col_price", "价格");
  if (mainColStatusEl) mainColStatusEl.textContent = t("main_col_status", "状态");
  setSummaryActionButtonText(selectedPrintBtnEl, t("main_action_print", "打印"), t("main_action_print_sub", "小票"));
  setSummaryActionButtonText(selectedCheckoutBtnEl, t("main_action_checkout", "买单"), t("main_action_checkout_sub", "确认"));
  if (selectedOrderEmptyEl) selectedOrderEmptyEl.textContent = t("main_selected_empty", "请选择左侧桌台查看明细");
  if (mainPlaceholderTitleEl) mainPlaceholderTitleEl.textContent = t("main_placeholder_title", "主控页功能区占位框");
  if (mainVoiceCardTitleEl) mainVoiceCardTitleEl.textContent = t("main_voice_card_title", "语音命令占位框");
  if (menuDbTitleEl) menuDbTitleEl.textContent = t("menu_db_title", "菜品数据库");
  if (menuCategoryLoadingEl) menuCategoryLoadingEl.textContent = t("menu_loading", "加载中...");
  if (menuColNameEl) menuColNameEl.textContent = t("menu_col_name", "菜名");
  if (menuColCategoryEl) menuColCategoryEl.textContent = t("menu_col_category", "分类");
  if (menuColPriceEl) menuColPriceEl.textContent = t("menu_col_price", "价格");
  if (menuColUnitEl) menuColUnitEl.textContent = t("menu_col_unit", "单位");
  if (menuColAliasEl) menuColAliasEl.textContent = t("menu_col_alias", "别名");
  if (dishTableEmptyEl) dishTableEmptyEl.textContent = t("menu_empty", "暂无菜品");
  if (menuOcrNativeMainEl) menuOcrNativeMainEl.textContent = t("menu_ocr_main", "拍照上传菜单");
  if (menuOcrNativeSubEl) menuOcrNativeSubEl.textContent = t("menu_ocr_sub", "智能识别并预录入");
  if (menuOcrImportBtnViewEl) menuOcrImportBtnViewEl.textContent = t("menu_ocr_import_btn", "识别并预录入");
  if (menuOcrPreviewConfirmBtnViewEl) menuOcrPreviewConfirmBtnViewEl.textContent = t("menu_ocr_confirm_btn", "确认录入");
  if (menuPlaceholderTitleEl) menuPlaceholderTitleEl.textContent = t("menu_placeholder_title", "菜品页功能区占位框");
  if (menuSingleCardTitleEl) menuSingleCardTitleEl.textContent = t("menu_single_card_title", "菜品语音录入占位框");
  if (asrCardTitleEl) asrCardTitleEl.textContent = t("sc_asr_card_title", "ASR 语种设置");
  if (asrLanguageTitleEl) asrLanguageTitleEl.textContent = t("sc_asr_language_title", "语音识别语言");
  if (asrLanguageDescEl) asrLanguageDescEl.textContent = t("sc_asr_language_desc", "用于 KLS -> 讯飞 ASR 的 language/accent 参数");
  if (voiceCaptureTitleEl) voiceCaptureTitleEl.textContent = t("sc_voice_capture_title", "说话方式");
  if (voiceCaptureDescEl) voiceCaptureDescEl.textContent = t("sc_voice_capture_desc", "同步主页面和菜品录入页的语音按钮与音量键行为");
  if (displayLanguageTitleEl) displayLanguageTitleEl.textContent = t("sc_display_language_title", "App 显示语言");
  if (displayLanguageDescEl) displayLanguageDescEl.textContent = t("sc_display_language_desc", "切换界面显示语言（支持维语兼容）");
  if (printerItemFontSizeTitleEl) printerItemFontSizeTitleEl.textContent = t("sc_printer_item_font_size_title", "菜单字号");
  if (printerItemFontSizeDescEl) printerItemFontSizeDescEl.textContent = t("sc_printer_item_font_size_desc", "仅调整小票菜品项字号，其他内容保持不变");
  if (printerItemFontSizeEl instanceof HTMLSelectElement) {
    const optionTextByValue = {
      small: t("printer_item_font_small", "小（当前）"),
      medium: t("printer_item_font_medium", "中"),
      large: t("printer_item_font_large", "大")
    };
    Array.from(printerItemFontSizeEl.options || []).forEach((option) => {
      const text = optionTextByValue[normalizePrinterItemFontSize(option.value)];
      if (text) option.textContent = text;
    });
  }
  if (printerAutoCheckoutTitleEl) printerAutoCheckoutTitleEl.textContent = t("sc_printer_auto_checkout_title", "结账自动打印");
  if (printerAutoCheckoutDescEl) printerAutoCheckoutDescEl.textContent = t("sc_printer_auto_checkout_desc", "确认结账后自动发送中文账单到已连接打印机");
  if (authTaglineEl) authTaglineEl.textContent = t("auth_tagline", "智能语音点餐助手");
  if (authTitleEl) authTitleEl.textContent = t("auth_title", "登录 / 注册");
  if (authDescEl) authDescEl.textContent = t("auth_desc", "手机号验证码一键进入。未注册手机号自动注册，已注册手机号直接登录。");
  if (authPhoneLabelEl) authPhoneLabelEl.textContent = t("auth_phone_label", "手机号");
  if (authPhoneInputEl) authPhoneInputEl.placeholder = t("auth_phone_placeholder", "请输入手机号");
  if (authCodeLabelEl) authCodeLabelEl.textContent = t("auth_code_label", "验证码");
  if (authCodeInputEl) authCodeInputEl.placeholder = t("auth_code_placeholder", "请输入6位验证码");
  if (authSendSmsBtnEl && authSmsCooldownLeft <= 0) authSendSmsBtnEl.textContent = t("auth_send_code", "发送验证码");
  if (authLoginSmsBtnEl) authLoginSmsBtnEl.textContent = t("auth_login_register", "登录/注册");
  if (authDisclaimerEl) authDisclaimerEl.textContent = t("auth_disclaimer", "验证码有效期 5 分钟，发送后 60 秒内不可重复发送。");
  if (profileAccountTitleEl) profileAccountTitleEl.textContent = t("profile_account_title", "账号信息");
  if (profilePlanTitleEl) profilePlanTitleEl.textContent = t("profile_plan_title", "当前套餐");
  if (profileUpgradePlanBtnEl) profileUpgradePlanBtnEl.childNodes[0].textContent = t("profile_upgrade_plan", "升级套餐");
  if (profilePickPlanTitleEl) {
    const textNode = Array.from(profilePickPlanTitleEl.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim());
    if (textNode) {
      textNode.textContent = ` ${t("profile_pick_plan", "选择适合您的套餐")}`;
    }
  }
  if (profileHidePlansBtnEl) profileHidePlansBtnEl.textContent = t("profile_hide_plans", "收起");
  if (profileLogoutTextEl) {
    const textNode = Array.from(profileLogoutTextEl.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && String(node.textContent || "").trim());
    if (textNode) {
      textNode.textContent = ` ${t("profile_logout", "退出登录")}`;
    }
  }
  if (checkoutModalTitleEl) checkoutModalTitleEl.textContent = t("checkout_confirm_heading", "确认买单");
  if (checkoutModalDescEl) checkoutModalDescEl.textContent = t("checkout_confirm_desc", "请核对账单信息后再操作");
  if (checkoutTableLabelEl) checkoutTableLabelEl.textContent = t("checkout_confirm_table", "桌号");
  if (checkoutTableInputEl) checkoutTableInputEl.placeholder = t("checkout_confirm_placeholder", "例如：A12");
  if (settingsCopyVoiceCaptureModeEl instanceof HTMLSelectElement) {
    const optionToggle = settingsCopyVoiceCaptureModeEl.querySelector('option[value="toggle"]');
    const optionHold = settingsCopyVoiceCaptureModeEl.querySelector('option[value="hold"]');
    if (optionToggle) optionToggle.textContent = t("voice_mode_toggle_label", "按一次开始，再按一次结束");
    if (optionHold) optionHold.textContent = t("voice_mode_hold_label", "按住说话，松开结束");
  }
  if (settingsCopyAppDisplayLanguageEl instanceof HTMLSelectElement) {
    const optionZh = settingsCopyAppDisplayLanguageEl.querySelector('option[value="zh_cn"]');
    const optionUg = settingsCopyAppDisplayLanguageEl.querySelector('option[value="ug_cn"]');
    if (optionZh) optionZh.textContent = t("display_lang_zh", "简体中文");
    if (optionUg) optionUg.textContent = t("display_lang_ug", "ئۇيغۇرچە");
  }
  renderSelectedTableStatus();
  if (!selectedTableNo && selectedTotalLabelEl) {
    selectedTotalLabelEl.textContent = `-- ${t("main_total_suffix", "总计")}`;
  }
  if (menuFilterStatusEl && !menuItemsCache.length) {
    menuFilterStatusEl.textContent = `${t("menu_filter_prefix", "当前分类：")}${t("menu_filter_all", "全部")}`;
  }
  if (menuOcrNativeStatusEl && !menuOcrNativeStatusEl.classList.contains("is-error")) {
    const current = String(menuOcrNativeStatusEl.textContent || "").trim();
    const knownHints = Object.values(DISPLAY_LANGUAGE_PRESETS).map((preset) => String((preset == null ? void 0 : preset.menu_ocr_hint) || "").trim()).filter(Boolean);
    if (!current || knownHints.includes(current)) {
      menuOcrNativeStatusEl.textContent = t("menu_ocr_hint", "点击拍照后自动识别，并弹出预录入确认");
    }
  }
  redrawMenuLanguageViews();
  renderKlsAuthState();
  void ensureMenuDisplayI18nMapForCurrentLanguage(menuItemsCache);
}
function applyAppDisplayLanguage(raw, options = {}) {
  appDisplayLanguageKey = normalizeAppDisplayLanguage(raw);
  if (document && document.documentElement) {
    document.documentElement.lang = appDisplayLanguageKey === "ug_cn" ? "ug-CN" : "zh-CN";
    document.documentElement.dir = "ltr";
  }
  if (settingsCopyAppDisplayLanguageEl instanceof HTMLSelectElement) {
    settingsCopyAppDisplayLanguageEl.value = appDisplayLanguageKey;
  }
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(APP_DISPLAY_LANGUAGE_STORAGE_KEY, appDisplayLanguageKey);
    } catch {
    }
    writeNativeAppDisplayLanguage(appDisplayLanguageKey);
  }
  applyDisplayLanguageTexts();
  syncVoiceCaptureModeUi();
  updateAsrLiveOverlaySecondPressHint();
  if (singleActionStatusEl && String(singleActionStatusEl.textContent || "").trim()) {
    const text = String(singleActionStatusEl.textContent || "").replace(/^.*[:：]/, "").trim() || "IDLE";
    setSingleActionStatus(text);
  }
  if (menuSingleStatusEl && String(menuSingleStatusEl.textContent || "").trim()) {
    const text = String(menuSingleStatusEl.textContent || "").replace(/^.*[:：]/, "").trim() || "IDLE";
    setMenuSingleStatus(text);
  }
}
function restoreAppDisplayLanguage() {
  let stored = "";
  try {
    stored = String(window.localStorage.getItem(APP_DISPLAY_LANGUAGE_STORAGE_KEY) || "").trim();
  } catch {
    stored = "";
  }
  const nativeStored = readNativeAppDisplayLanguage();
  const resolved = normalizeAppDisplayLanguage(stored || nativeStored || "zh_cn");
  applyAppDisplayLanguage(resolved, { persist: true });
}
function isHoldToTalkVoiceCaptureMode() {
  return normalizeVoiceCaptureMode(voiceCaptureMode) === "hold";
}
function getSingleActionIdleLabel() {
  return isHoldToTalkVoiceCaptureMode() ? t("single_idle_hold", "按住说话") : t("single_idle", "点击开始说话");
}
function getSingleActionActiveLabel() {
  return isHoldToTalkVoiceCaptureMode() ? t("single_active_hold", "松开结束并执行") : t("single_active", "点击结束并执行");
}
function getMenuSingleIdleLabel() {
  return isHoldToTalkVoiceCaptureMode() ? t("menu_idle_hold", "按住录入菜品") : t("menu_idle", "点击开始录入菜品");
}
function getMenuSingleActiveLabel() {
  return isHoldToTalkVoiceCaptureMode() ? t("menu_active_hold", "松开结束并录入菜品") : t("menu_active", "点击结束并录入菜品");
}
function syncVoiceCaptureModeUi() {
  if (settingsCopyVoiceCaptureModeEl instanceof HTMLSelectElement) {
    settingsCopyVoiceCaptureModeEl.value = normalizeVoiceCaptureMode(voiceCaptureMode);
  }
  if (singleActionBtnEl instanceof HTMLButtonElement) {
    if (singleActionListening) {
      singleActionBtnEl.textContent = getSingleActionActiveLabel();
    } else if (!singleActionStartPending && !voiceCommandInFlight) {
      singleActionBtnEl.textContent = getSingleActionIdleLabel();
    }
  }
  if (menuSingleBtnEl instanceof HTMLButtonElement) {
    if (menuSingleListening) {
      menuSingleBtnEl.textContent = getMenuSingleActiveLabel();
    } else if (!menuSingleStartPending && !voiceCommandInFlight) {
      menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
    }
  }
}
function applyVoiceCaptureMode(rawMode, options = {}) {
  voiceCaptureMode = normalizeVoiceCaptureMode(rawMode);
  if (options.persist !== false) {
    try {
      window.localStorage.setItem(VOICE_CAPTURE_MODE_STORAGE_KEY, voiceCaptureMode);
    } catch {
    }
    writeNativeVoiceCaptureMode(voiceCaptureMode);
  }
  syncVoiceCaptureModeUi();
}
function restoreVoiceCaptureMode() {
  let stored = "";
  try {
    stored = String(window.localStorage.getItem(VOICE_CAPTURE_MODE_STORAGE_KEY) || "").trim();
  } catch {
    stored = "";
  }
  const nativeMode = readNativeVoiceCaptureMode();
  const resolved = normalizeVoiceCaptureMode(stored || nativeMode || "toggle");
  applyVoiceCaptureMode(resolved, { persist: true });
}
function applySettingsCopyEnableState(enabled) {
  const on = Boolean(enabled);
  if (settingsCopyTableCountEl) settingsCopyTableCountEl.disabled = !on;
  if (settingsCopyTablePrefixEl) settingsCopyTablePrefixEl.disabled = !on;
}
function renderSettingsCopyFromConfig(cfg) {
  var _a2, _b2;
  if (!settingsCopyEnableRotationEl || !cfg || typeof cfg !== "object") return;
  const cyclicEnabled = Boolean(cfg.cyclic_enabled);
  const cyclicStart = numberOr(1, (_a2 = cfg.cyclic_start) != null ? _a2 : 1);
  const cyclicEnd = numberOr(cyclicStart, (_b2 = cfg.cyclic_end) != null ? _b2 : cyclicStart, cyclicStart);
  const cyclicCount = Math.max(1, cyclicEnd - cyclicStart + 1);
  settingsCopyEnableRotationEl.checked = cyclicEnabled;
  if (settingsCopyTableCountEl) settingsCopyTableCountEl.value = String(cyclicCount);
  if (settingsCopyTablePrefixEl) {
    settingsCopyTablePrefixEl.value = sanitizeSingleLetter(cfg.dinein_prefix, "A");
  }
  if (settingsCopyTakeoutPrefixEl) {
    settingsCopyTakeoutPrefixEl.value = sanitizeSingleLetter(cfg.takeout_prefix, "W");
  }
  applySettingsCopyEnableState(cyclicEnabled);
}
function collectSettingsCopyPayload() {
  var _a2, _b2, _c2;
  const current = tableNumberingConfigCache && typeof tableNumberingConfigCache === "object" ? tableNumberingConfigCache : {};
  const cyclicEnabled = Boolean(settingsCopyEnableRotationEl == null ? void 0 : settingsCopyEnableRotationEl.checked);
  const cyclicStart = numberOr(1, (_a2 = current.cyclic_start) != null ? _a2 : 1);
  const cyclicCount = Number.parseInt(sanitizeTableCount(settingsCopyTableCountEl == null ? void 0 : settingsCopyTableCountEl.value, "10"), 10);
  const cyclicEnd = cyclicStart + Math.max(cyclicCount, 1) - 1;
  return {
    cyclic_enabled: cyclicEnabled,
    dinein_prefix: sanitizeSingleLetter(settingsCopyTablePrefixEl == null ? void 0 : settingsCopyTablePrefixEl.value, "A"),
    dinein_start: numberOr(1, (_b2 = current.dinein_start) != null ? _b2 : 1),
    cyclic_start: cyclicStart,
    cyclic_end: cyclicEnd,
    takeout_enabled: Boolean(current.takeout_enabled),
    takeout_prefix: sanitizeSingleLetter(settingsCopyTakeoutPrefixEl == null ? void 0 : settingsCopyTakeoutPrefixEl.value, "W"),
    takeout_start: numberOr(1, (_c2 = current.takeout_start) != null ? _c2 : 1)
  };
}
function scheduleSettingsCopyAutoSave(delayMs = 320) {
  if (settingsAutoSaveTimer) {
    clearTimeout(settingsAutoSaveTimer);
  }
  settingsAutoSaveTimer = setTimeout(() => {
    settingsAutoSaveTimer = null;
    void saveTableNumberingConfig({ auto: true });
  }, Math.max(100, Number(delayMs) || 320));
}
async function handleSettingsClearMenu() {
  const confirmed = window.confirm("确认清空菜品数据库？该操作会下架当前全部菜品。");
  if (!confirmed) return;
  try {
    if (settingsClearMenuBtnEl) {
      settingsClearMenuBtnEl.disabled = true;
      settingsClearMenuBtnEl.textContent = "清空中...";
    }
    const data = await api("/api/settings/menu/clear-all", "POST", {
      operator_id: getCurrentOperatorId(),
      device_id: MAIN_DEVICE_ID,
      event_id: `settings-menu-clear-${Date.now()}`
    });
    await refreshMenuItems();
    showActionFeedback(true, "菜品数据库已清空");
    log(`settings clear menu done: count=${Number((data == null ? void 0 : data.cleared_count) || 0)}`);
  } catch (error) {
    showActionFeedback(false, "清空菜品失败");
    log(`settings clear menu failed: ${error.message}`);
  } finally {
    if (settingsClearMenuBtnEl) {
      settingsClearMenuBtnEl.disabled = false;
      settingsClearMenuBtnEl.textContent = "清空菜品数据库";
    }
  }
}
async function handleSettingsClearTables() {
  const confirmed = window.confirm("确认清空当前所有桌？该操作会关闭全部 OPEN 桌台并取消未结订单。");
  if (!confirmed) return;
  try {
    if (settingsClearTablesBtnEl) {
      settingsClearTablesBtnEl.disabled = true;
      settingsClearTablesBtnEl.textContent = "清空中...";
    }
    const data = await api("/api/settings/tables/clear-open", "POST", {
      operator_id: getCurrentOperatorId(),
      device_id: MAIN_DEVICE_ID,
      event_id: `settings-table-clear-${Date.now()}`
    });
    await refreshBoard();
    await refreshStats();
    await refreshOrderHistory();
    await refreshAuditLogs();
    showActionFeedback(true, "当前所有桌已清空");
    log(`settings clear tables done: closed=${Number((data == null ? void 0 : data.closed_table_count) || 0)}`);
  } catch (error) {
    showActionFeedback(false, "清空桌台失败");
    log(`settings clear tables failed: ${error.message}`);
  } finally {
    if (settingsClearTablesBtnEl) {
      settingsClearTablesBtnEl.disabled = false;
      settingsClearTablesBtnEl.textContent = "清空当前所有桌";
    }
  }
}
function installSettingsTakeoutResetButtonStyle() {
  if (document.getElementById("settings-takeout-reset-style")) return;
  const style = document.createElement("style");
  style.id = "settings-takeout-reset-style";
  style.textContent = `
    #settings-reset-takeout-btn.settings-takeout-reset-btn{
      width:auto;
      min-width:88px;
      min-height:40px;
      margin-left:auto;
      border:1px solid #0ea5e9;
      border-radius:14px;
      background:linear-gradient(180deg,#ffffff 0%,#ffffff 100%);
      color:#075985;
      font-size:14px;
      font-weight:700;
      font-family:"Manrope","Noto Sans SC",sans-serif;
      padding:8px 14px;
      box-shadow:none;
    }
    #settings-reset-takeout-btn.settings-takeout-reset-btn:disabled{
      opacity:.72;
      box-shadow:none;
    }
  `;
  document.head.appendChild(style);
}
function installProfilePagePolishStyle() {
  if (document.getElementById("profile-page-polish-style")) return;
  const style = document.createElement("style");
  style.id = "profile-page-polish-style";
  style.textContent = `
    #view-profile .profile-avatar{
      width:44px!important;
      height:44px!important;
      min-width:44px!important;
      min-height:44px!important;
      flex:0 0 44px!important;
      font-size:18px!important;
      border-radius:12px!important;
    }
    #view-profile .profile-user-head{
      align-items:flex-start!important;
      gap:10px!important;
    }
    #view-profile .profile-plan-summary-row{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      align-items:start!important;
      column-gap:12px!important;
      row-gap:10px!important;
    }
    #view-profile .profile-plan-summary-main{
      min-width:0!important;
      display:flex!important;
      align-items:flex-start!important;
      gap:12px!important;
    }
    #view-profile #profile-show-plans-btn{
      grid-column:2!important;
      grid-row:1!important;
      align-self:start!important;
      justify-self:end!important;
      width:auto!important;
      min-width:96px!important;
      margin-left:auto!important;
      white-space:nowrap!important;
    }
    @media (max-width: 560px){
      #view-profile .profile-plan-summary-row{
        grid-template-columns:minmax(0,1fr) auto!important;
      }
    }
  `;
  document.head.appendChild(style);
}
function installSalesTrendCompatStyle() {
  if (document.getElementById("sales-trend-compat-style")) return;
  const style = document.createElement("style");
  style.id = "sales-trend-compat-style";
  style.textContent = `
    #view-sales .sales-trend-frame{
      grid-template-columns:minmax(0,1fr)!important;
      padding:12px 14px 8px!important;
    }
    #view-sales .sales-trend-yaxis{
      display:none!important;
    }
    #view-sales .sales-trend-plot{
      overflow:hidden;
    }
    #view-sales .sales-trend-svg-stage{
      position:absolute;
      inset:10px 12px 10px 12px;
    }
    #view-sales .sales-trend-svg-stage svg{
      display:block;
      width:100%;
      height:100%;
    }
    #view-sales .sales-trend-caption{
      font-size:18px;
    }
    #view-sales .sales-trend-empty-state{
      position:absolute;
      inset:10px 12px 10px 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      color:#94a3b8;
      font-size:12px;
      line-height:1.5;
      padding:0 18px;
    }
    #view-sales .sales-trend-empty-state strong{
      display:block;
      color:#64748b;
      font-size:13px;
      font-weight:700;
      margin-bottom:4px;
    }
  `;
  document.head.appendChild(style);
}
function installMenuOcrPreviewModalStyle() {
  if (document.getElementById("menu-ocr-preview-modal-style")) return;
  const style = document.createElement("style");
  style.id = "menu-ocr-preview-modal-style";
  style.textContent = `
    #menu-ocr-preview-modal .modal-card{
      display:flex!important;
      flex-direction:column!important;
      overflow:hidden!important;
    }
    #menu-ocr-preview-modal .confirm-modal-head,
    #menu-ocr-preview-modal #menu-ocr-preview-summary{
      flex:0 0 auto;
    }
    #menu-ocr-preview-modal #menu-ocr-preview-list{
      flex:1 1 auto;
      min-height:140px;
      max-height:min(52vh,420px);
      overflow:auto;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
    }
    #menu-ocr-preview-modal .legacy-actions{
      position:sticky;
      bottom:0;
      z-index:1;
      margin-top:12px;
      padding-top:12px;
      background:linear-gradient(180deg,rgba(248,250,252,0) 0%,rgba(248,250,252,.94) 18%,rgba(248,250,252,1) 100%);
      flex:0 0 auto;
    }
  `;
  document.head.appendChild(style);
}
async function handleSettingsResetTakeoutNumbering() {
  const confirmed = window.confirm("确认重置外卖单号？仅在当前没有外卖单时可执行，下一张外卖单将从 1 开始。");
  if (!confirmed) return;
  try {
    if (settingsResetTakeoutBtnEl) {
      settingsResetTakeoutBtnEl.disabled = true;
      settingsResetTakeoutBtnEl.textContent = "重置中...";
    }
    const data = await api("/api/settings/takeout-numbering/reset", "POST", {
      operator_id: getCurrentOperatorId(),
      device_id: MAIN_DEVICE_ID,
      event_id: `settings-takeout-reset-${Date.now()}`
    });
    await refreshBoard();
    showActionFeedback(true, `外卖单号已重置，下张为 ${String((data == null ? void 0 : data.next_takeout_table_no) || "W1")}`);
    log(`settings takeout numbering reset: next=${String((data == null ? void 0 : data.next_takeout_table_no) || "")}`);
  } catch (error) {
    const message = String((error == null ? void 0 : error.message) || error || "");
    showActionFeedback(false, message.includes("当前仍有外卖单未完成") ? "当前仍有外卖单未完成" : "重置外卖单号失败");
    log(`settings takeout numbering reset failed: ${message}`);
  } finally {
    if (settingsResetTakeoutBtnEl) {
      settingsResetTakeoutBtnEl.disabled = false;
      settingsResetTakeoutBtnEl.textContent = "重置";
    }
  }
}
function bindSettingsCopyPage() {
  if (!settingsCopyEnableRotationEl || settingsCopyBound) return;
  installSettingsTakeoutResetButtonStyle();
  bindSettingsPrinterCard();
  settingsCopyEnableRotationEl.addEventListener("change", () => {
    applySettingsCopyEnableState(settingsCopyEnableRotationEl.checked);
    scheduleSettingsCopyAutoSave();
  });
  settingsCopyTableCountEl == null ? void 0 : settingsCopyTableCountEl.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    target.value = sanitizeTableCount(target.value, "10");
    scheduleSettingsCopyAutoSave();
  });
  settingsCopyTablePrefixEl == null ? void 0 : settingsCopyTablePrefixEl.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    target.value = sanitizeSingleLetter(target.value, "A");
    scheduleSettingsCopyAutoSave();
  });
  settingsCopyTakeoutPrefixEl == null ? void 0 : settingsCopyTakeoutPrefixEl.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    target.value = sanitizeSingleLetter(target.value, "W");
    scheduleSettingsCopyAutoSave();
  });
  settingsCopyAsrLanguageEl == null ? void 0 : settingsCopyAsrLanguageEl.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    applyAsrLanguagePreset(target.value);
    const preset = ASR_LANGUAGE_PRESETS[normalizeAsrLanguagePresetKey(target.value)];
    log(`ASR language updated: ${(preset == null ? void 0 : preset.label) || target.value}`);
  });
  settingsCopyVoiceCaptureModeEl == null ? void 0 : settingsCopyVoiceCaptureModeEl.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    applyVoiceCaptureMode(target.value);
    log(`Voice capture mode updated: ${isHoldToTalkVoiceCaptureMode() ? "hold" : "toggle"}`);
  });
  settingsCopyAppDisplayLanguageEl == null ? void 0 : settingsCopyAppDisplayLanguageEl.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    applyAppDisplayLanguage(target.value);
    log(`App display language updated: ${normalizeAppDisplayLanguage(target.value)}`);
  });
  settingsClearMenuBtnEl == null ? void 0 : settingsClearMenuBtnEl.addEventListener("click", () => {
    void handleSettingsClearMenu();
  });
  settingsClearTablesBtnEl == null ? void 0 : settingsClearTablesBtnEl.addEventListener("click", () => {
    void handleSettingsClearTables();
  });
  settingsResetTakeoutBtnEl == null ? void 0 : settingsResetTakeoutBtnEl.addEventListener("click", () => {
    void handleSettingsResetTakeoutNumbering();
  });
  applySettingsCopyEnableState(settingsCopyEnableRotationEl.checked);
  restoreAsrLanguagePreset();
  restoreAppDisplayLanguage();
  restoreVoiceCaptureMode();
  settingsCopyBound = true;
}
function renderTableNumberingConfig(cfg) {
  var _a2, _b2, _c2, _d2;
  if (!cfg || typeof cfg !== "object") return;
  tableNumberingConfigCache = cfg;
  if (tnCyclicEnabledEl) tnCyclicEnabledEl.checked = Boolean(cfg.cyclic_enabled);
  if (tnDineinPrefixEl) tnDineinPrefixEl.value = String(cfg.dinein_prefix || "");
  if (tnDineinStartEl) tnDineinStartEl.value = String((_a2 = cfg.dinein_start) != null ? _a2 : 1);
  if (tnCyclicStartEl) tnCyclicStartEl.value = String((_b2 = cfg.cyclic_start) != null ? _b2 : 1);
  if (tnCyclicEndEl) tnCyclicEndEl.value = String((_c2 = cfg.cyclic_end) != null ? _c2 : 30);
  if (tnTakeoutEnabledEl) tnTakeoutEnabledEl.checked = Boolean(cfg.takeout_enabled);
  if (tnTakeoutPrefixEl) tnTakeoutPrefixEl.value = String(cfg.takeout_prefix || "W");
  if (tnTakeoutStartEl) tnTakeoutStartEl.value = String((_d2 = cfg.takeout_start) != null ? _d2 : 1);
  if (tnPreviewEl) tnPreviewEl.textContent = JSON.stringify(cfg, null, 2);
  renderSettingsCopyFromConfig(cfg);
}
async function refreshTableNumberingConfig() {
  if (!tnCyclicEnabledEl && !settingsCopyEnableRotationEl) return;
  try {
    const cfg = await api("/api/settings/table-numbering", "GET");
    renderTableNumberingConfig(cfg);
  } catch (error) {
    log(`Table numbering config load failed: ${error.message}`);
  }
}
async function saveTableNumberingConfig(options = {}) {
  if (!tnCyclicEnabledEl && !settingsCopyEnableRotationEl) return;
  const auto = Boolean(options.auto);
  if (settingsAutoSaveInFlight) {
    if (auto) {
      settingsAutoSaveQueued = true;
    }
    return;
  }
  let payload = null;
  if (tnCyclicEnabledEl) {
    payload = {
      cyclic_enabled: Boolean(tnCyclicEnabledEl == null ? void 0 : tnCyclicEnabledEl.checked),
      dinein_prefix: String((tnDineinPrefixEl == null ? void 0 : tnDineinPrefixEl.value) || "").trim().toUpperCase(),
      dinein_start: numberOr(1, tnDineinStartEl == null ? void 0 : tnDineinStartEl.value),
      cyclic_start: numberOr(1, tnCyclicStartEl == null ? void 0 : tnCyclicStartEl.value),
      cyclic_end: numberOr(30, tnCyclicEndEl == null ? void 0 : tnCyclicEndEl.value),
      takeout_enabled: Boolean(tnTakeoutEnabledEl == null ? void 0 : tnTakeoutEnabledEl.checked),
      takeout_prefix: String((tnTakeoutPrefixEl == null ? void 0 : tnTakeoutPrefixEl.value) || "W").trim().toUpperCase(),
      takeout_start: numberOr(1, tnTakeoutStartEl == null ? void 0 : tnTakeoutStartEl.value)
    };
  } else if (settingsCopyEnableRotationEl) {
    payload = collectSettingsCopyPayload();
  }
  if (!payload) return;
  settingsAutoSaveInFlight = true;
  try {
    const cfg = await api("/api/settings/table-numbering", "POST", payload);
    renderTableNumberingConfig(cfg);
    if (auto) {
      log(`Table numbering auto-saved: cyclic=${cfg.cyclic_enabled}, takeout=${cfg.takeout_enabled}`);
    } else {
      log(`Table numbering config updated: cyclic=${cfg.cyclic_enabled}, takeout=${cfg.takeout_enabled}`);
    }
  } catch (error) {
    log(`Table numbering config update failed: ${error.message}`);
  } finally {
    settingsAutoSaveInFlight = false;
    if (settingsAutoSaveQueued) {
      settingsAutoSaveQueued = false;
      scheduleSettingsCopyAutoSave(120);
    }
  }
}
function normalizeMenuCategory(value) {
  const text = String(value || "").trim();
  return text || "未分类";
}
function loadMenuDisplayI18nMap() {
  if (menuDisplayI18nMap && Object.keys(menuDisplayI18nMap).length) return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MENU_DISPLAY_I18N_STORAGE_KEY) || "{}");
    menuDisplayI18nMap = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    menuDisplayI18nMap = {};
  }
}
function persistMenuDisplayI18nMap() {
  try {
    window.localStorage.setItem(MENU_DISPLAY_I18N_STORAGE_KEY, JSON.stringify(menuDisplayI18nMap || {}));
  } catch {
  }
}
function getMenuSourceSignature(item) {
  const name = String((item == null ? void 0 : item.name) || "").trim();
  const aliases = Array.isArray(item == null ? void 0 : item.aliases) ? item.aliases.map((alias) => String(alias || "").trim()).filter(Boolean) : [];
  return `${name}\u0001${aliases.join("\u0002")}`;
}
function getMenuDisplayI18nEntry(item, langKey = appDisplayLanguageKey) {
  loadMenuDisplayI18nMap();
  const lang = normalizeAppDisplayLanguage(langKey);
  const menuItemId = String(Number((item == null ? void 0 : item.menu_item_id) || 0));
  if (!menuItemId || menuItemId === "0") return null;
  const langMap = menuDisplayI18nMap && typeof menuDisplayI18nMap === "object" ? menuDisplayI18nMap[lang] : null;
  const entry = langMap && typeof langMap === "object" ? langMap[menuItemId] : null;
  if (!entry || typeof entry !== "object") return null;
  if (String(entry.source_signature || "") !== getMenuSourceSignature(item)) return null;
  const displayName = String(entry.display_name || "").trim();
  return displayName ? entry : null;
}
function setMenuDisplayI18nEntry(item, langKey, displayName) {
  const lang = normalizeAppDisplayLanguage(langKey);
  const menuItemId = String(Number((item == null ? void 0 : item.menu_item_id) || 0));
  const sourceName = String((item == null ? void 0 : item.name) || "").trim();
  const safeDisplayName = String(displayName || "").trim();
  if (!menuItemId || menuItemId === "0" || !sourceName || !safeDisplayName) return;
  if (!menuDisplayI18nMap || typeof menuDisplayI18nMap !== "object") {
    menuDisplayI18nMap = {};
  }
  if (!menuDisplayI18nMap[lang] || typeof menuDisplayI18nMap[lang] !== "object") {
    menuDisplayI18nMap[lang] = {};
  }
  menuDisplayI18nMap[lang][menuItemId] = {
    source_name: sourceName,
    source_signature: getMenuSourceSignature(item),
    display_name: safeDisplayName
  };
}
function sourceNameAlreadyMatchesLanguage(item, langKey = appDisplayLanguageKey) {
  const name = String((item == null ? void 0 : item.name) || "").trim();
  const lang = normalizeAppDisplayLanguage(langKey);
  if (!name) return false;
  if (lang === "ug_cn") return containsUyghurScript(name) && !containsChineseScript(name);
  return containsChineseScript(name) && !containsUyghurScript(name);
}
function redrawMenuLanguageViews() {
  if (Array.isArray(menuItemsCache) && menuItemsCache.length) {
    renderMenuCategoryList(menuItemsCache);
    renderFilteredMenuItems();
  }
  if (Array.isArray(activeBoardTablesCache) && activeBoardTablesCache.length) {
    renderActiveBoardRows(activeBoardTablesCache);
  }
  if (selectedTablePanelCache && typeof selectedTablePanelCache === "object") {
    renderSelectedOrderBoard(selectedTablePanelCache);
    applyBoardSelectionState();
  }
  if (Array.isArray(historyOrdersCache) && historyOrdersCache.length) {
    renderHistoryOrders(historyOrdersCache);
  }
}
async function ensureMenuDisplayI18nMapForCurrentLanguage(items = menuItemsCache) {
  const lang = normalizeAppDisplayLanguage(appDisplayLanguageKey);
  const rows = Array.isArray(items) ? items.filter((item) => item && item.is_available !== false) : [];
  if (!rows.length) return;
  loadMenuDisplayI18nMap();
  let changed = false;
  const missing = [];
  for (const item of rows) {
    if (getMenuDisplayI18nEntry(item, lang)) continue;
    if (sourceNameAlreadyMatchesLanguage(item, lang)) {
      setMenuDisplayI18nEntry(item, lang, String(item.name || "").trim());
      changed = true;
      continue;
    }
    missing.push(Number(item.menu_item_id || 0));
  }
  if (changed) {
    persistMenuDisplayI18nMap();
  }
  const pendingIds = missing.filter((id) => Number.isFinite(id) && id > 0);
  if (!pendingIds.length) {
    if (changed) redrawMenuLanguageViews();
    return;
  }
  if (menuDisplayI18nInFlight) {
    try {
      await menuDisplayI18nInFlight;
    } catch {
    }
    return;
  }
  menuDisplayI18nInFlight = api("/api/menu/i18n-map", "POST", {
    target_language: lang,
    menu_item_ids: pendingIds
  }).then((data) => {
    const mappedItems = Array.isArray(data == null ? void 0 : data.items) ? data.items : [];
    for (const mapped of mappedItems) {
      const menuItemId = Number((mapped == null ? void 0 : mapped.menu_item_id) || 0);
      const matched = rows.find((item) => Number(item.menu_item_id || 0) === menuItemId);
      if (!matched) continue;
      setMenuDisplayI18nEntry(matched, lang, String((mapped == null ? void 0 : mapped.display_name) || "").trim());
    }
    persistMenuDisplayI18nMap();
    redrawMenuLanguageViews();
  }).catch((error) => {
    log(`Menu language map failed: ${String((error == null ? void 0 : error.message) || error)}`);
  }).finally(() => {
    menuDisplayI18nInFlight = null;
  });
  await menuDisplayI18nInFlight;
}
function normalizeDishLookupToken(value) {
  return String(value || "").trim().toLowerCase();
}
function containsUyghurScript(value) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(String(value || ""));
}
function containsChineseScript(value) {
  return /[\u3400-\u9FFF]/.test(String(value || ""));
}
function splitDishNameCandidates(value) {
  const source = String(value || "").trim();
  if (!source) return [];
  const tokens = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (text) => {
    const cleaned = String(text || "").trim();
    if (!cleaned) return;
    const key = normalizeDishLookupToken(cleaned);
    if (!key || seen.has(key)) return;
    seen.add(key);
    tokens.push(cleaned);
  };
  push(source);
  source.split(/[\/|,，;；、]/).forEach((part) => push(part));
  const bracketPattern = /[（(]([^（）()]+)[）)]/g;
  let bracketMatch = bracketPattern.exec(source);
  while (bracketMatch) {
    push(bracketMatch[1]);
    bracketMatch = bracketPattern.exec(source);
  }
  const chineseMatches = source.match(/[\u3400-\u9FFF][\u3400-\u9FFF·\s]*/g) || [];
  chineseMatches.forEach((part) => push(part));
  const uyghurMatches = source.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]*/g) || [];
  uyghurMatches.forEach((part) => push(part));
  return tokens;
}
function collectDishNameCandidates(primary, aliases = []) {
  const tokens = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (value) => {
    const parts = splitDishNameCandidates(value);
    parts.forEach((text) => {
      const key = normalizeDishLookupToken(text);
      if (!key || seen.has(key)) return;
      seen.add(key);
      tokens.push(text);
    });
  };
  push(primary);
  (Array.isArray(aliases) ? aliases : []).forEach((alias) => push(alias));
  return tokens;
}
function pickDishNameByLanguage(candidates) {
  const list = Array.isArray(candidates) ? candidates.filter((item) => String(item || "").trim()) : [];
  if (!list.length) return "";
  const lang = normalizeAppDisplayLanguage(appDisplayLanguageKey);
  if (lang === "ug_cn") {
    const uy = list.find((item) => containsUyghurScript(item));
    if (uy) return uy;
    const fallback = list.find((item) => !containsChineseScript(item));
    return fallback || list[0];
  }
  const zh = list.find((item) => containsChineseScript(item));
  if (zh) return zh;
  const fallback = list.find((item) => !containsUyghurScript(item));
  return fallback || list[0];
}
function resolveMenuItemDisplayName(item) {
  const name = String((item == null ? void 0 : item.name) || "").trim();
  const mapped = getMenuDisplayI18nEntry(item);
  if (mapped) return String(mapped.display_name || "").trim() || name || "-";
  return name || "-";
}
function resolveDishNameByLanguage(rawName, langKey = appDisplayLanguageKey) {
  const token = String(rawName || "").trim();
  if (!token) return "-";
  const key = normalizeDishLookupToken(token);
  if (!key || !Array.isArray(menuItemsCache) || !menuItemsCache.length) return token;
  const matched = menuItemsCache.find((item) => {
    const sourceName = normalizeDishLookupToken(item == null ? void 0 : item.name);
    if (sourceName && sourceName === key) return true;
    const mapped = getMenuDisplayI18nEntry(item);
    const mappedKey = normalizeDishLookupToken(mapped == null ? void 0 : mapped.display_name);
    if (mappedKey && mappedKey === key) return true;
    return false;
  });
  if (!matched) return token;
  if (normalizeAppDisplayLanguage(langKey) !== "ug_cn") {
    return String((matched == null ? void 0 : matched.name) || token).trim() || token;
  }
  return resolveMenuItemDisplayName(matched) || token;
}
function buildMenuAliasDisplayText(item, primaryName) {
  const sourceName = String((item == null ? void 0 : item.name) || "").trim();
  return normalizeDishLookupToken(sourceName) === normalizeDishLookupToken(primaryName) ? "" : sourceName;
}
function formatLocalizedMenuSummary(rawSummary) {
  const source = String(rawSummary || "").trim();
  if (!source) return "";
  return source.split(/\s*\|\s*/).map((segment) => {
    const part = String(segment || "").trim();
    if (!part) return "";
    const matched = /^(.*?)([x×]\d+)\s*$/i.exec(part);
    if (!matched) {
      return resolveDishNameByLanguage(part);
    }
    const dish = resolveDishNameByLanguage(String(matched[1] || "").trim());
    const qty = String(matched[2] || "").trim();
    return `${dish}${qty}`;
  }).filter(Boolean).join(" | ");
}
function cleanupMenuRowHighlights(nowMs = Date.now()) {
  for (const [key, expiresAt] of menuRowHighlightById.entries()) {
    if (!Number.isFinite(expiresAt) || expiresAt <= nowMs) {
      menuRowHighlightById.delete(key);
    }
  }
}
function queueMenuRowHighlightById(menuItemId, expiresAt) {
  const safeId = Number(menuItemId || 0);
  if (!Number.isFinite(safeId) || safeId <= 0) return;
  const previous = Number(menuRowHighlightById.get(safeId) || 0);
  if (!Number.isFinite(previous) || previous < expiresAt) {
    menuRowHighlightById.set(safeId, expiresAt);
  }
}
function queueMenuOperationHighlights(result) {
  cleanupMenuRowHighlights(Date.now());
  menuRowHighlightById.clear();
  if (!result || typeof result !== "object") return;
  if (result.applied !== true) return;
  const intent = String(result.intent || "").trim().toUpperCase();
  const expiresAt = Date.now() + MENU_ROW_HIGHLIGHT_MS;
  if (intent === "MENU_ADD") {
    const created = Array.isArray(result.created_items) ? result.created_items : [];
    created.forEach((item) => {
      queueMenuRowHighlightById(item == null ? void 0 : item.menu_item_id, expiresAt);
    });
    const updated = Array.isArray(result.updated_items) ? result.updated_items : [];
    updated.forEach((item) => {
      queueMenuRowHighlightById(item == null ? void 0 : item.menu_item_id, expiresAt);
    });
    return;
  }
  if (intent === "MENU_IMAGE_IMPORT") {
    const created = Array.isArray(result.created_items) ? result.created_items : [];
    created.forEach((item) => {
      queueMenuRowHighlightById(item == null ? void 0 : item.menu_item_id, expiresAt);
    });
    const updated = Array.isArray(result.updated_items) ? result.updated_items : [];
    updated.forEach((item) => {
      queueMenuRowHighlightById(item == null ? void 0 : item.menu_item_id, expiresAt);
    });
    return;
  }
  if (intent === "MENU_EDIT") {
    const updated = Array.isArray(result.updated_items) ? result.updated_items : [];
    updated.forEach((item) => {
      queueMenuRowHighlightById(item == null ? void 0 : item.menu_item_id, expiresAt);
    });
    return;
  }
}
function renderMenuCategoryList(items) {
  if (!menuCategoryBodyEl) return;
  const safeItems = Array.isArray(items) ? items : [];
  const categoryMap = /* @__PURE__ */ new Map();
  for (const item of safeItems) {
    const category = normalizeMenuCategory(item == null ? void 0 : item.category);
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  }
  const locale = normalizeAppDisplayLanguage(appDisplayLanguageKey) === "ug_cn" ? "ug" : "zh-Hans-CN";
  const categories = Array.from(categoryMap.keys()).sort((a, b) => a.localeCompare(b, locale));
  const hasSelected = categories.some((name) => name === selectedMenuCategory);
  if (!hasSelected) {
    selectedMenuCategory = "__ALL__";
  }
  const rows = [
    `<tr data-category="__ALL__" class="${selectedMenuCategory === "__ALL__" ? "is-selected" : ""}"><td>${t("menu_filter_all", "全部")}</td></tr>`,
    ...categories.map((name) => `<tr data-category="${name}" class="${selectedMenuCategory === name ? "is-selected" : ""}"><td>${name}</td></tr>`)
  ];
  menuCategoryBodyEl.innerHTML = rows.join("");
  menuCategoryBodyEl.querySelectorAll("tr[data-category]").forEach((row) => {
    row.addEventListener("click", () => {
      selectedMenuCategory = String(row.getAttribute("data-category") || "__ALL__");
      renderMenuCategoryList(menuItemsCache);
      renderFilteredMenuItems();
    });
  });
}
function renderFilteredMenuItems() {
  if (!dishTableBodyEl) return;
  cleanupMenuRowHighlights(Date.now());
  const selected = String(selectedMenuCategory || "__ALL__");
  const filtered = selected === "__ALL__" ? menuItemsCache : menuItemsCache.filter((item) => normalizeMenuCategory(item == null ? void 0 : item.category) === selected);
  if (!filtered.length) {
    dishTableBodyEl.innerHTML = `<tr><td colspan="5">${t("menu_no_items_in_category", "当前分类暂无菜品")}</td></tr>`;
  } else {
    dishTableBodyEl.innerHTML = filtered.map((item) => {
      const displayName = resolveMenuItemDisplayName(item);
      const aliasText = buildMenuAliasDisplayText(item, displayName);
      const category = normalizeMenuCategory(item.category);
      const unit = String(item.unit || "份");
      const menuItemId = Number(item.menu_item_id || 0);
      const encodedName = encodeURIComponent(String(item.name || ""));
      const isHighlighted = menuRowHighlightById.has(menuItemId);
      const rowClass = isHighlighted ? ` class="is-menu-updated"` : "";
      return `<tr data-menu-item-id="${menuItemId}" data-menu-name="${encodedName}"${rowClass}><td>${escapeHtml(
        displayName
      )}</td><td>${escapeHtml(category)}</td><td class="t-right">${(item.price_cents / 100).toFixed(2)}</td><td>${escapeHtml(
        unit
      )}</td><td>${escapeHtml(aliasText || "-")}</td></tr>`;
    }).join("");
    bindMenuRowLongPressDelete();
  }
  if (selected !== "__ALL__" && menuRowHighlightById.size > 0) {
    const hasVisibleHighlight = Boolean(dishTableBodyEl.querySelector("tr.is-menu-updated"));
    if (!hasVisibleHighlight) {
      selectedMenuCategory = "__ALL__";
      renderMenuCategoryList(menuItemsCache);
      renderFilteredMenuItems();
      return;
    }
  }
  if (menuFilterStatusEl) {
    const label = selected === "__ALL__" ? t("menu_filter_all", "全部") : selected;
    menuFilterStatusEl.textContent = `${t("menu_filter_prefix", "当前分类：")}${label}（${filtered.length}）`;
  }
}
function bindMenuRowLongPressDelete() {
  if (!dishTableBodyEl) return;
  const rows = dishTableBodyEl.querySelectorAll("tr[data-menu-item-id]");
  rows.forEach((row) => {
    const menuItemId = Number(row.getAttribute("data-menu-item-id") || "0");
    if (!Number.isFinite(menuItemId) || menuItemId <= 0) return;
    let menuName = "";
    try {
      menuName = decodeURIComponent(String(row.getAttribute("data-menu-name") || ""));
    } catch {
      menuName = String(row.getAttribute("data-menu-name") || "");
    }
    let pressTimer = null;
    let pressed = false;
    const clearPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      row.classList.remove("is-long-pressing");
    };
    const startPress = (event) => {
      if (event.type === "mousedown" && event.button !== 0) return;
      clearPress();
      pressed = false;
      row.classList.add("is-long-pressing");
      pressTimer = setTimeout(() => {
        pressed = true;
        row.classList.remove("is-long-pressing");
        void handleLongPressDeleteMenuItem(menuItemId, menuName);
      }, MENU_ROW_LONG_PRESS_MS);
    };
    row.addEventListener("mousedown", startPress);
    row.addEventListener("touchstart", startPress, { passive: true });
    row.addEventListener("mouseup", clearPress);
    row.addEventListener("mouseleave", clearPress);
    row.addEventListener("touchend", clearPress);
    row.addEventListener("touchcancel", clearPress);
    row.addEventListener("dragstart", clearPress);
    row.addEventListener("contextmenu", (event) => {
      if (pressed) {
        event.preventDefault();
      }
    });
  });
}
async function handleLongPressDeleteMenuItem(menuItemId, menuName) {
  const safeName = String(menuName || "").trim() || `#${menuItemId}`;
  const ok = window.confirm(`确认删除菜品：${safeName}？`);
  if (!ok) {
    log(`Menu long-press delete dismissed: ${safeName}`);
    return;
  }
  try {
    const data = await api("/api/menu/items/delete", "POST", {
      menu_item_id: Number(menuItemId),
      operator_id: getCurrentOperatorId(),
      device_id: "android-bbq-ui-menu",
      event_id: `menu-delete-${Date.now()}`
    });
    const deleted = (data == null ? void 0 : data.deleted) === true;
    log(deleted ? `Menu deleted: ${safeName}` : `Menu delete rejected: ${safeName}`);
    await refreshMenuItems();
  } catch (error) {
    log(`Menu delete failed: ${error.message}`);
  }
}
async function refreshMenuItems() {
  try {
    const data = await api("/api/menu/items", "GET");
    menuItemsCache = Array.isArray(data.items) ? data.items.filter((item) => item && item.is_available !== false) : [];
    await ensureMenuDisplayI18nMapForCurrentLanguage(menuItemsCache);
    renderMenuCategoryList(menuItemsCache);
    renderFilteredMenuItems();
    redrawMenuLanguageViews();
  } catch (error) {
    log(`Menu load failed: ${error.message}`);
  }
}
function renderAuditLogs(items) {
  if (!auditTableBodyEl) return;
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) {
    auditTableBodyEl.innerHTML = `<tr><td colspan="4">暂无审计日志</td></tr>`;
    return;
  }
  auditTableBodyEl.innerHTML = rows.map((row) => {
    var _a2;
    const detail = row.detail || {};
    const summary = detail.raw_transcript || ((_a2 = detail == null ? void 0 : detail.detail) == null ? void 0 : _a2.message) || "-";
    return `<tr><td>${row.created_at || "-"}</td><td>${row.operator || "-"}</td><td>${row.action || "-"}</td><td>${summary}</td></tr>`;
  }).join("");
}
async function refreshAuditLogs() {
  try {
    const tableNo = ((auditFilterTableEl == null ? void 0 : auditFilterTableEl.value) || "").trim().toUpperCase();
    const operator = ((auditFilterOperatorEl == null ? void 0 : auditFilterOperatorEl.value) || "").trim();
    const query = new URLSearchParams();
    if (tableNo) query.set("table_no", tableNo);
    if (operator) query.set("operator", operator);
    query.set("limit", "100");
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const data = await api(`/api/audit/voice${suffix}`, "GET");
    renderAuditLogs(data.items || []);
  } catch (error) {
    log(`Audit refresh failed: ${error.message}`);
  }
}
function formatDateToken(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getHistoryDateFilter() {
  if (!historyFilterDateEl) return "";
  let token = String(historyFilterDateEl.value || "").trim();
  if (!token) {
    token = formatDateToken(/* @__PURE__ */ new Date());
    historyFilterDateEl.value = token;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(token)) {
    throw new Error("日期格式无效，请选择有效日期");
  }
  return token;
}
function renderHistoryOrderItems(order) {
  if (!historyItemBodyEl || !historySelectedStatusEl) return;
  if (!order) {
    historySelectedStatusEl.textContent = "当前选中订单：--";
    historyItemBodyEl.innerHTML = `<tr><td colspan="5">请先在上方选择历史订单</td></tr>`;
    return;
  }
  const orderId = Number(order.order_id || 0);
  const tableNo = String(order.table_no || "-").toUpperCase();
  const billedAt = String(order.billed_at || "-");
  historySelectedStatusEl.textContent = `当前选中订单：#${orderId} | 桌号 ${tableNo} | 结单时间 ${billedAt}`;
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) {
    historyItemBodyEl.innerHTML = `<tr><td colspan="5">该订单暂无菜品明细</td></tr>`;
    return;
  }
  historyItemBodyEl.innerHTML = items.map((item) => {
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.unit_price_cents || 0);
    const lineTotal = Number(item.line_total_cents || unitPrice * qty);
    const createdAt = String(item.created_at || "-");
    const displayItemName = resolveDishNameByLanguage(item.item_name || "-");
    return `<tr><td>${escapeHtml(displayItemName)}</td><td class="t-center">${qty}</td><td class="t-right">${formatCny(
      unitPrice
    )}</td><td class="t-right">${formatCny(lineTotal)}</td><td>${createdAt}</td></tr>`;
  }).join("");
}
function renderHistoryOrders(items) {
  if (!historyOrderBodyEl) return;
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) {
    historyOrderBodyEl.innerHTML = `<tr><td colspan="5">暂无历史订单</td></tr>`;
    selectedHistoryOrderId = 0;
    renderHistoryOrderItems(null);
    return;
  }
  const hasSelected = rows.some((row) => Number(row.order_id || 0) === selectedHistoryOrderId);
  if (!hasSelected) {
    selectedHistoryOrderId = Number(rows[0].order_id || 0);
  }
  historyOrderBodyEl.innerHTML = rows.map((row) => {
    const orderId = Number(row.order_id || 0);
    const selectedClass = orderId === selectedHistoryOrderId ? "is-selected" : "";
    const billedAt = String(row.billed_at || "-");
    const tableNo = String(row.table_no || "-").toUpperCase();
    const menuSummary = formatLocalizedMenuSummary(String(row.menu_summary || "").trim()) || "-";
    const totalCents = Number(row.total_cents || 0);
    return `<tr data-order-id="${orderId}" class="${selectedClass}"><td>#${orderId}</td><td>${tableNo}</td><td>${billedAt}</td><td>${escapeHtml(menuSummary)}</td><td class="t-right">${formatCny(
      totalCents
    )}</td></tr>`;
  }).join("");
  const selectedOrder = rows.find((row) => Number(row.order_id || 0) === selectedHistoryOrderId) || null;
  renderHistoryOrderItems(selectedOrder);
}
function bindHistorySelection() {
  if (!historyOrderBodyEl || historySelectionBound) return;
  historyOrderBodyEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const row = target.closest("tr[data-order-id]");
    const orderId = Number((row == null ? void 0 : row.getAttribute("data-order-id")) || 0);
    if (!orderId) return;
    selectedHistoryOrderId = orderId;
    renderHistoryOrders(historyOrdersCache);
  });
  historySelectionBound = true;
}
async function refreshOrderHistory() {
  if (!historyOrderBodyEl) return;
  try {
    const dateToken = getHistoryDateFilter();
    const query = new URLSearchParams();
    if (dateToken) {
      query.set("start_at", `${dateToken} 00:00:00`);
      query.set("end_at", `${dateToken} 23:59:59`);
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const data = await api(`/api/orders/history${suffix}`, "GET");
    historyOrdersCache = Array.isArray(data.items) ? data.items : [];
    renderHistoryOrders(historyOrdersCache);
    bindHistorySelection();
  } catch (error) {
    historyOrdersCache = [];
    selectedHistoryOrderId = 0;
    renderHistoryOrders([]);
    log(`Order history refresh failed: ${error.message}`);
  }
}
function summarizeAgentResult(data) {
  const intent = String((data == null ? void 0 : data.intent) || "UNKNOWN");
  const applied = (data == null ? void 0 : data.applied) === true ? "applied" : "rejected";
  const tableNo = String((data == null ? void 0 : data.table_no) || "-");
  const tableStatus = String((data == null ? void 0 : data.table_status) || "UNCHANGED");
  const orderStatus = String((data == null ? void 0 : data.order_status) || "UNCHANGED");
  const message = String((data == null ? void 0 : data.message) || "").trim();
  return `${intent} ${applied} | table=${tableNo}/${tableStatus} | order=${orderStatus}${message ? ` | ${message}` : ""}`;
}
function syncSelectedTableFromCommandResult(data) {
  const tableNo = String((data == null ? void 0 : data.table_no) || "").trim().toUpperCase();
  if (!tableNo) return;
  setSelectedTableNo(tableNo);
}
function isAgentCheckoutFinalized(data) {
  var _a2;
  const perTableResults = Array.isArray(data == null ? void 0 : data.per_table_results) ? data.per_table_results : [];
  if (perTableResults.length) {
    return perTableResults.every((item) => isAgentCheckoutFinalized(item));
  }
  const tableStatus = String((data == null ? void 0 : data.table_status) || "").trim().toUpperCase();
  const orderStatus = String((data == null ? void 0 : data.order_status) || "").trim().toUpperCase();
  const totalRaw = (_a2 = data == null ? void 0 : data.bill_summary) == null ? void 0 : _a2.total_cents;
  const totalCents = Number(totalRaw);
  const orderId = Number(data == null ? void 0 : data.order_id);
  const hasTotal = totalRaw !== null && totalRaw !== void 0 && Number.isFinite(totalCents);
  const hasOrderId = Number.isFinite(orderId) && orderId > 0;
  return tableStatus === "IDLE" && orderStatus === "BILLED" && hasTotal && hasOrderId;
}
function isAgentCancelFinalized(data) {
  const perTableResults = Array.isArray(data == null ? void 0 : data.per_table_results) ? data.per_table_results : [];
  if (perTableResults.length) {
    return perTableResults.every((item) => isAgentCancelFinalized(item));
  }
  const tableStatus = String((data == null ? void 0 : data.table_status) || "").trim().toUpperCase();
  const orderStatus = String((data == null ? void 0 : data.order_status) || "").trim().toUpperCase();
  return tableStatus === "IDLE" && (orderStatus === "CANCELED" || orderStatus === "NONE");
}
function getCheckoutPreviewItems(tableNo, options = {}) {
  const explicitItems = Array.isArray(options.items) ? options.items : [];
  if (explicitItems.length) return explicitItems;
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  const panel = selectedTablePanelCache && typeof selectedTablePanelCache === "object" ? selectedTablePanelCache : null;
  if (safeTableNo && String((panel == null ? void 0 : panel.selected_table_no) || "").trim().toUpperCase() === safeTableNo && Array.isArray(panel == null ? void 0 : panel.items)) {
    return panel.items;
  }
  return [];
}
function renderCheckoutPreviewHtml(tableNo, summary = null, options = {}) {
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  const merged = summary && typeof summary === "object" ? summary : {};
  const confirmed = options.confirmed === true;
  const perTableResults = Array.isArray(options.perTableResults) ? options.perTableResults : [];
  const tableNos = parseTableNoList(safeTableNo);
  const isMultiTable = tableNos.length > 1 || perTableResults.length > 1;
  const title = confirmed ? t("checkout_confirm_done_title", "买单已完成") : (isMultiTable ? t("checkout_confirm_multi_title", "多桌买单确认") : t("checkout_confirm_title", "买单确认"));
  if (isMultiTable) {
    const rows = perTableResults.length ? perTableResults.map((item) => {
      const rowTableNo = String((item == null ? void 0 : item.table_no) || "").trim().toUpperCase();
      const rowSummary = item && typeof item.bill_summary === "object" ? item.bill_summary : {};
      return {
        tableNo: rowTableNo || "--",
        totalCents: Number((rowSummary == null ? void 0 : rowSummary.total_cents) || 0)
      };
    }) : tableNos.map((no) => ({ tableNo: no, totalCents: 0 }));
    const total = Number(merged.total_cents || rows.reduce((sum, row) => sum + row.totalCents, 0));
    const rowsHtml = rows.map((row) => `<div class="checkout-preview-row"><span>${escapeHtml(row.tableNo)}</span><strong>${escapeHtml(formatCny(row.totalCents))}</strong></div>`).join("");
    const footer = confirmed ? t("checkout_confirm_done", "状态：已完成买单，桌台已释放。") : t("checkout_confirm_release", "确认后将完成买单并释放桌台。");
    return `<div class="checkout-preview-stack"><div class="checkout-preview-title">${escapeHtml(title)}</div><div class="checkout-preview-list">${rowsHtml}</div><div class="checkout-preview-total"><span>${escapeHtml(t("checkout_confirm_total", "总计"))}</span><strong>${escapeHtml(formatCny(total))}</strong></div><div class="checkout-preview-footnote">${escapeHtml(footer)}</div></div>`;
  }
  const items = getCheckoutPreviewItems(safeTableNo, options);
  const subtotal = Number(merged.subtotal_cents || 0);
  const extraFee = Number(merged.extra_fee_total_cents || 0);
  const total = Number(merged.total_cents || subtotal + extraFee);
  const itemsHtml = items.length ? items.map((item) => {
    const qty = Number((item == null ? void 0 : item.qty) || 0);
    const lineTotal = Number((item == null ? void 0 : item.line_total_cents) || ((item == null ? void 0 : item.unit_price_cents) || 0) * qty || 0);
    return `<div class="checkout-preview-item"><span class="checkout-preview-item-name">${escapeHtml(resolveDishNameByLanguage((item == null ? void 0 : item.item_name) || "-"))}</span><span class="checkout-preview-item-qty">x${escapeHtml(String(Math.max(0, qty)))}</span><strong class="checkout-preview-item-total">${escapeHtml(formatCny(lineTotal))}</strong></div>`;
  }).join("") : `<div class="checkout-preview-empty">${escapeHtml(t("checkout_confirm_loading", "正在刷新账单..."))}</div>`;
  const footer = confirmed ? t("checkout_confirm_done", "状态：已完成买单，桌台已释放。") : t("checkout_confirm_release", "确认后将完成买单并释放桌台。");
  return `<div class="checkout-preview-stack"><div class="checkout-preview-title">${escapeHtml(title)}</div><div class="checkout-preview-meta"><span>${escapeHtml(t("checkout_confirm_table", "桌号"))}</span><strong>${escapeHtml(safeTableNo || "--")}</strong></div><div class="checkout-preview-section-title">${escapeHtml(t("checkout_confirm_item", "账单明细"))}</div><div class="checkout-preview-list">${itemsHtml}</div><div class="checkout-preview-summary"><div class="checkout-preview-row"><span>${escapeHtml(t("checkout_confirm_subtotal", "菜品小计"))}</span><strong>${escapeHtml(formatCny(subtotal))}</strong></div><div class="checkout-preview-row"><span>${escapeHtml(t("checkout_confirm_extra_fee", "附加费用"))}</span><strong>${escapeHtml(extraFee > 0 ? formatCny(extraFee) : t("checkout_confirm_no_extra_fee", "无"))}</strong></div><div class="checkout-preview-total"><span>${escapeHtml(t("checkout_confirm_total", "总计"))}</span><strong>${escapeHtml(formatCny(total))}</strong></div></div><div class="checkout-preview-footnote">${escapeHtml(footer)}</div></div>`;
}
function formatCancelPreviewText(tableNo, options = {}) {
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  const lines = [];
  lines.push("撤桌确认");
  lines.push(`桌号：${safeTableNo || "--"}`);
  if (options.confirmed) {
    lines.push("状态：已完成撤桌，桌台已释放。");
  } else {
    lines.push("确认后将撤销当前未结账单并释放桌台。");
  }
  return lines.join("\n");
}
function ensureViewportModalOverlay(modalEl) {
  if (!(modalEl instanceof HTMLElement)) return;
  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }
  modalEl.style.position = "fixed";
  modalEl.style.left = "0";
  modalEl.style.top = "0";
  modalEl.style.right = "0";
  modalEl.style.bottom = "0";
  modalEl.style.inset = "0";
  modalEl.style.zIndex = "2147483000";
  modalEl.style.display = "flex";
  modalEl.style.alignItems = "center";
  modalEl.style.justifyContent = "center";
  modalEl.style.overflowY = "auto";
  modalEl.style.padding = "18px";
  modalEl.style.background = "rgba(9, 16, 28, 0.58)";
  modalEl.style.backdropFilter = "blur(3px)";
  const cardEl = modalEl.querySelector(".modal-card");
  if (cardEl instanceof HTMLElement) {
    cardEl.style.position = "relative";
    cardEl.style.zIndex = "2147483001";
    cardEl.style.width = "min(640px, 95vw)";
    cardEl.style.maxHeight = "calc(100vh - 36px)";
    cardEl.style.margin = "auto";
    cardEl.style.overflow = "auto";
  }
}
function openCheckoutConfirmModal(tableNo, summary = null, options = {}) {
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  if (!safeTableNo) return;
  checkoutModalPreviewTableNo = safeTableNo;
  checkoutModalPreviewSummaryCache = summary && typeof summary === "object" ? summary : null;
  checkoutModalPreviewOptionsCache = options && typeof options === "object" ? { ...options } : null;
  ensureViewportModalOverlay(checkoutModalEl);
  if (checkoutTableInputEl) {
    checkoutTableInputEl.value = safeTableNo;
  }
  if (checkoutPreviewViewEl) {
    checkoutPreviewViewEl.innerHTML = renderCheckoutPreviewHtml(safeTableNo, summary, options);
  }
  checkoutModalEl == null ? void 0 : checkoutModalEl.classList.remove("hidden");
}
function openCancelConfirmModal(tableNo) {
  const safeTableNo = String(tableNo || "").trim().toUpperCase();
  if (!safeTableNo) return;
  ensureViewportModalOverlay(cancelModalEl);
  if (cancelTableInputEl) {
    cancelTableInputEl.value = safeTableNo;
  }
  if (cancelPreviewViewEl) {
    cancelPreviewViewEl.textContent = formatCancelPreviewText(safeTableNo);
  }
  cancelModalEl == null ? void 0 : cancelModalEl.classList.remove("hidden");
}
async function handleCheckoutConfirmBinding(data) {
  if (!data || typeof data !== "object") return;
  if (!(data == null ? void 0 : data.requires_confirmation)) return;
  if (String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase() !== "checkout_confirm") return;
  const tableNosFromData = Array.isArray(data == null ? void 0 : data.confirm_table_nos) ? data.confirm_table_nos : [];
  const tableNos = tableNosFromData.length ? tableNosFromData.map((t) => normalizeFallbackTableNo(t)).filter(Boolean) : parseTableNoList((data == null ? void 0 : data.table_no) || "");
  if (!tableNos.length) return;
  const joined = tableNos.join(",");
  pendingAgentCheckoutTableNo = joined;
  openCheckoutConfirmModal(joined, (data == null ? void 0 : data.bill_summary) || null, {
    perTableResults: Array.isArray(data == null ? void 0 : data.per_table_results) ? data.per_table_results : []
  });
  log(`table ${joined} checkout pending confirmation`);
}
async function handleCancelConfirmBinding(data) {
  if (!data || typeof data !== "object") return;
  if (!(data == null ? void 0 : data.requires_confirmation)) return;
  if (String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase() !== "cancel_confirm") return;
  const tableNosFromData = Array.isArray(data == null ? void 0 : data.confirm_table_nos) ? data.confirm_table_nos : [];
  const tableNos = tableNosFromData.length ? tableNosFromData.map((t) => normalizeFallbackTableNo(t)).filter(Boolean) : parseTableNoList((data == null ? void 0 : data.table_no) || "");
  if (!tableNos.length) return;
  const joined = tableNos.join(",");
  pendingAgentCancelTableNo = joined;
  openCancelConfirmModal(joined);
  log(`table ${joined} cancel pending confirmation`);
}
async function handleUndoConfirmBinding(data) {
  if (!data || typeof data !== "object") return;
  if (!(data == null ? void 0 : data.requires_confirmation)) return;
  if (String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase() !== "undo_confirm") return;
  const tableNo = String((data == null ? void 0 : data.table_no) || "").trim().toUpperCase();
  if (!tableNo) return;
  const ok = window.confirm(`Confirm undo/cancel bill for table ${tableNo}?`);
  if (!ok) {
    showActionFeedback(false, "取消账单失败");
    log(`table ${tableNo} undo confirmation dismissed`);
    return;
  }
  const confirmData = await api("/api/orders/undo-confirm", "POST", {
    table_no: tableNo,
    operator_id: getCurrentOperatorId(),
    device_id: MAIN_DEVICE_ID,
    event_id: `undo-${Date.now()}`
  });
  if (voiceCommandResultEl) {
    voiceCommandResultEl.textContent = JSON.stringify(confirmData, null, 2);
  }
  syncSelectedTableFromCommandResult(confirmData);
  await refreshBoard();
  await refreshStats();
  await refreshOrderHistory();
  await refreshAuditLogs();
  showAgentCommandFeedback(confirmData, "取消账单");
  log(`table ${tableNo} undo confirmed`);
}
async function maybePromptActionConfirmation(data) {
  if (!data || typeof data !== "object") return;
  const confirmHandler = String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase();
  const waitsForManualConfirm = (data == null ? void 0 : data.requires_confirmation) && (confirmHandler === "checkout_confirm" || confirmHandler === "cancel_confirm" || confirmHandler === "undo_confirm");
  if (waitsForManualConfirm) {
    await handleCheckoutConfirmBinding(data);
    await handleCancelConfirmBinding(data);
    await handleUndoConfirmBinding(data);
    return;
  }
  const perTableResults = Array.isArray(data == null ? void 0 : data.per_table_results) ? data.per_table_results : [];
  if (perTableResults.length) {
    for (const item of perTableResults) {
      await maybePromptActionConfirmation(item);
    }
  }
}
async function executeVoiceCommand(transcript) {
  const clean = String(transcript || "").trim();
  if (!clean) throw new Error("请输入语音命令文本");
  return runVoiceCommandSingleFlight("main-voice-text", async () => {
    var _a2;
    const payload = {
      event_id: `voice-${Date.now()}`,
      device_id: MAIN_DEVICE_ID,
      operator_id: getCurrentOperatorId(),
      transcript: clean
    };
    updateVoiceDebug({
      source: "main-voice-text",
      submitted_transcript: clean,
      note: `send /api/commands/voice event=${payload.event_id}`
    });
    const commandRequestStartedAt = Date.now();
    const data = await api("/api/commands/voice", "POST", payload, { attachClientTiming: true });
    const commandRequestMs = Date.now() - commandRequestStartedAt;
    const clientTiming = data && typeof data === "object" ? data.__client_timing : null;
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "__client_timing")) {
      delete data.__client_timing;
    }
    if (voiceCommandResultEl) {
      voiceCommandResultEl.textContent = JSON.stringify(data, null, 2);
    }
    syncSelectedTableFromCommandResult(data);
    const refreshTasks = [
      ["board", refreshBoard],
      ["stats", refreshStats],
      ["history", refreshOrderHistory],
      ["audit", refreshAuditLogs]
    ];
    const refreshResults = await Promise.allSettled(refreshTasks.map(([, fn]) => fn()));
    refreshResults.forEach((result, index) => {
      var _a3;
      if (result.status !== "rejected") return;
      const taskName = ((_a3 = refreshTasks[index]) == null ? void 0 : _a3[0]) || "unknown";
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason || "unknown error");
      log(`${taskName} refresh failed: ${reason}`);
    });
    await maybePromptActionConfirmation(data);
    const confirmHandler = String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase();
    const waitsForManualConfirm = (data == null ? void 0 : data.requires_confirmation) && (confirmHandler === "checkout_confirm" || confirmHandler === "cancel_confirm" || confirmHandler === "undo_confirm");
    if (!waitsForManualConfirm) {
      const handledFailure = dispatchAgentFailureFeedback(data, "语音指令");
      if (!handledFailure) {
        showAgentCommandFeedback(data, "语音指令");
      }
    }
    updateVoiceDebug({
      source: "main-voice-text",
      backend_transcript: String((data == null ? void 0 : data.transcript) || ""),
      note: `${summarizeAgentResult(data)} | request=${commandRequestMs}ms`
    });
    if (clientTiming && typeof clientTiming === "object") {
      log(
        `Agent(main) request split: inject=${Number(clientTiming.inject_ms || 0)}ms | fetch=${Number(clientTiming.fetch_ms || 0)}ms | total=${Number(clientTiming.total_ms || 0)}ms`
      );
    }
    const backendTotalMs = Number(((_a2 = data == null ? void 0 : data.timing) == null ? void 0 : _a2.backend_chain_total_ms) || 0);
    if (backendTotalMs > 0) {
      log(`Agent(main) backend total: ${backendTotalMs}ms`);
    }
    log(`Agent(main) request: ${commandRequestMs}ms`);
    log(`Agent(main): ${summarizeAgentResult(data)}`);
    return data;
  });
}
function normalizeFallbackTableNo(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  const upper = text.toUpperCase();
  if (/^[A-Z]\d+$/.test(upper)) return upper;
  if (/^\d+$/.test(upper)) return `A${upper}`;
  return upper;
}
function parseTableNoList(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];
  const normalized = text.replace(/\uFF0C/g, ",").replace(/\u3001/g, ",").replace(/\uFF1B/g, ",").replace(/;/g, ",").replace(/\|/g, ",").replace(/\s+/g, ",");
  const out = [];
  for (const token of normalized.split(",")) {
    const value = normalizeFallbackTableNo(token);
    if (!value) continue;
    if (!/^[A-Z]\d+$/.test(value)) continue;
    if (!out.includes(value)) out.push(value);
  }
  return out;
}
async function submitVoiceAudioLegacy(blob, transcriptHint) {
  return runVoiceCommandSingleFlight("single-button-audio-legacy", async () => {
    const payload = {
      event_id: `voice-audio-${Date.now()}`,
      device_id: MAIN_DEVICE_ID,
      operator_id: getCurrentOperatorId(),
      mime_type: blob.type || "audio/webm",
      audio_base64: await blobToBase64(blob),
      transcript: String(transcriptHint || "").trim()
    };
    updateVoiceDebug({
      source: "single-button-audio-legacy",
      submitted_transcript: payload.transcript,
      note: `send /api/commands/voice-audio event=${payload.event_id}`
    });
    const data = await api("/api/commands/voice-audio", "POST", payload);
    if (voiceCommandResultEl) {
      voiceCommandResultEl.textContent = JSON.stringify(data, null, 2);
    }
    syncSelectedTableFromCommandResult(data);
    if (voiceCommandTextEl && data.transcript) {
      voiceCommandTextEl.value = data.transcript;
    }
    await refreshBoard();
    await refreshStats();
    await refreshOrderHistory();
    await refreshAuditLogs();
    await maybePromptActionConfirmation(data);
    const confirmHandler = String((data == null ? void 0 : data.confirm_handler) || "").toLowerCase();
    const waitsForManualConfirm = (data == null ? void 0 : data.requires_confirmation) && (confirmHandler === "checkout_confirm" || confirmHandler === "cancel_confirm" || confirmHandler === "undo_confirm");
    if (!waitsForManualConfirm) {
      const handledFailure = dispatchAgentFailureFeedback(data, "语音指令");
      if (!handledFailure) {
        showAgentCommandFeedback(data, "语音指令");
      }
    }
    updateVoiceDebug({
      source: "single-button-audio-legacy",
      backend_transcript: String((data == null ? void 0 : data.transcript) || ""),
      note: summarizeAgentResult(data)
    });
    log(`Agent(audio-legacy): ${summarizeAgentResult(data)}`);
    return data;
  });
}
async function startSingleActionCapture() {
  var _a2;
  if (!((_a2 = navigator.mediaDevices) == null ? void 0 : _a2.getUserMedia)) {
    throw new Error("当前浏览器不支持麦克风采集");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("当前浏览器不支持 MediaRecorder");
  }
  const recognizer = ensureSingleActionRecognizer();
  singleActionFinalText = "";
  singleCaptureChunks = [];
  singleCaptureStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  singleCaptureRecorder = new MediaRecorder(singleCaptureStream);
  singleCaptureRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      singleCaptureChunks.push(event.data);
    }
  };
  singleCaptureRecorder.onstop = () => {
    if (singleCaptureStream) {
      singleCaptureStream.getTracks().forEach((track) => track.stop());
    }
  };
  singleCaptureRecorder.start();
  if (recognizer) {
    try {
      recognizer.start();
    } catch {
    }
  } else {
    log("Legacy Web Speech recognizer disabled/unavailable; using KLS ASR");
  }
  singleActionListening = true;
  updateVoiceDebug({
    source: "single-button-audio",
    interim_transcript: "",
    final_transcript: "",
    submitted_transcript: "",
    backend_transcript: "",
    note: "single button recording started"
  });
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionActiveLabel();
    singleActionBtnEl.disabled = false;
  }
  setSingleActionStatus("收音中...");
  log("Single button recording started");
}
async function stopSingleActionCaptureAndExecute() {
  if (!singleCaptureRecorder || singleCaptureRecorder.state !== "recording") {
    throw new Error("recording is not active");
  }
  singleActionListening = false;
  if (singleActionBtnEl) {
    singleActionBtnEl.disabled = true;
    singleActionBtnEl.textContent = "处理中...";
  }
  setSingleActionStatus("识别并执行中...");
  const stopped = new Promise((resolve) => {
    singleCaptureRecorder.addEventListener("stop", resolve, { once: true });
  });
  singleCaptureRecorder.stop();
  singleActionRecognizer == null ? void 0 : singleActionRecognizer.stop();
  await stopped;
  const blob = new Blob(singleCaptureChunks, { type: singleCaptureRecorder.mimeType || "audio/webm" });
  let transcriptHint = (singleActionFinalText || "").trim();
  if (!transcriptHint) {
    transcriptHint = ((voiceCommandTextEl == null ? void 0 : voiceCommandTextEl.value) || "").trim();
  }
  let transcript = "";
  try {
    updateVoiceDebug({
      source: "single-button-asr",
      submitted_transcript: transcriptHint,
      note: "send /api/asr/transcribe"
    });
    const asrResult = await klsAsrTranscribeBlob(blob, transcriptHint);
    transcript = String(asrResult.transcript || "").trim();
    updateVoiceDebug({
      source: "single-button-asr",
      backend_transcript: transcript,
      note: `ASR ok provider=${asrResult.provider || "unknown"}`
    });
    log(`ASR(single): provider=${asrResult.provider || "unknown"}`);
  } catch (asrError) {
    if (isLegacyWebSpeechDebugEnabled()) {
      log(`ASR failed, fallback legacy voice-audio: ${String((asrError == null ? void 0 : asrError.message) || asrError)}`);
      await submitVoiceAudioLegacy(blob, transcriptHint);
      if (singleActionBtnEl) {
        singleActionBtnEl.textContent = getSingleActionIdleLabel();
        singleActionBtnEl.disabled = false;
      }
      setSingleActionStatus("IDLE");
      return;
    }
    throw asrError;
  }
  if (!transcript) {
    throw new Error("ASR transcript is empty");
  }
  if (voiceCommandTextEl) {
    voiceCommandTextEl.value = transcript;
  }
  await executeVoiceCommand(transcript);
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionIdleLabel();
    singleActionBtnEl.disabled = false;
  }
  setSingleActionStatus("IDLE");
}
async function submitMenuVoiceTranscript(transcript) {
  const clean = String(transcript || "").trim();
  if (!clean) {
    throw new Error("未捕获到菜品语音文本。");
  }
  return runVoiceCommandSingleFlight("menu-single-entry", async () => {
    updateVoiceDebug({
      source: "menu-single-entry",
      submitted_transcript: clean,
      note: "send /api/menu/commands/voice"
    });
    const data = await api("/api/menu/commands/voice", "POST", {
      event_id: `menu-${Date.now()}`,
      device_id: "android-bbq-ui-menu",
      operator_id: getCurrentOperatorId(),
      transcript: clean
    });
    if (dishAgentResultEl) {
      dishAgentResultEl.textContent = JSON.stringify(data, null, 2);
    }
    queueMenuOperationHighlights(data);
    await refreshMenuItems();
    const handledFailure = dispatchAgentFailureFeedback(data, "菜品指令");
    if (!handledFailure) {
      showAgentCommandFeedback(data, "菜品指令");
    }
    updateVoiceDebug({
      source: "menu-single-entry",
      backend_transcript: clean,
      note: summarizeAgentResult(data)
    });
    log(`Agent(menu): ${summarizeAgentResult(data)}`);
    return data;
  });
}
async function parseMenuImageToJson(file) {
  if (!(file instanceof Blob)) {
    throw new Error("请先选择菜单图片");
  }
  const mimeType = String(file.type || "image/jpeg").trim() || "image/jpeg";
  const imageBase64 = await blobToBase64(file);
  updateVoiceDebug({
    source: "menu-image-ocr",
    note: "send /api/menu/ocr/parse"
  });
  const data = await api("/api/menu/ocr/parse", "POST", {
    event_id: `menu-img-${Date.now()}`,
    device_id: "android-bbq-ui-menu",
    operator_id: getCurrentOperatorId(),
    mime_type: mimeType,
    image_base64: imageBase64
  });
  if (menuOcrResultEl) {
    menuOcrResultEl.textContent = JSON.stringify(data, null, 2);
  }
  updateVoiceDebug({
    source: "menu-image-ocr",
    note: `image parsed records=${Number((data == null ? void 0 : data.recognized_count) || 0)}`
  });
  const handledFailure = dispatchAgentFailureFeedback(data, "菜单图片识别");
  if (!handledFailure) {
    showAgentCommandFeedback(data, "菜单图片识别");
  }
  return data;
}
async function importMenuImageToDb(file, parseData = null) {
  const parsedRecords = Array.isArray(parseData == null ? void 0 : parseData.records) ? parseData.records : [];
  if (parsedRecords.length > 0) {
    updateVoiceDebug({
      source: "menu-image-import",
      note: "send /api/menu/ocr/import (preparsed)"
    });
    const data2 = await api("/api/menu/ocr/import", "POST", {
      event_id: `menu-img-import-${Date.now()}`,
      device_id: "android-bbq-ui-menu",
      operator_id: getCurrentOperatorId(),
      ocr_model: String((parseData == null ? void 0 : parseData.ocr_model) || "").trim(),
      records: parsedRecords
    });
    if (menuOcrResultEl) {
      menuOcrResultEl.textContent = JSON.stringify(data2, null, 2);
    }
    queueMenuOperationHighlights(data2);
    await refreshMenuItems();
    updateVoiceDebug({
      source: "menu-image-import",
      note: `image import created=${Number((data2 == null ? void 0 : data2.created_count) || 0)} updated=${Number((data2 == null ? void 0 : data2.updated_count) || 0)} existing=${Number((data2 == null ? void 0 : data2.existing_count) || 0)} mode=preparsed`
    });
    const handledFailure2 = dispatchAgentFailureFeedback(data2, "菜单图片批量录入");
    if (!handledFailure2) {
      showAgentCommandFeedback(data2, "菜单图片批量录入");
    }
    return data2;
  }
  if (!(file instanceof Blob)) {
    throw new Error("请先选择菜单图片");
  }
  const mimeType = String(file.type || "image/jpeg").trim() || "image/jpeg";
  const imageBase64 = await blobToBase64(file);
  updateVoiceDebug({
    source: "menu-image-import",
    note: "send /api/menu/ocr/import"
  });
  const data = await api("/api/menu/ocr/import", "POST", {
    event_id: `menu-img-import-${Date.now()}`,
    device_id: "android-bbq-ui-menu",
    operator_id: getCurrentOperatorId(),
    mime_type: mimeType,
    image_base64: imageBase64
  });
  if (menuOcrResultEl) {
    menuOcrResultEl.textContent = JSON.stringify(data, null, 2);
  }
  queueMenuOperationHighlights(data);
  await refreshMenuItems();
  updateVoiceDebug({
    source: "menu-image-import",
    note: `image import created=${Number((data == null ? void 0 : data.created_count) || 0)} updated=${Number((data == null ? void 0 : data.updated_count) || 0)} existing=${Number((data == null ? void 0 : data.existing_count) || 0)}`
  });
  const handledFailure = dispatchAgentFailureFeedback(data, "菜单图片批量录入");
  if (!handledFailure) {
    showAgentCommandFeedback(data, "菜单图片批量录入");
  }
  return data;
}
function updateMenuOcrFileNameLabel(file, overrideName = "") {
  if (!menuOcrFileNameEl) return;
  const name = String(overrideName || (file == null ? void 0 : file.name) || "").trim();
  menuOcrFileNameEl.textContent = name ? `已选择：${name}` : "未选择图片";
}
function closeMenuOcrPreviewModal(options = {}) {
  if (options.clearPending) {
    menuOcrPendingFile = null;
    menuOcrPendingParseResult = null;
    menuOcrPendingFileName = "";
  }
  menuOcrPreviewModalEl == null ? void 0 : menuOcrPreviewModalEl.classList.add("hidden");
}
function openMenuOcrPreviewModal(parseData) {
  installMenuOcrPreviewModalStyle();
  ensureViewportModalOverlay(menuOcrPreviewModalEl);
  const records = Array.isArray(parseData == null ? void 0 : parseData.records) ? parseData.records : [];
  if (menuOcrPreviewSummaryEl) {
    menuOcrPreviewSummaryEl.textContent = `识别到 ${records.length} 条菜品，确认后将批量录入。`;
  }
  if (menuOcrPreviewListEl) {
    const lines = records.map((record, index) => {
      const dishName = String((record == null ? void 0 : record.dish_name) || "").trim() || `未命名菜品${index + 1}`;
      const category = String((record == null ? void 0 : record.category) || "").trim() || "未分类";
      const unit = String((record == null ? void 0 : record.unit) || "").trim() || "份";
      const aliases = Array.isArray(record == null ? void 0 : record.aliases) ? record.aliases.map((x) => String(x || "").trim()).filter(Boolean) : [];
      const priceCents = Number.parseInt(record == null ? void 0 : record.price_cents, 10);
      const safePriceCents = Number.isFinite(priceCents) && priceCents > 0 ? priceCents : 0;
      const aliasText = aliases.length ? `；别名：${aliases.join(" / ")}` : "";
      return `${index + 1}. ${dishName}｜${category}｜${formatCny(safePriceCents)}/${unit}${aliasText}`;
    });
    menuOcrPreviewListEl.textContent = lines.length ? lines.join("\n") : "暂无可录入菜品";
  }
  menuOcrPreviewModalEl == null ? void 0 : menuOcrPreviewModalEl.classList.remove("hidden");
}
async function startMenuSingleCapture() {
  var _a2;
  if (!((_a2 = navigator.mediaDevices) == null ? void 0 : _a2.getUserMedia)) {
    throw new Error("browser does not support microphone capture");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("browser does not support MediaRecorder");
  }
  const recognizer = ensureMenuSingleRecognizer();
  menuSingleFinalText = "";
  menuSingleCaptureChunks = [];
  menuSingleCaptureStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  menuSingleCaptureRecorder = new MediaRecorder(menuSingleCaptureStream);
  menuSingleCaptureRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      menuSingleCaptureChunks.push(event.data);
    }
  };
  menuSingleCaptureRecorder.onstop = () => {
    if (menuSingleCaptureStream) {
      menuSingleCaptureStream.getTracks().forEach((track) => track.stop());
    }
  };
  menuSingleCaptureRecorder.start();
  if (recognizer) {
    try {
      recognizer.start();
    } catch {
    }
  }
  menuSingleListening = true;
  if (menuSingleBtnEl) {
    menuSingleBtnEl.textContent = getMenuSingleActiveLabel();
  }
  if (menuVoicePreviewEl) {
    menuVoicePreviewEl.textContent = t("menu_ocr_recognizing", "识别中...");
  }
  setMenuSingleStatus(t("menu_recording", "录音中..."));
  log("Menu single recording started");
}
async function stopMenuSingleCaptureAndSubmit() {
  if (!menuSingleCaptureRecorder || menuSingleCaptureRecorder.state !== "recording") {
    throw new Error("menu recording is not active");
  }
  menuSingleListening = false;
  if (menuSingleBtnEl) {
    menuSingleBtnEl.disabled = true;
    menuSingleBtnEl.textContent = t("menu_processing", "处理中...");
  }
  setMenuSingleStatus(t("menu_recognize_and_importing", "识别并录入中..."));
  const stopped = new Promise((resolve) => {
    menuSingleCaptureRecorder.addEventListener("stop", resolve, { once: true });
  });
  menuSingleCaptureRecorder.stop();
  menuSingleRecognizer == null ? void 0 : menuSingleRecognizer.stop();
  await stopped;
  const blob = new Blob(menuSingleCaptureChunks, { type: menuSingleCaptureRecorder.mimeType || "audio/webm" });
  let transcriptHint = (menuSingleFinalText || "").trim();
  if (!transcriptHint && menuVoicePreviewEl) {
    const preview = String(menuVoicePreviewEl.textContent || "").trim();
    if (preview && preview !== t("menu_ocr_recognizing", "识别中...") && preview !== t("menu_voice_preview_empty", "暂无菜品语音文本")) {
      transcriptHint = preview;
    }
  }
  updateVoiceDebug({
    source: "menu-single-asr",
    submitted_transcript: transcriptHint,
    note: "send /api/asr/transcribe"
  });
  const asrResult = await klsAsrTranscribeBlob(blob, transcriptHint);
  const transcript = String(asrResult.transcript || "").trim();
  if (!transcript) {
    throw new Error("menu ASR transcript is empty");
  }
  if (menuVoicePreviewEl) {
    menuVoicePreviewEl.textContent = transcript;
  }
  updateVoiceDebug({
    source: "menu-single-asr",
    backend_transcript: transcript,
    note: `ASR ok provider=${asrResult.provider || "unknown"}`
  });
  await submitMenuVoiceTranscript(transcript);
  if (menuSingleBtnEl) {
    menuSingleBtnEl.disabled = false;
    menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
  }
  setMenuSingleStatus("IDLE");
}
async function tryStartSingleActionCaptureNativeFastPath() {
  if (!hasNativeVoiceBridge()) return false;
  await safeStopRealtimeAsrCapture(singleRealtimeAsrCapture);
  singleRealtimeAsrCapture = null;
  singleActionFinalText = "";
  if (voiceCommandTextEl) {
    voiceCommandTextEl.value = "";
  }
  await startNativeVoiceCapture("main");
  showAsrLiveOverlay("main", "");
  singleActionListening = true;
  updateVoiceDebug({
    source: "single-button-native-asr",
    interim_transcript: "",
    final_transcript: "",
    submitted_transcript: "",
    backend_transcript: "",
    note: "Single button native capture started (volume-key fast path)"
  });
  log("Single button native capture started (volume-key fast path)");
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionActiveLabel();
    singleActionBtnEl.disabled = false;
  }
  singleActionCaptureStartedAtMs = Date.now();
  setSingleActionStatus("语音识别中...");
  return true;
}
async function tryStartMenuSingleCaptureNativeFastPath() {
  if (!hasNativeVoiceBridge()) return false;
  await safeStopRealtimeAsrCapture(menuRealtimeAsrCapture);
  menuRealtimeAsrCapture = null;
  menuSingleFinalText = "";
  if (menuVoicePreviewEl) {
    menuVoicePreviewEl.textContent = t("menu_ocr_recognizing", "识别中...");
  }
  await startNativeVoiceCapture("menu");
  showAsrLiveOverlay("menu", "");
  menuSingleListening = true;
  menuSingleCaptureStartedAtMs = Date.now();
  log("Menu native capture started (volume-key fast path)");
  if (menuSingleBtnEl) {
    menuSingleBtnEl.textContent = getMenuSingleActiveLabel();
  }
  setMenuSingleStatus("录音中...");
  return true;
}
async function startSingleActionCaptureRealtime() {
  await safeStopRealtimeAsrCapture(singleRealtimeAsrCapture);
  singleRealtimeAsrCapture = null;
  singleActionFinalText = "";
  let hasRealtimeText = false;
  if (voiceCommandTextEl) {
    voiceCommandTextEl.value = "";
  }
  try {
    singleRealtimeAsrCapture = await createKlsRealtimeAsrCapture({
      source: "single-button",
      continuousUntilStopped: !isHoldToTalkVoiceCaptureMode(),
      onTranscript: (text, meta = {}) => {
        const clean = String(text || "").trim();
        hasRealtimeText = hasRealtimeText || clean.length > 0;
        if (voiceCommandTextEl) {
          voiceCommandTextEl.value = clean;
        }
        updateAsrLiveOverlayText(clean);
        updateVoiceDebug({
          source: "single-button-asr-realtime",
          interim_transcript: meta.final ? "" : clean,
          final_transcript: meta.final ? clean : voiceDebugState.final_transcript,
          note: meta.final ? "ASR realtime final" : "ASR realtime streaming"
        });
      },
      onAudioLevel: (level) => {
        if (hasRealtimeText) return;
        updateAsrLiveAudioLevel(level);
      }
    });
  } catch (realtimeError) {
    singleRealtimeAsrCapture = null;
    if (!hasNativeVoiceBridge()) {
      throw realtimeError;
    }
    log(`Realtime stream unavailable, fallback native: ${String((realtimeError == null ? void 0 : realtimeError.message) || realtimeError)}`);
    await startNativeVoiceCapture("main");
    showAsrLiveOverlay("main", "");
    singleActionListening = true;
    updateVoiceDebug({
      source: "single-button-native-asr",
      interim_transcript: "",
      final_transcript: "",
      submitted_transcript: "",
      backend_transcript: "",
      note: "Single button native capture started"
    });
    log("Single button native capture started");
    if (singleActionBtnEl) {
      singleActionBtnEl.textContent = getSingleActionActiveLabel();
      singleActionBtnEl.disabled = false;
    }
    singleActionCaptureStartedAtMs = Date.now();
    setSingleActionStatus("语音识别中...");
    return;
  }
  showAsrLiveOverlay("main", "");
  singleActionListening = true;
  updateVoiceDebug({
    source: "single-button-asr-realtime",
    interim_transcript: "",
    final_transcript: "",
    submitted_transcript: "",
    backend_transcript: "",
    note: "single button realtime ASR started"
  });
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionActiveLabel();
    singleActionBtnEl.disabled = false;
  }
  singleActionCaptureStartedAtMs = Date.now();
  setSingleActionStatus("语音实时识别中...");
  log("Single button realtime ASR started");
}
async function stopSingleActionCaptureAndExecuteRealtime() {
  const usingNativeBridge = !singleRealtimeAsrCapture && hasNativeVoiceBridge();
  if (!usingNativeBridge && !singleRealtimeAsrCapture) {
    hideAsrLiveOverlay();
    throw new Error("ASR stream is not active");
  }
  const pipelineStartedAt = Date.now();
  singleActionListening = false;
  singleActionFinalizePending = true;
  singleActionFinalizeCancelRequested = false;
  updateAsrLiveOverlaySecondPressHint();
  if (singleActionBtnEl) {
    singleActionBtnEl.disabled = true;
    singleActionBtnEl.textContent = "处理中...";
  }
  setSingleActionStatus("识别并执行中...");
  let transcript = "";
  try {
    const elapsedSinceCaptureStart = Date.now() - Number(singleActionCaptureStartedAtMs || 0);
    if (elapsedSinceCaptureStart > 0 && elapsedSinceCaptureStart < MIN_CAPTURE_MS_FOR_VOLUME) {
      await new Promise((resolve) => setTimeout(resolve, MIN_CAPTURE_MS_FOR_VOLUME - elapsedSinceCaptureStart));
    }
    if (usingNativeBridge) {
      const asrFinalizeStartedAt = Date.now();
      const nativeData = await stopNativeVoiceCapture();
      const nativeBytes = Number(nativeData == null ? void 0 : nativeData.bytes) || 0;
      if (nativeBytes < 2048) {
        throw new Error("按住说话时间太短，请稍后松开再试");
      }
      const wavBlob = pcm16Base64ToWavBlob(
        nativeData.pcm16_base64,
        Number(nativeData.sample_rate || 16e3),
        Number(nativeData.channels || 1)
      );
      const asrResult = await klsAsrTranscribeBlob(wavBlob, "");
      transcript = String(asrResult.transcript || "").trim();
      const asrFinalizeMs = Date.now() - asrFinalizeStartedAt;
      updateAsrLiveOverlayText(transcript);
      updateVoiceDebug({
        source: "single-button-native-asr",
        backend_transcript: transcript,
        note: `ASR(single/native) finalize: ${asrFinalizeMs}ms`
      });
      log(`ASR(single/native) finalize: ${asrFinalizeMs}ms`);
    } else {
      const asrFinalizeStartedAt = Date.now();
      transcript = String(await singleRealtimeAsrCapture.stopAndGetTranscript() || "").trim();
      const asrFinalizeMs = Date.now() - asrFinalizeStartedAt;
      updateAsrLiveOverlayText(transcript);
      updateVoiceDebug({
        source: "single-button-asr-realtime",
        backend_transcript: transcript,
        note: `ASR realtime final transcript ready (${asrFinalizeMs}ms)`
      });
      log(`ASR(single) finalize: ${asrFinalizeMs}ms`);
    }
    singleRealtimeAsrCapture = null;
  } catch (asrError) {
    singleRealtimeAsrCapture = null;
    if (singleActionFinalizeCancelRequested) {
      finishSingleActionFinalizeCancellation();
      return;
    }
    showAsrLiveOverlayError((asrError == null ? void 0 : asrError.message) || "ASR failed");
    throw asrError;
  } finally {
    singleActionCaptureStartedAtMs = 0;
  }
  if (singleActionFinalizeCancelRequested) {
    finishSingleActionFinalizeCancellation();
    return;
  }
  if (!transcript) {
    transcript = String((voiceCommandTextEl == null ? void 0 : voiceCommandTextEl.value) || "").trim();
  }
  if (singleActionFinalizeCancelRequested) {
    finishSingleActionFinalizeCancellation();
    return;
  }
  if (!transcript) {
    resetSingleActionFinalizeState();
    showAsrLiveOverlayError("ASR transcript is empty");
    throw new Error("ASR transcript is empty");
  }
  if (voiceCommandTextEl) {
    voiceCommandTextEl.value = transcript;
  }
  if (singleActionFinalizeCancelRequested) {
    finishSingleActionFinalizeCancellation();
    return;
  }
  resetSingleActionFinalizeState();
  await executeVoiceCommand(transcript);
  hideAsrLiveOverlay(2200);
  log(`Pipeline(single) total: ${Date.now() - pipelineStartedAt}ms`);
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionIdleLabel();
    singleActionBtnEl.disabled = false;
  }
  setSingleActionStatus("IDLE");
}
async function startMenuSingleCaptureRealtime() {
  await safeStopRealtimeAsrCapture(menuRealtimeAsrCapture);
  menuRealtimeAsrCapture = null;
  menuSingleFinalText = "";
  let hasRealtimeText = false;
  if (menuVoicePreviewEl) {
    menuVoicePreviewEl.textContent = t("menu_ocr_recognizing", "识别中...");
  }
  try {
    menuRealtimeAsrCapture = await createKlsRealtimeAsrCapture({
      source: "menu-single",
      continuousUntilStopped: !isHoldToTalkVoiceCaptureMode(),
      onTranscript: (text, meta = {}) => {
        const clean = String(text || "").trim();
        hasRealtimeText = hasRealtimeText || clean.length > 0;
        if (menuVoicePreviewEl) {
          menuVoicePreviewEl.textContent = clean || t("menu_voice_preview_empty", "暂无菜品语音文本");
        }
        updateAsrLiveOverlayText(clean);
        updateVoiceDebug({
          source: "menu-single-asr-realtime",
          interim_transcript: meta.final ? "" : clean,
          final_transcript: meta.final ? clean : voiceDebugState.final_transcript,
          note: meta.final ? "Menu ASR realtime final" : "Menu ASR realtime streaming"
        });
      },
      onAudioLevel: (level) => {
        if (hasRealtimeText) return;
        updateAsrLiveAudioLevel(level);
      }
    });
  } catch (realtimeError) {
    menuRealtimeAsrCapture = null;
    if (!hasNativeVoiceBridge()) {
      throw realtimeError;
    }
    log(`Menu realtime stream unavailable, fallback native: ${String((realtimeError == null ? void 0 : realtimeError.message) || realtimeError)}`);
    await startNativeVoiceCapture("menu");
    showAsrLiveOverlay("menu", "");
    menuSingleListening = true;
    menuSingleCaptureStartedAtMs = Date.now();
    log("Menu native capture started");
    if (menuSingleBtnEl) {
      menuSingleBtnEl.textContent = getMenuSingleActiveLabel();
    }
    setMenuSingleStatus(t("menu_recording", "录音中..."));
    return;
  }
  showAsrLiveOverlay("menu", "");
  menuSingleListening = true;
  menuSingleCaptureStartedAtMs = Date.now();
  if (menuSingleBtnEl) {
    menuSingleBtnEl.textContent = getMenuSingleActiveLabel();
  }
  setMenuSingleStatus(t("menu_recording", "录音中..."));
  log("Menu single realtime ASR started");
}
async function stopMenuSingleCaptureAndSubmitRealtime() {
  const usingNativeBridge = !menuRealtimeAsrCapture && hasNativeVoiceBridge();
  if (!usingNativeBridge && !menuRealtimeAsrCapture) {
    hideAsrLiveOverlay();
    throw new Error("menu ASR stream is not active");
  }
  menuSingleListening = false;
  menuSingleFinalizePending = true;
  menuSingleFinalizeCancelRequested = false;
  updateAsrLiveOverlaySecondPressHint();
  if (menuSingleBtnEl) {
    menuSingleBtnEl.disabled = true;
    menuSingleBtnEl.textContent = t("menu_processing", "处理中...");
  }
  setMenuSingleStatus(t("menu_recognize_and_importing", "识别并录入中..."));
  let transcript = "";
  try {
    const elapsedSinceCaptureStart = Date.now() - Number(menuSingleCaptureStartedAtMs || 0);
    if (elapsedSinceCaptureStart > 0 && elapsedSinceCaptureStart < MIN_CAPTURE_MS_FOR_VOLUME) {
      await new Promise((resolve) => setTimeout(resolve, MIN_CAPTURE_MS_FOR_VOLUME - elapsedSinceCaptureStart));
    }
    if (usingNativeBridge) {
      const nativeData = await stopNativeVoiceCapture();
      const nativeBytes = Number(nativeData == null ? void 0 : nativeData.bytes) || 0;
      if (nativeBytes < 2048) {
        throw new Error("按住说话时间太短，请稍后松开再试");
      }
      const wavBlob = pcm16Base64ToWavBlob(
        nativeData.pcm16_base64,
        Number(nativeData.sample_rate || 16e3),
        Number(nativeData.channels || 1)
      );
      const asrResult = await klsAsrTranscribeBlob(wavBlob, "");
      transcript = String(asrResult.transcript || "").trim();
    } else {
      transcript = String(await menuRealtimeAsrCapture.stopAndGetTranscript() || "").trim();
    }
    menuRealtimeAsrCapture = null;
    updateAsrLiveOverlayText(transcript);
  } catch (asrError) {
    menuRealtimeAsrCapture = null;
    if (menuSingleFinalizeCancelRequested) {
      finishMenuSingleFinalizeCancellation();
      return;
    }
    showAsrLiveOverlayError((asrError == null ? void 0 : asrError.message) || "Menu ASR failed");
    throw asrError;
  } finally {
    menuSingleCaptureStartedAtMs = 0;
  }
  if (menuSingleFinalizeCancelRequested) {
    finishMenuSingleFinalizeCancellation();
    return;
  }
  if (!transcript) {
    transcript = String((menuVoicePreviewEl == null ? void 0 : menuVoicePreviewEl.textContent) || "").trim();
    if (transcript === t("menu_ocr_recognizing", "识别中...") || transcript === t("menu_voice_preview_empty", "暂无菜品语音文本")) {
      transcript = "";
    }
  }
  if (menuSingleFinalizeCancelRequested) {
    finishMenuSingleFinalizeCancellation();
    return;
  }
  if (!transcript) {
    resetMenuSingleFinalizeState();
    showAsrLiveOverlayError("Menu ASR transcript is empty");
    throw new Error("menu ASR transcript is empty");
  }
  if (menuVoicePreviewEl) {
    menuVoicePreviewEl.textContent = transcript;
  }
  updateVoiceDebug({
    source: "menu-single-asr-realtime",
    backend_transcript: transcript,
    note: "Menu ASR realtime final transcript ready"
  });
  if (menuSingleFinalizeCancelRequested) {
    finishMenuSingleFinalizeCancellation();
    return;
  }
  resetMenuSingleFinalizeState();
  await submitMenuVoiceTranscript(transcript);
  hideAsrLiveOverlay(2200);
  if (menuSingleBtnEl) {
    menuSingleBtnEl.disabled = false;
    menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
  }
  setMenuSingleStatus("IDLE");
}
(_a = document.getElementById("nav-main")) == null ? void 0 : _a.addEventListener("click", async () => {
  if (!setView("main")) return;
  await refreshBoard();
});
(_b = document.getElementById("nav-menu")) == null ? void 0 : _b.addEventListener("click", async () => {
  if (!setView("menu")) return;
  await refreshMenuItems();
});
(_c = document.getElementById("nav-sales")) == null ? void 0 : _c.addEventListener("click", async () => {
  if (!setView("sales")) return;
  await refreshStatsConfig();
  await refreshStats();
  await refreshOrderHistory();
  await refreshAuditLogs();
});
statsIncludeOpenEl == null ? void 0 : statsIncludeOpenEl.addEventListener("change", updateStatsConfig);
(_d = document.getElementById("audit-refresh-btn")) == null ? void 0 : _d.addEventListener("click", refreshAuditLogs);
(_e = document.getElementById("history-query-btn")) == null ? void 0 : _e.addEventListener("click", refreshOrderHistory);
historyPrintSelectedBtnEl == null ? void 0 : historyPrintSelectedBtnEl.addEventListener("click", async () => {
  if (!(historyPrintSelectedBtnEl instanceof HTMLButtonElement)) return;
  historyPrintSelectedBtnEl.disabled = true;
  try {
    await handleHistoryOrderPrint();
    showActionFeedback(true, "历史订单打印成功");
    log(`history order ${selectedHistoryOrderId || "-"} printed`);
  } catch (error) {
    showActionFeedback(false, "历史订单打印失败");
    log(`history order print failed: ${String((error == null ? void 0 : error.message) || error)}`);
  } finally {
    historyPrintSelectedBtnEl.disabled = false;
  }
});
(_f = document.getElementById("waiter-start")) == null ? void 0 : _f.addEventListener("click", async () => {
  var _a2, _b2, _c2;
  try {
    const tableId = Number(((_a2 = document.getElementById("table-id")) == null ? void 0 : _a2.value) || "1");
    const operator = ((_c2 = (_b2 = document.getElementById("operator-id")) == null ? void 0 : _b2.value) == null ? void 0 : _c2.trim()) || "waiter-A";
    const data = await api("/api/sessions", "POST", { table_id: tableId, operator });
    sessionId = data.session_id;
    renderSession(data);
    if (readbackEl) {
      readbackEl.textContent = "Waiting for parse result";
    }
    if (billEl) {
      billEl.textContent = "暂无账单预览";
    }
    log(`已创建会话：桌 ${tableId}，店员 ${operator}`);
  } catch (error) {
    log(error.message);
  }
});
(_g = document.getElementById("customer-start")) == null ? void 0 : _g.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/start-speaking`, "POST", {});
    renderSession(data);
    log("顾客输入开始");
  } catch (error) {
    log(error.message);
  }
});
(_h = document.getElementById("customer-speak")) == null ? void 0 : _h.addEventListener("click", async () => {
  try {
    requireSession();
    const text = voiceInputEl.value.trim();
    if (!text) {
      throw new Error("Enter a text chunk first.");
    }
    const data = await api(`/api/sessions/${sessionId}/voice-chunks`, "POST", { text });
    voiceInputEl.value = "";
    dictationFinalText = "";
    renderSession(data);
    log(`Chunk appended: ${text}`);
  } catch (error) {
    log(error.message);
  }
});
(_i = document.getElementById("customer-done")) == null ? void 0 : _i.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/done`, "POST", {});
    renderSession(data);
    log("顾客输入结束");
  } catch (error) {
    log(error.message);
  }
});
(_j = document.getElementById("agent-readback")) == null ? void 0 : _j.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/parse`, "POST", {});
    renderSession(data);
    readbackEl.textContent = data.readback_text;
    log("解析完成");
  } catch (error) {
    log(error.message);
  }
});
(_k = document.getElementById("customer-confirm")) == null ? void 0 : _k.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/confirm`, "POST", {});
    renderSession(data);
    log(`Menu confirmed with order ${data.order_id}`);
  } catch (error) {
    log(error.message);
  }
});
(_l = document.getElementById("service-add")) == null ? void 0 : _l.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/items`, "POST", { menu_item_id: 3, qty: 1 });
    renderSession(data);
    log("Added rice x1");
  } catch (error) {
    log(error.message);
  }
});
(_m = document.getElementById("service-preview")) == null ? void 0 : _m.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/bill-preview`, "POST", {});
    billEl.textContent = JSON.stringify(data, null, 2);
    log("账单预览已刷新");
  } catch (error) {
    log(error.message);
  }
});
(_n = document.getElementById("service-sync")) == null ? void 0 : _n.addEventListener("click", async () => {
  try {
    requireSession();
    const data = await api(`/api/sessions/${sessionId}/bill-sync`, "POST", {
      target_device_id: "cashier-pad-1"
    });
    billEl.textContent = JSON.stringify(data, null, 2);
    log("Bill sync payload generated");
  } catch (error) {
    log(error.message);
  }
});
(_o = document.getElementById("checkout-open")) == null ? void 0 : _o.addEventListener("click", () => {
  var _a2;
  checkoutModalEl == null ? void 0 : checkoutModalEl.classList.remove("hidden");
  const raw = (((_a2 = document.getElementById("table-id")) == null ? void 0 : _a2.value) || "").trim();
  if (checkoutTableInputEl && raw) {
    checkoutTableInputEl.value = raw.toUpperCase().startsWith("A") ? raw.toUpperCase() : `A${raw}`;
  }
});
(_p = document.getElementById("checkout-cancel-btn")) == null ? void 0 : _p.addEventListener("click", () => {
  if (pendingAgentCheckoutTableNo) {
    showActionFeedback(false, "买单失败");
    pendingAgentCheckoutTableNo = "";
  }
  checkoutModalPreviewTableNo = "";
  checkoutModalPreviewSummaryCache = null;
  checkoutModalPreviewOptionsCache = null;
  checkoutModalEl == null ? void 0 : checkoutModalEl.classList.add("hidden");
});
(_q = document.getElementById("checkout-confirm-btn")) == null ? void 0 : _q.addEventListener("click", async () => {
  var _a2, _b2;
  const tableNos = parseTableNoList((checkoutTableInputEl == null ? void 0 : checkoutTableInputEl.value) || "");
  const isPendingAgentCheckout = Boolean(pendingAgentCheckoutTableNo);
  const autoPrintPayloads = await captureCheckoutAutoPrintPayloads(tableNos);
  try {
    if (!tableNos.length) throw new Error("table no is required");
    const operator = ((_b2 = (_a2 = document.getElementById("operator-id")) == null ? void 0 : _a2.value) == null ? void 0 : _b2.trim()) || "waiter-A";
    const results = [];
    for (let i = 0; i < tableNos.length; i += 1) {
      const tableNo = tableNos[i];
      const eventId = `checkout-${Date.now()}-${i + 1}`;
      const data2 = await api("/api/orders/checkout-confirm", "POST", {
        table_no: tableNo,
        operator_id: operator,
        event_id: eventId
      });
      results.push(data2);
    }
    const data = results[results.length - 1] || null;
    if (checkoutPreviewViewEl) {
      checkoutPreviewViewEl.innerHTML = renderCheckoutPreviewHtml(
        tableNos.join(","),
        results.length === 1 ? ((data == null ? void 0 : data.bill_summary) || data || null) : { total_cents: results.reduce((sum, item) => sum + Number((((item == null ? void 0 : item.bill_summary) || {}).total_cents) || 0), 0) },
        {
          confirmed: true,
          items: results.length === 1 ? getCheckoutPreviewItems(tableNos[0], checkoutModalPreviewOptionsCache || {}) : [],
          perTableResults: results
        }
      );
    }
    checkoutModalEl == null ? void 0 : checkoutModalEl.classList.add("hidden");
    if (voiceCommandResultEl) {
      voiceCommandResultEl.textContent = JSON.stringify(data, null, 2);
    }
    const refreshTasks = [
      ["board", refreshBoard],
      ["stats", refreshStats],
      ["history", refreshOrderHistory],
      ["audit", refreshAuditLogs],
      ["selected", refreshSelectedTablePanel]
    ];
    const refreshResults = await Promise.allSettled(refreshTasks.map(([, fn]) => fn()));
    refreshResults.forEach((result, index) => {
      var _a3;
      if (result.status !== "rejected") return;
      const taskName = ((_a3 = refreshTasks[index]) == null ? void 0 : _a3[0]) || "unknown";
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason || "unknown error");
      log(`${taskName} refresh failed: ${reason}`);
    });
    const finalized = results.length > 0 && results.every((item) => isAgentCheckoutFinalized(item));
    if (finalized) {
      await runCheckoutAutoPrint(autoPrintPayloads);
    }
    showActionFeedback(finalized, finalized ? "买单成功" : "买单失败");
    if (isPendingAgentCheckout) {
      pendingAgentCheckoutTableNo = "";
    }
    checkoutModalPreviewTableNo = "";
    checkoutModalPreviewSummaryCache = null;
    checkoutModalPreviewOptionsCache = null;
    log(`table ${tableNos.join(",")} checkout confirmed`);
  } catch (error) {
    if (isPendingAgentCheckout) {
      showActionFeedback(false, "买单失败");
      pendingAgentCheckoutTableNo = "";
    }
    checkoutModalPreviewTableNo = "";
    checkoutModalPreviewSummaryCache = null;
    checkoutModalPreviewOptionsCache = null;
    log(error.message);
  }
});
(_r = document.getElementById("cancel-dismiss-btn")) == null ? void 0 : _r.addEventListener("click", () => {
  if (pendingAgentCancelTableNo) {
    showActionFeedback(false, "撤桌失败");
    pendingAgentCancelTableNo = "";
  }
  cancelModalEl == null ? void 0 : cancelModalEl.classList.add("hidden");
});
(_s = document.getElementById("cancel-confirm-btn")) == null ? void 0 : _s.addEventListener("click", async () => {
  const tableNos = parseTableNoList((cancelTableInputEl == null ? void 0 : cancelTableInputEl.value) || "");
  const isPendingAgentCancel = Boolean(pendingAgentCancelTableNo);
  try {
    if (!tableNos.length) throw new Error("table no is required");
    const results = [];
    for (let i = 0; i < tableNos.length; i += 1) {
      const tableNo = tableNos[i];
      const confirmData2 = await api("/api/orders/cancel-confirm", "POST", {
        table_no: tableNo,
        operator_id: getCurrentOperatorId(),
        device_id: MAIN_DEVICE_ID,
        event_id: `cancel-${Date.now()}-${i + 1}`
      });
      results.push(confirmData2);
    }
    const confirmData = results[results.length - 1] || null;
    if (voiceCommandResultEl) {
      voiceCommandResultEl.textContent = results.length === 1 ? JSON.stringify(confirmData, null, 2) : JSON.stringify({ table_nos: tableNos, results }, null, 2);
    }
    if (cancelPreviewViewEl) {
      cancelPreviewViewEl.textContent = results.length === 1 ? formatCancelPreviewText(tableNos[0], { confirmed: true }) : tableNos.map((no) => formatCancelPreviewText(no, { confirmed: true })).join("\n\n");
    }
    cancelModalEl == null ? void 0 : cancelModalEl.classList.add("hidden");
    if (confirmData) {
      syncSelectedTableFromCommandResult(confirmData);
    }
    const refreshTasks = [
      ["board", refreshBoard],
      ["stats", refreshStats],
      ["history", refreshOrderHistory],
      ["audit", refreshAuditLogs]
    ];
    const refreshResults = await Promise.allSettled(refreshTasks.map(([, fn]) => fn()));
    refreshResults.forEach((result, index) => {
      var _a2;
      if (result.status !== "rejected") return;
      const taskName = ((_a2 = refreshTasks[index]) == null ? void 0 : _a2[0]) || "unknown";
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason || "unknown error");
      log(`${taskName} refresh failed: ${reason}`);
    });
    if (isPendingAgentCancel) {
      const finalized = results.length > 0 && results.every((item) => isAgentCancelFinalized(item));
      showActionFeedback(finalized, finalized ? "撤桌成功" : "撤桌失败");
      pendingAgentCancelTableNo = "";
    }
    log(`table ${tableNos.join(",")} cancel confirmed`);
  } catch (error) {
    if (isPendingAgentCancel) {
      showActionFeedback(false, "撤桌失败");
      pendingAgentCancelTableNo = "";
    }
    log(error.message);
  }
});
voiceCommandRunBtnEl == null ? void 0 : voiceCommandRunBtnEl.addEventListener("click", async () => {
  try {
    if (!canStartVoiceCommand("voice-command-run")) return;
    await executeVoiceCommand(((voiceCommandTextEl == null ? void 0 : voiceCommandTextEl.value) || "").trim());
  } catch (error) {
    log(error.message);
  }
});
function resetSingleActionFinalizeState() {
  singleActionFinalizePending = false;
  singleActionFinalizeCancelRequested = false;
  updateAsrLiveOverlaySecondPressHint();
}
function resetMenuSingleFinalizeState() {
  menuSingleFinalizePending = false;
  menuSingleFinalizeCancelRequested = false;
  updateAsrLiveOverlaySecondPressHint();
}
function finishSingleActionFinalizeCancellation() {
  resetSingleActionFinalizeState();
  singleActionListening = false;
  singleActionCaptureStartedAtMs = 0;
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionIdleLabel();
    singleActionBtnEl.disabled = false;
  }
  setSingleActionStatus(t("voice_cancelled", "已取消"));
  hideAsrLiveOverlay(180);
  if (!menuSingleListening && !menuSingleStartPending && !menuSingleFinalizePending && !voiceCommandInFlight) {
    setVoiceInteractionLock(false);
  }
  window.setTimeout(() => {
    if (!singleActionListening && !singleActionStartPending && !singleActionFinalizePending && !voiceCommandInFlight) {
      setSingleActionStatus("IDLE");
    }
  }, 360);
}
function finishMenuSingleFinalizeCancellation() {
  resetMenuSingleFinalizeState();
  menuSingleListening = false;
  menuSingleCaptureStartedAtMs = 0;
  if (menuSingleBtnEl) {
    menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
    menuSingleBtnEl.disabled = false;
  }
  setMenuSingleStatus(t("voice_cancelled", "已取消"));
  hideAsrLiveOverlay(180);
  if (!singleActionListening && !singleActionStartPending && !singleActionFinalizePending && !voiceCommandInFlight) {
    setVoiceInteractionLock(false);
  }
  window.setTimeout(() => {
    if (!menuSingleListening && !menuSingleStartPending && !menuSingleFinalizePending && !voiceCommandInFlight) {
      setMenuSingleStatus("IDLE");
    }
  }, 360);
}
async function cancelSingleActionCapture() {
  singleActionCancelRequested = false;
  singleActionStopRequested = false;
  if (singleActionStartPending && !singleActionListening) {
    singleActionCancelRequested = true;
    return;
  }
  if (!singleActionListening) return;
  const capture = singleRealtimeAsrCapture;
  singleRealtimeAsrCapture = null;
  if (capture) {
    await safeStopRealtimeAsrCapture(capture);
  } else {
    await cancelNativeVoiceCapture();
  }
  singleActionListening = false;
  singleActionCaptureStartedAtMs = 0;
  if (singleActionBtnEl) {
    singleActionBtnEl.textContent = getSingleActionIdleLabel();
    singleActionBtnEl.disabled = false;
  }
  setSingleActionStatus(t("voice_cancelled", "已取消"));
  hideAsrLiveOverlay(200);
  if (!menuSingleListening && !menuSingleStartPending && !voiceCommandInFlight) {
    setVoiceInteractionLock(false);
  }
  window.setTimeout(() => {
    if (!singleActionListening && !singleActionStartPending && !voiceCommandInFlight) {
      setSingleActionStatus("IDLE");
    }
  }, 360);
}
async function cancelMenuSingleCapture() {
  menuSingleCancelRequested = false;
  menuSingleStopRequested = false;
  if (menuSingleStartPending && !menuSingleListening) {
    menuSingleCancelRequested = true;
    return;
  }
  if (!menuSingleListening) return;
  const capture = menuRealtimeAsrCapture;
  menuRealtimeAsrCapture = null;
  if (capture) {
    await safeStopRealtimeAsrCapture(capture);
  } else {
    await cancelNativeVoiceCapture();
  }
  menuSingleListening = false;
  menuSingleCaptureStartedAtMs = 0;
  if (menuSingleBtnEl) {
    menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
    menuSingleBtnEl.disabled = false;
  }
  setMenuSingleStatus(t("voice_cancelled", "已取消"));
  hideAsrLiveOverlay(200);
  if (!singleActionListening && !singleActionStartPending && !voiceCommandInFlight) {
    setVoiceInteractionLock(false);
  }
  window.setTimeout(() => {
    if (!menuSingleListening && !menuSingleStartPending && !voiceCommandInFlight) {
      setMenuSingleStatus("IDLE");
    }
  }, 360);
}
async function handleSingleActionHoldPointerDown(event) {
  if (!isHoldToTalkVoiceCaptureMode()) return;
  if (singleActionHoldPointerId !== null) return;
  singleActionHoldPointerId = Number(event.pointerId);
  try {
    event.currentTarget == null ? void 0 : event.currentTarget.setPointerCapture(singleActionHoldPointerId);
  } catch {
  }
  event.preventDefault();
  await handleSingleActionCaptureStart();
}
async function handleSingleActionHoldPointerUp(event) {
  if (!isHoldToTalkVoiceCaptureMode()) return;
  const pointerId = Number(event.pointerId);
  if (singleActionHoldPointerId !== null && pointerId !== singleActionHoldPointerId) return;
  singleActionHoldPointerId = null;
  try {
    event.currentTarget == null ? void 0 : event.currentTarget.releasePointerCapture(pointerId);
  } catch {
  }
  event.preventDefault();
  if (singleActionStartPending && !singleActionListening) {
    singleActionStopRequested = true;
    return;
  }
  if (!singleActionListening) return;
  await handleSingleActionCaptureStop();
}
async function handleMenuSingleHoldPointerDown(event) {
  if (!isHoldToTalkVoiceCaptureMode()) return;
  if (menuSingleHoldPointerId !== null) return;
  menuSingleHoldPointerId = Number(event.pointerId);
  try {
    event.currentTarget == null ? void 0 : event.currentTarget.setPointerCapture(menuSingleHoldPointerId);
  } catch {
  }
  event.preventDefault();
  await handleMenuSingleCaptureStart();
}
async function handleMenuSingleHoldPointerUp(event) {
  if (!isHoldToTalkVoiceCaptureMode()) return;
  const pointerId = Number(event.pointerId);
  if (menuSingleHoldPointerId !== null && pointerId !== menuSingleHoldPointerId) return;
  menuSingleHoldPointerId = null;
  try {
    event.currentTarget == null ? void 0 : event.currentTarget.releasePointerCapture(pointerId);
  } catch {
  }
  event.preventDefault();
  if (menuSingleStartPending && !menuSingleListening) {
    menuSingleStopRequested = true;
    return;
  }
  if (!menuSingleListening) return;
  await handleMenuSingleCaptureStop();
}
singleActionBtnEl == null ? void 0 : singleActionBtnEl.addEventListener("pointerdown", (event) => {
  void handleSingleActionHoldPointerDown(event).catch((error) => {
    singleActionHoldPointerId = null;
    if (singleActionBtnEl) {
      singleActionBtnEl.textContent = getSingleActionIdleLabel();
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setSingleActionStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "single pointerdown failed");
  });
});
singleActionBtnEl == null ? void 0 : singleActionBtnEl.addEventListener("pointerup", (event) => {
  void handleSingleActionHoldPointerUp(event).catch((error) => {
    singleActionHoldPointerId = null;
    if (singleActionBtnEl) {
      singleActionBtnEl.textContent = getSingleActionIdleLabel();
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setSingleActionStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "single pointerup failed");
  });
});
singleActionBtnEl == null ? void 0 : singleActionBtnEl.addEventListener("pointercancel", (event) => {
  void handleSingleActionHoldPointerUp(event).catch((error) => {
    singleActionHoldPointerId = null;
    if (singleActionBtnEl) {
      singleActionBtnEl.textContent = getSingleActionIdleLabel();
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setSingleActionStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "single pointercancel failed");
  });
});
singleActionBtnEl == null ? void 0 : singleActionBtnEl.addEventListener("click", async () => {
  try {
    if (isHoldToTalkVoiceCaptureMode()) return;
    if (!singleActionListening) {
      await handleSingleActionCaptureStart();
      return;
    }
    await handleSingleActionCaptureStop();
  } catch (error) {
    if (singleActionBtnEl) {
      singleActionBtnEl.textContent = getSingleActionIdleLabel();
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setSingleActionStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log(error.message);
  }
});
menuSingleBtnEl == null ? void 0 : menuSingleBtnEl.addEventListener("pointerdown", (event) => {
  void handleMenuSingleHoldPointerDown(event).catch((error) => {
    menuSingleHoldPointerId = null;
    if (menuSingleBtnEl) {
      menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setMenuSingleStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "menu pointerdown failed");
  });
});
menuSingleBtnEl == null ? void 0 : menuSingleBtnEl.addEventListener("pointerup", (event) => {
  void handleMenuSingleHoldPointerUp(event).catch((error) => {
    menuSingleHoldPointerId = null;
    if (menuSingleBtnEl) {
      menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setMenuSingleStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "menu pointerup failed");
  });
});
menuSingleBtnEl == null ? void 0 : menuSingleBtnEl.addEventListener("pointercancel", (event) => {
  void handleMenuSingleHoldPointerUp(event).catch((error) => {
    menuSingleHoldPointerId = null;
    if (menuSingleBtnEl) {
      menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setMenuSingleStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log((error == null ? void 0 : error.message) || "menu pointercancel failed");
  });
});
menuSingleBtnEl == null ? void 0 : menuSingleBtnEl.addEventListener("click", async () => {
  try {
    if (isHoldToTalkVoiceCaptureMode()) return;
    if (!menuSingleListening) {
      await handleMenuSingleCaptureStart();
      return;
    }
    await handleMenuSingleCaptureStop();
  } catch (error) {
    if (menuSingleBtnEl) {
      menuSingleBtnEl.textContent = getMenuSingleIdleLabel();
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setMenuSingleStatus("IDLE");
    setVoiceInteractionLock(false);
    hideAsrLiveOverlay(300);
    log(error.message);
  }
});
async function handleSingleActionCaptureStart() {
  if (singleActionListening || singleActionStartPending) return;
  if (!canStartVoiceCommand("main-volume-start")) return;
  await interruptVoicePromptPlayback();
  setVoiceInteractionLock(true);
  singleActionStartPending = true;
  singleActionStopRequested = false;
  singleActionCancelRequested = false;
  try {
    await startSingleActionCaptureRealtime();
    if (singleActionCancelRequested && singleActionListening) {
      singleActionCancelRequested = false;
      void cancelSingleActionCapture();
      return;
    }
    if (singleActionStopRequested && singleActionListening) {
      singleActionStopRequested = false;
      void handleSingleActionCaptureStop();
    }
  } catch (error) {
    if (singleActionBtnEl) {
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setVoiceInteractionLock(false);
    setSingleActionStatus("IDLE");
    showAsrLiveOverlayError((error == null ? void 0 : error.message) || "Voice input start failed");
    log((error == null ? void 0 : error.message) || "single capture start failed");
  } finally {
    singleActionStartPending = false;
    syncVoiceCommandControlsBusy();
  }
}
async function handleSingleActionCaptureStop() {
  if (!singleActionListening) return;
  singleActionStopRequested = false;
  singleActionCancelRequested = false;
  try {
    await stopSingleActionCaptureAndExecuteRealtime();
  } catch (error) {
    if (singleActionBtnEl) {
      singleActionBtnEl.disabled = false;
    }
    singleActionListening = false;
    setSingleActionStatus("IDLE");
    showAsrLiveOverlayError((error == null ? void 0 : error.message) || "Voice input failed");
    log((error == null ? void 0 : error.message) || "single capture stop failed");
  } finally {
    if (!singleActionListening && !singleActionStartPending && !voiceCommandInFlight) {
      setVoiceInteractionLock(false);
    }
  }
}
async function handleMenuSingleCaptureStart() {
  if (menuSingleListening || menuSingleStartPending) return;
  if (!canStartVoiceCommand("menu-volume-start")) return;
  await interruptVoicePromptPlayback();
  setVoiceInteractionLock(true);
  menuSingleStartPending = true;
  menuSingleStopRequested = false;
  menuSingleCancelRequested = false;
  try {
    await startMenuSingleCaptureRealtime();
    if (menuSingleCancelRequested && menuSingleListening) {
      menuSingleCancelRequested = false;
      void cancelMenuSingleCapture();
      return;
    }
    if (menuSingleStopRequested && menuSingleListening) {
      menuSingleStopRequested = false;
      void handleMenuSingleCaptureStop();
    }
  } catch (error) {
    if (menuSingleBtnEl) {
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setVoiceInteractionLock(false);
    setMenuSingleStatus("IDLE");
    showAsrLiveOverlayError((error == null ? void 0 : error.message) || "Menu voice start failed");
    log((error == null ? void 0 : error.message) || "menu capture start failed");
  } finally {
    menuSingleStartPending = false;
    syncVoiceCommandControlsBusy();
  }
}
async function handleMenuSingleCaptureStop() {
  if (!menuSingleListening) return;
  menuSingleStopRequested = false;
  menuSingleCancelRequested = false;
  try {
    await stopMenuSingleCaptureAndSubmitRealtime();
  } catch (error) {
    if (menuSingleBtnEl) {
      menuSingleBtnEl.disabled = false;
    }
    menuSingleListening = false;
    setMenuSingleStatus("IDLE");
    showAsrLiveOverlayError((error == null ? void 0 : error.message) || "Menu voice input failed");
    log((error == null ? void 0 : error.message) || "menu capture stop failed");
  } finally {
    if (!menuSingleListening && !menuSingleStartPending && !voiceCommandInFlight) {
      setVoiceInteractionLock(false);
    }
  }
}
window.__bbqVolumeKeySpeech = triggerSpeechCaptureByCurrentView;
window.__bbqVolumeKeySpeechStart = triggerSpeechCaptureStartByCurrentView;
window.__bbqVolumeKeySpeechStop = triggerSpeechCaptureStopByCurrentView;
menuOcrNativeCaptureBtnEl == null ? void 0 : menuOcrNativeCaptureBtnEl.addEventListener("click", async () => {
  if (hasNativeMediaBridge()) {
    await runNativeMenuOcrCaptureFlow();
    return;
  }
  setMenuNativeOcrStatus("当前环境未接入原生拍照，已切换文件选择", true);
  menuOcrImageEl == null ? void 0 : menuOcrImageEl.click();
});
menuOcrCaptureBtnEl == null ? void 0 : menuOcrCaptureBtnEl.addEventListener("click", () => {
  menuOcrImageEl == null ? void 0 : menuOcrImageEl.click();
});
menuOcrImageEl == null ? void 0 : menuOcrImageEl.addEventListener("change", () => {
  var _a2;
  const file = ((_a2 = menuOcrImageEl == null ? void 0 : menuOcrImageEl.files) == null ? void 0 : _a2[0]) || null;
  menuOcrPendingFile = null;
  menuOcrPendingParseResult = null;
  menuOcrPendingFileName = String((file == null ? void 0 : file.name) || "").trim();
  updateMenuOcrFileNameLabel(file, menuOcrPendingFileName);
  setMenuNativeOcrStatus(
    menuOcrPendingFileName ? tFmt("menu_ocr_selected", "已选择：{name}", { name: menuOcrPendingFileName }) : t("menu_ocr_hint", "点击拍照后自动识别，并弹出预录入确认")
  );
});
menuOcrImportBtnEl == null ? void 0 : menuOcrImportBtnEl.addEventListener("click", async () => {
  var _a2;
  try {
    const file = ((_a2 = menuOcrImageEl == null ? void 0 : menuOcrImageEl.files) == null ? void 0 : _a2[0]) || null;
    menuOcrPendingFile = null;
    menuOcrPendingParseResult = null;
    menuOcrPendingFileName = String((file == null ? void 0 : file.name) || "").trim();
    if (menuOcrImportBtnEl) {
      menuOcrImportBtnEl.disabled = true;
      menuOcrImportBtnEl.textContent = t("menu_ocr_recognizing", "识别中...");
    }
    const parseData = await withUiTimeout(
      () => parseMenuImageToJson(file),
      MENU_OCR_TIMEOUT_MS,
      "菜单识别超时，请重试"
    );
    if (!(parseData == null ? void 0 : parseData.applied)) return;
    menuOcrPendingFile = file;
    menuOcrPendingParseResult = parseData;
    setMenuNativeOcrStatus(
      tFmt("menu_ocr_done", "识别完成：{count} 条", { count: Number((parseData == null ? void 0 : parseData.recognized_count) || 0) })
    );
    openMenuOcrPreviewModal(parseData);
  } catch (error) {
    log(error.message);
  } finally {
    if (menuOcrImportBtnEl) {
      menuOcrImportBtnEl.disabled = false;
      menuOcrImportBtnEl.textContent = t("menu_ocr_import_btn", "识别并预录入");
    }
  }
});
menuOcrPreviewCancelBtnEl == null ? void 0 : menuOcrPreviewCancelBtnEl.addEventListener("click", () => {
  closeMenuOcrPreviewModal({ clearPending: true });
});
menuOcrPreviewConfirmBtnEl == null ? void 0 : menuOcrPreviewConfirmBtnEl.addEventListener("click", async () => {
  const file = menuOcrPendingFile;
  const parseData = menuOcrPendingParseResult;
  try {
    if (!(file instanceof Blob) || !Array.isArray(parseData == null ? void 0 : parseData.records) || parseData.records.length <= 0) {
      throw new Error(t("menu_ocr_need_preview", "请先拍照并完成识别预览"));
    }
    if (menuOcrPreviewConfirmBtnEl) {
      menuOcrPreviewConfirmBtnEl.disabled = true;
      menuOcrPreviewConfirmBtnEl.textContent = t("menu_ocr_importing", "录入中...");
    }
    const importData = await importMenuImageToDb(file, parseData);
    if (importData == null ? void 0 : importData.applied) {
      closeMenuOcrPreviewModal({ clearPending: true });
      setMenuNativeOcrStatus(
        tFmt("menu_ocr_import_done", "录入完成：新增{created}，更新{updated}", {
          created: Number((importData == null ? void 0 : importData.created_count) || 0),
          updated: Number((importData == null ? void 0 : importData.updated_count) || 0)
        })
      );
    }
  } catch (error) {
    log(error.message);
    setMenuNativeOcrStatus((error == null ? void 0 : error.message) || t("menu_ocr_import_failed", "菜单图片录入失败"), true);
  } finally {
    if (menuOcrPreviewConfirmBtnEl) {
      menuOcrPreviewConfirmBtnEl.disabled = false;
      menuOcrPreviewConfirmBtnEl.textContent = t("menu_ocr_confirm_btn", "确认录入");
    }
  }
});
updateMenuOcrFileNameLabel(((_u = menuOcrImageEl == null ? void 0 : menuOcrImageEl.files) == null ? void 0 : _u[0]) || null, menuOcrPendingFileName);
setMenuNativeOcrStatus(t("menu_ocr_hint", "点击拍照后自动识别，并弹出预录入确认"));
(_v = document.getElementById("dictation-start")) == null ? void 0 : _v.addEventListener("click", () => {
  try {
    if (!isLegacyWebSpeechDebugEnabled()) {
      setDictationStatus("Legacy Web Speech disabled (debug mode only)");
      return;
    }
    requireSession();
    const recognizer = ensureSpeechRecognizer();
    if (!recognizer) {
      throw new Error("SpeechRecognition API is unavailable in this browser.");
    }
    if (dictationActive) return;
    dictationActive = true;
    dictationFinalText = voiceInputEl.value.trim();
    recognizer.start();
    setDictationStatus("听写中...");
    const startBtn = document.getElementById("dictation-start");
    const stopBtn = document.getElementById("dictation-stop");
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    log("听写已开始");
  } catch (error) {
    setDictationStatus("当前浏览器不可用听写");
    log(error.message);
  }
});
(_w = document.getElementById("dictation-stop")) == null ? void 0 : _w.addEventListener("click", () => {
  if (!speechRecognizer || !dictationActive) return;
  speechRecognizer.stop();
  setDictationStatus("正在结束听写...");
  log("听写正在停止");
});
(_x = document.getElementById("dish-dictation-start")) == null ? void 0 : _x.addEventListener("click", () => {
  var _a2, _b2;
  if (!isLegacyWebSpeechDebugEnabled()) {
    setDishDictationStatus("Legacy Web Speech disabled (debug mode only)");
    return;
  }
  const recognizer = ensureDishRecognizer();
  if (!recognizer) {
    setDishDictationStatus("Dish dictation is unavailable in this browser");
    return;
  }
  if (dishDictationActive) return;
  const draftEl = document.getElementById("dish-voice-draft");
  dishDraftFinalText = draftEl ? draftEl.value.trim() : "";
  dishDictationActive = true;
  recognizer.start();
  (_a2 = document.getElementById("dish-dictation-start")) == null ? void 0 : _a2.setAttribute("disabled", "true");
  (_b2 = document.getElementById("dish-dictation-stop")) == null ? void 0 : _b2.removeAttribute("disabled");
  setDishDictationStatus("菜品听写中...");
  log("Dish dictation started");
});
(_y = document.getElementById("dish-dictation-stop")) == null ? void 0 : _y.addEventListener("click", () => {
  if (!dishRecognizer || !dishDictationActive) return;
  dishRecognizer.stop();
  setDishDictationStatus("菜品听写结束中...");
  log("Dish dictation stopping");
});
(_z = document.getElementById("dish-add")) == null ? void 0 : _z.addEventListener("click", () => {
  (async () => {
    var _a2, _b2, _c2, _d2, _e2, _f2;
    try {
      const name = (((_a2 = document.getElementById("dish-name")) == null ? void 0 : _a2.value) || "").trim();
      const category = (((_b2 = document.getElementById("dish-category")) == null ? void 0 : _b2.value) || "").trim();
      const price = Number((((_c2 = document.getElementById("dish-price")) == null ? void 0 : _c2.value) || "").trim() || "0");
      const unit = (((_d2 = document.getElementById("dish-unit")) == null ? void 0 : _d2.value) || "份").trim();
      const aliasesText = (((_e2 = document.getElementById("dish-aliases")) == null ? void 0 : _e2.value) || "").trim();
      const aliases = aliasesText ? aliasesText.split(",").map((s) => s.trim()).filter(Boolean) : [];
      let transcript = (((_f2 = document.getElementById("dish-voice-draft")) == null ? void 0 : _f2.value) || "").trim();
      if (!transcript) {
        if (!name || !Number.isFinite(price) || price <= 0) {
          throw new Error("Dish name and positive price are required");
        }
        const aliasPart = aliases.length ? `, ${aliases.join(", ")}` : "";
        transcript = `新增菜品, ${name}, ${Math.round(price)}元一${unit || "份"}, ${category || "未分类"}${aliasPart}`;
      }
      updateVoiceDebug({
        source: "menu-agent-entry",
        submitted_transcript: transcript,
        note: "prepare /api/menu/commands/voice"
      });
      const data = await api("/api/menu/commands/voice", "POST", {
        event_id: `menu-${Date.now()}`,
        device_id: "android-bbq-ui-menu",
        operator_id: getCurrentOperatorId(),
        transcript
      });
      updateVoiceDebug({
        source: "menu-agent-entry",
        submitted_transcript: transcript,
        backend_transcript: "",
        note: `send /api/menu/commands/voice`
      });
      if (dishAgentResultEl) {
        dishAgentResultEl.textContent = JSON.stringify(data, null, 2);
      }
      queueMenuOperationHighlights(data);
      await refreshMenuItems();
      const handledFailure = dispatchAgentFailureFeedback(data, "菜品指令");
      if (!handledFailure) {
        showAgentCommandFeedback(data, "菜品指令");
      }
      for (const id of ["dish-name", "dish-category", "dish-price", "dish-unit", "dish-aliases", "dish-voice-draft"]) {
        const input = document.getElementById(id);
        if (input) input.value = "";
      }
      dishDraftFinalText = "";
      updateVoiceDebug({
        source: "menu-agent-entry",
        backend_transcript: transcript,
        note: summarizeAgentResult(data)
      });
      log(`Agent(menu): ${summarizeAgentResult(data)}`);
    } catch (error) {
      log(error.message);
    }
  })();
});
(_A = document.getElementById("dish-voice-draft")) == null ? void 0 : _A.addEventListener("blur", () => {
  (async () => {
    var _a2;
    try {
      const transcript = (((_a2 = document.getElementById("dish-voice-draft")) == null ? void 0 : _a2.value) || "").trim();
      if (!transcript) return;
      updateVoiceDebug({
        source: "menu-draft-parse",
        submitted_transcript: transcript,
        note: "send /api/menu/items/voice-draft"
      });
      const draft = await api("/api/menu/items/voice-draft", "POST", { transcript });
      if (document.getElementById("dish-name")) document.getElementById("dish-name").value = draft.dish_name || "";
      if (document.getElementById("dish-category")) document.getElementById("dish-category").value = draft.category || "";
      if (document.getElementById("dish-price")) document.getElementById("dish-price").value = ((draft.price_cents || 0) / 100).toString();
      if (document.getElementById("dish-unit")) document.getElementById("dish-unit").value = draft.unit || "份";
      if (document.getElementById("dish-aliases")) document.getElementById("dish-aliases").value = (draft.aliases || []).join(", ");
      updateVoiceDebug({
        source: "menu-draft-parse",
        note: `draft parsed dish=${draft.dish_name || "-"}`
      });
      log("Dish draft parsed from voice transcript");
    } catch {
    }
  })();
});
async function blobToBase64(blob) {
  let buffer;
  if (blob && typeof blob.arrayBuffer === "function") {
    buffer = await blob.arrayBuffer();
  } else {
    buffer = await new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("blob read failed"));
        reader.onload = () => resolve(reader.result || new ArrayBuffer(0));
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        reject(error);
      }
    });
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}
function base64ToBlob(base64Text, mimeType = "image/jpeg") {
  const normalized = String(base64Text || "").replace(/\s+/g, "");
  if (!normalized) {
    throw new Error("image base64 is empty");
  }
  const binary = window.atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: String(mimeType || "image/jpeg").trim() || "image/jpeg" });
}
(_B = document.getElementById("record-start")) == null ? void 0 : _B.addEventListener("click", async () => {
  try {
    requireSession();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorder.start();
    setRecordStatus("Recording...");
    const startBtn = document.getElementById("record-start");
    const stopBtn = document.getElementById("record-stop");
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    log("Recording started");
  } catch (error) {
    setRecordStatus("Recorder unavailable");
    log(error.message);
  }
});
(_C = document.getElementById("record-stop")) == null ? void 0 : _C.addEventListener("click", async () => {
  try {
    requireSession();
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
      throw new Error("Recorder is not active.");
    }
    setRecordStatus("Finalizing audio...");
    const stopped = new Promise((resolve) => {
      mediaRecorder.addEventListener("stop", resolve, { once: true });
    });
    mediaRecorder.stop();
    await stopped;
    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
    const audioBase64 = await blobToBase64(blob);
    const transcript = voiceInputEl.value.trim();
    const data = await api(`/api/sessions/${sessionId}/audio`, "POST", {
      audio_base64: audioBase64,
      mime_type: blob.type || "audio/webm",
      transcript
    });
    renderSession(data);
    setRecordStatus(`Uploaded audio: ${data.audio_id}`);
    log(`Audio uploaded (${data.audio_size_bytes} bytes)`);
  } catch (error) {
    setRecordStatus("Upload failed");
    log(error.message);
  } finally {
    const startBtn = document.getElementById("record-start");
    const stopBtn = document.getElementById("record-stop");
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }
});
const hasWebSpeech = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
const enableLegacyWebSpeech = isLegacyWebSpeechDebugEnabled();
if (!enableLegacyWebSpeech) {
  const dictationStartBtn = document.getElementById("dictation-start");
  const dictationStopBtn = document.getElementById("dictation-stop");
  if (dictationStartBtn) dictationStartBtn.disabled = true;
  if (dictationStopBtn) dictationStopBtn.disabled = true;
  (_D = document.getElementById("dish-dictation-start")) == null ? void 0 : _D.setAttribute("disabled", "true");
  (_E = document.getElementById("dish-dictation-stop")) == null ? void 0 : _E.setAttribute("disabled", "true");
  setDictationStatus("Legacy Web Speech disabled (debug mode only)");
  setDishDictationStatus("Legacy Web Speech disabled (debug mode only)");
} else if (!hasWebSpeech) {
  const dictationStartBtn = document.getElementById("dictation-start");
  const dictationStopBtn = document.getElementById("dictation-stop");
  if (dictationStartBtn) dictationStartBtn.disabled = true;
  if (dictationStopBtn) dictationStopBtn.disabled = true;
  (_F = document.getElementById("dish-dictation-start")) == null ? void 0 : _F.setAttribute("disabled", "true");
  (_G = document.getElementById("dish-dictation-stop")) == null ? void 0 : _G.setAttribute("disabled", "true");
  setDictationStatus("Dictation not supported in this browser");
  setDishDictationStatus("Dish dictation not supported in this browser");
}
setSingleActionStatus("IDLE");
setMenuSingleStatus("IDLE");
bindVoiceInteractionLockGuards();
syncVoiceCommandControlsBusy();
setSelectedTableNo(selectedTableNo);
bindSelectedOrderServeClicks();
bindSelectedSummaryActions();
bindSalesTrendToggle();
bindProfitPeriodToggle();
renderSalesTrendChart();
renderProfitPeriodMetric();
bindBoardSelectedColorPalette();
bindSettingsCopyPage();
installGlobalTextSelectionGuard();
bindTopActionIcons();
  bindProfilePage();
  ensureKlsSubscriptionWatchLoop();
  ensureKlsSessionForegroundWatchLoop();
  initializeKlsBaseInputs();
  restoreKlsAuthState();
applyDevInjectedAuthState();
bindKlsDebugPanel();
  bindAuthPage();
  initLucideIcons();
setView(isKlsLoggedIn() ? "main" : "auth", { force: true, silent: true });
syncRouteGuardUi();
logUiRuntimeSnapshot("boot");
window.setTimeout(() => logUiRuntimeSnapshot("delayed"), 900);
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    var _a2, _b2;
    updateVoiceDebug({
      last_button: btn.id || ((_a2 = btn.textContent) == null ? void 0 : _a2.trim()) || "(button)",
      note: `button click: ${btn.id || ((_b2 = btn.textContent) == null ? void 0 : _b2.trim()) || "(button)"}`
    });
  });
});
  log("页面已加载，请先创建后端会话。");
  updateVoiceDebug({ note: "ready" });
  if (isKlsLoggedIn()) {
    void (async () => {
      const stillValid = await handleKlsAppForeground({ forceRefresh: true, silentInvalidation: true });
      if (!stillValid || !isKlsLoggedIn()) return;
      await refreshBoard();
      await refreshMenuItems();
      await refreshStatsConfig();
      await refreshStats();
      await refreshOrderHistory();
    })();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !isKlsLoggedIn()) return;
    void handleKlsAppForeground({ forceRefresh: true, silentInvalidation: false });
  });
  window.addEventListener("focus", () => {
    if (!isKlsLoggedIn()) return;
    void handleKlsAppForeground({ forceRefresh: true, silentInvalidation: true });
  });
