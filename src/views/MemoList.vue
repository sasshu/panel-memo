<template>
  <div class="memo-list-root" :style="memoFontCssVar">
    <div
      class="memo-list-inner pt-4 px-4 pb-16"
      :class="{ 'd-flex flex-column': !memoList.length }"
    >
      <v-app-bar>
        <v-btn icon size="large" @click="handleCreateMemo()">
          <v-icon icon="mdi-plus"></v-icon>
          <v-tooltip
            text="新規メモを作成"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
        <v-text-field
          v-model="searchText"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          placeholder="検索..."
          hide-details
          clearable
          spellcheck="false"
        >
        </v-text-field>
        <v-btn icon size="large" @click="handleOpenConfig()">
          <v-icon icon="mdi-cog"></v-icon>
          <v-tooltip
            text="設定"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
      </v-app-bar>
      <div
        v-if="!memoList.length"
        class="flex-grow-1 d-flex align-center justify-center min-h-0"
      >
        <div class="bg-memolist-wrap">
          <v-img
            src="../assets/bg-memolist.svg"
            style="opacity: 0.5"
          ></v-img>
        </div>
      </div>
      <v-card
        v-for="(memo, index) in memoList"
        :key="index"
        :class="`mb-3 overflow-auto card`"
        :color="`${memo.color}-lighten-4`"
        elevation="4"
        max-height="200px"
        @dblclick="openMemo(index)"
        v-show="isSearchTarget(memo)"
      >
        <div class="float-right pt-2 pr-2 button-group">
          <v-btn
            icon
            density="comfortable"
            variant="text"
            size="small"
            class="top-button"
            @click="handleOpenDeleteConfirm(index)"
          >
            <v-icon icon="mdi-delete-outline"></v-icon>
            <v-tooltip
              text="削除"
              activator="parent"
              location="top"
              open-delay="1000"
            >
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            density="comfortable"
            variant="text"
            size="small"
            class="top-button"
            @click="handleCopyToClipboard(memo)"
            :disabled="memo.isCopied"
          >
            <v-icon icon>
              {{
                memo.isCopied
                  ? "mdi-check"
                  : "mdi-checkbox-multiple-blank-outline"
              }}
            </v-icon>
            <v-tooltip
              text="クリップボードにコピー"
              activator="parent"
              location="top"
              open-delay="1000"
            >
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            density="comfortable"
            variant="text"
            size="small"
            :class="{ 'top-button': !memo.isPinned }"
            @click="handleToggleMemoFix(memo)"
          >
            <v-icon>{{ memo.isPinned ? "mdi-pin" : "mdi-pin-outline" }}</v-icon>
            <v-tooltip
              :text="memo.isPinned ? '固定解除' : '固定'"
              activator="parent"
              location="top"
              open-delay="1000"
            >
            </v-tooltip>
          </v-btn>
        </div>
        <v-card-text class="text-pre-wrap text text-memo card-text">
          {{ memo.body }}
        </v-card-text>
      </v-card>

      <v-btn
        icon
        size="large"
        color="blue"
        class="plus-button"
        position="fixed"
        @click="handleCreateMemo()"
      >
        <v-icon icon="mdi-plus"></v-icon>
        <v-tooltip
          text="新規メモを作成"
          activator="parent"
          location="top"
          open-delay="1000"
        >
        </v-tooltip>
      </v-btn>
    </div>
  </div>

  <!-- 設定画面 -->
  <v-dialog v-model="isConfigDialogOpened" fullscreen>
    <v-card
      class="config-dialog-card d-flex flex-column"
      :style="draftConfigCardStyle"
    >
      <v-toolbar density="comfortable" elevation="1">
        <v-toolbar-title>設定</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          density="comfortable"
          variant="text"
          size="large"
          @click="isConfigDialogOpened = false"
        >
          <v-icon icon="mdi-close"></v-icon>
          <v-tooltip
            text="閉じる"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
      </v-toolbar>
      <v-card-text class="flex-grow-1 overflow-auto">
        <div class="text-subtitle-1 font-weight-bold mb-2">メモの同期</div>
        <p class="text text-body-2 text-medium-emphasis mb-3">
          同期すると同じGoogleアカウントを使用し、複数の端末で同じメモを閲覧・編集できます。<br>
          同期しない場合はこのブラウザ・この端末のみでメモが保存されます。<br>
          同期しない方がより多くのメモを保存できます。
        </p>
        <div class="config-toggle-wrap mb-8">
          <v-btn-toggle
            v-model="draftStorageMode"
            mandatory
            divided
            variant="outlined"
            color="primary"
            class="config-toggle"
          >
            <v-btn value="local" class="text-none flex-grow-1">同期しない</v-btn>
            <v-btn value="sync" class="text-none flex-grow-1">同期する</v-btn>
          </v-btn-toggle>
        </div>

        <div class="text-subtitle-1 font-weight-bold mb-2">メモの文字サイズ</div>
        <div class="config-toggle-wrap">
          <v-btn-toggle
            v-model="draftFontSizeStep"
            mandatory
            divided
            variant="outlined"
            color="primary"
            class="config-toggle"
          >
            <v-btn :value="0" class="text-none flex-grow-1">小</v-btn>
            <v-btn :value="1" class="text-none flex-grow-1">中</v-btn>
            <v-btn :value="2" class="text-none flex-grow-1">大</v-btn>
          </v-btn-toggle>
        </div>
        <p class="text text-draft mt-2">
          文字サイズはこのくらいです。<br>
          The font size is about this big.
        </p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="primary"
          @click="isConfigDialogOpened = false"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSaveConfig"
        >
          保存する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- メモの削除確認Dialog -->
  <v-dialog v-model="isDeleteDialogOpened" width="90%">
    <v-card
      v-if="memoList[deleteIndex] != null"
      class="rounded-lg"
    >
      <v-card-title class="text-pre-wrap text text-subtitle-1 font-weight-bold">
        以下のメモを削除しますか？
      </v-card-title>
      <v-card-text
        class="text-pre-wrap text text-body-2 pt-0 pb-3 overflow-hidden deleting-text"
      >
        {{ memoList[deleteIndex].body }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="キャンセル"
          color="primary"
          variant="text"
          @click="isDeleteDialogOpened = false"
        >
        </v-btn>
        <v-btn
          text="削除"
          color="red"
          variant="text"
          @click="handleDeleteMemo()"
        >
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- メモ編集画面 -->
  <v-dialog
    v-model="isEditDialogOpened"
    fullscreen
    @update:model-value="handleCloseMemo()"
  >
    <v-card
      v-if="openedMemo != null"
      :color="`${openedMemo.color}-lighten-4`"
      v-model="openedMemo"
      :style="memoFontCssVar"
    >
      <v-toolbar
        density="comfortable"
        class="editing-toolbar"
        elevation="1"
        :color="`${openedMemo.color}-lighten-5`"
      >
        <v-spacer></v-spacer>
        <v-btn
          icon
          density="comfortable"
          variant="text"
          size="large"
          id="palette-activator"
        >
          <v-icon icon="mdi-palette-outline"></v-icon>
          <v-tooltip
            text="色を変更"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
        <v-menu activator="#palette-activator" width="100%">
          <v-list class="d-flex py-0">
            <v-list-item
              v-for="color in SELECTABLE_COLORS"
              :key="color"
              :value="color"
              :class="`bg-${color}-lighten-4 flex-grow-1`"
              @click="handleChangeMemoColor(editIndex, color)"
            >
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          icon="mdi-delete-outline"
          density="comfortable"
          variant="text"
          size="large"
          @click="handleOpenDeleteConfirm(editIndex)"
        >
          <v-icon icon="mdi-delete-outline"></v-icon>
          <v-tooltip
            text="削除"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          density="comfortable"
          variant="text"
          size="large"
          @click="handleCopyToClipboard(openedMemo)"
          :disabled="openedMemo.isCopied"
        >
          <v-icon icon>
            {{
              openedMemo.isCopied
                ? "mdi-check"
                : "mdi-checkbox-multiple-blank-outline"
            }}
          </v-icon>
          <v-tooltip
            text="クリップボードにコピー"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          density="comfortable"
          variant="text"
          size="large"
          @click="handleToggleMemoFix(openedMemo)"
        >
          <v-icon>{{
            openedMemo.isPinned ? "mdi-pin" : "mdi-pin-outline"
          }}</v-icon>
          <v-tooltip
            :text="openedMemo.isPinned ? '固定解除' : '固定'"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
        <v-btn
          icon="mdi-close"
          density="comfortable"
          variant="text"
          size="large"
          @click="handleCloseMemo()"
        >
          <v-icon icon="mdi-close"></v-icon>
          <v-tooltip
            text="閉じる"
            activator="parent"
            location="bottom"
            open-delay="1000"
          >
          </v-tooltip>
        </v-btn>
      </v-toolbar>
      <v-container class="pa-0">
        <v-textarea
          placeholder="メモを入力..."
          variant="underlined"
          hide-details="auto"
          auto-grow
          rows="1"
          :bg-color="`${openedMemo.color}-lighten-4`"
          class="px-3 text memo-edit-textarea "
          v-model="openedMemo.body"
          spellcheck="false"
          @update:model-value="handleChangeMemoBody(openedMemo)"
        >
          {{ openedMemo.body }}</v-textarea
        >
      </v-container>
    </v-card>
  </v-dialog>

  <v-snackbar
    :model-value="hasStorageError"
    :timeout="2000"
    location="top"
    color="error"
    variant="flat"
    text="メモの保存に失敗しました。設定で「同期しない」を選ぶか、メモを減らしてください。"
    class="text"
    @update:model-value="onStorageErrorSnackbarModel"
  >
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const KEY_CONFIG = "config"
const KEY_MEMO = "memos"
const SELECTABLE_COLORS = ["yellow", "green", "blue", "pink", "blue-grey", "deep-orange"];

// メモの保存先: local = chrome.storage.local, sync = chrome.storage.sync
const storageMode = ref("sync");
// メモ本文の文字サイズ 0=小, 1=中, 2=大
const fontSizeStep = ref(1);

const draftStorageMode = ref("sync");
const draftFontSizeStep = ref(1);

const MEMO_FONT_SIZES = ["0.8125rem", "0.875rem", "1.0625rem"];

const memoFontCssVar = computed(() => ({
  "--memo-font-size": MEMO_FONT_SIZES[fontSizeStep.value]
}));

const draftConfigCardStyle = computed(() => ({
  "--memo-font-size-draft": MEMO_FONT_SIZES[draftFontSizeStep.value]
}));

// 全てのメモ
const memoList = ref([]);

const searchText = ref("");

const insertIndex = ref(0);
const deleteIndex = ref();
const editIndex = ref();

const isDeleteDialogOpened = ref(false);
const isEditDialogOpened = ref(false);
const isConfigDialogOpened = ref(false);
const isMemoUpdated = ref(false);

const hasStorageError = ref(false);

onMounted(async () => {
  await loadConfig();
  await loadMemos();
});

// Storageから設定情報を取得
const loadConfig = async () => {
  const data = await chrome.storage?.sync.get(KEY_CONFIG);
  if (data?.[KEY_CONFIG]) {
    const config = JSON.parse(data?.[KEY_CONFIG]);
    storageMode.value = config.storageMode;
    fontSizeStep.value = config.fontSizeStep;
  } else {
    // 設定情報がない場合は初期値で設定を保存
    await updateConfig();
    handleOpenConfig();
  }
};

// Storageの設定を更新
const updateConfig = async () => {
  await chrome.storage?.sync.set({
    [KEY_CONFIG]: JSON.stringify({
      storageMode: storageMode.value,
      fontSizeStep: fontSizeStep.value,
    })
  });
};

// Storageからメモを取得
const loadMemos = async () => {
  const data = await chrome.storage?.[storageMode.value].get(KEY_MEMO);
  memoList.value = data?.[KEY_MEMO]
    ? JSON.parse(data?.[KEY_MEMO]).filter((memo) => memo.body)
    : [];
  sortMemos();
};

// Storageのメモを更新
const updateMemos = async (mode = storageMode.value) => {
  try {
    await chrome.storage?.[mode].set({
      [KEY_MEMO]: JSON.stringify(memoList.value)
    });
  } catch (error) {
    hasStorageError.value = true;
  }
};

const onStorageErrorSnackbarModel = (open) => {
  if (!open) {
    hasStorageError.value = false;
  }
};

const openedMemo = computed(() => {
  if (isEditDialogOpened.value) {
    return memoList.value[editIndex.value];
  }
  return null;
});

const isSearchTarget = (memo) => {
  return searchText.value == null || memo.body.includes(searchText.value);
};

// メモをソートする
// 1.固定メモ → 未固定メモ
// 2.更新日時の降順
const sortMemos = () => {
  const fixedMemoList = [];
  const nonFixedMemoList = [];
  for (const memo of memoList.value) {
    if (memo.isPinned) {
      fixedMemoList.push(memo);
    } else {
      nonFixedMemoList.push(memo);
    }
  }

  const compareModifiedAtDesc = (a, b) => {
    const aAt = a?.modifiedAt ?? "";
    const bAt = b?.modifiedAt ?? "";
    if (aAt === bAt) return 0;
    // 降順（新しい=大きい文字列が先）
    return aAt < bAt ? 1 : -1;
  };

  fixedMemoList.sort(compareModifiedAtDesc);
  nonFixedMemoList.sort(compareModifiedAtDesc);

  memoList.value = [...fixedMemoList, ...nonFixedMemoList];
  insertIndex.value = fixedMemoList.length;
};

const openMemo = (index) => {
  window.getSelection().removeAllRanges();
  editIndex.value = index;
  isEditDialogOpened.value = true;
};

const handleChangeMemoBody = async (memo) => {
  isMemoUpdated.value = true;
  memo.modifiedAt = dateToString(new Date());
  await updateMemos();
}

// `yyyyMMddHHmmssSSS` 形式の日時文字列を作る
const dateToString = (date) => {
  const pad = (number, length) => String(number).padStart(length, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1, 2);
  const dd = pad(date.getDate(), 2);
  const hh = pad(date.getHours(), 2);
  const min = pad(date.getMinutes(), 2);
  const ss = pad(date.getSeconds(), 2);
  const ms = pad(date.getMilliseconds(), 3);
  return `${yyyy}${mm}${dd}${hh}${min}${ss}${ms}`;
};

const handleCreateMemo = () => {
  const newMemo = {
    isPinned: false,
    color:
      SELECTABLE_COLORS[Math.floor(Math.random() * SELECTABLE_COLORS.length)],
    body: ""
  };
  openMemo(memoList.value.push(newMemo) - 1);
};

const handleCloseMemo = async () => {
  isEditDialogOpened.value = false;
  if (!memoList.value[editIndex.value].body) {
    // 本文が空の場合は削除
    const blankMemo = memoList.value.splice(editIndex.value, 1)[0];
    if (blankMemo.isPinned) {
      insertIndex.value--;
    }
    await updateMemos();
  }
  if (isMemoUpdated.value) {
    // 本文が更新されている場合は再ソート
    sortMemos();
    await updateMemos();
    isMemoUpdated.value = false;
  }
};

const handleOpenConfig = () => {
  draftStorageMode.value = storageMode.value;
  draftFontSizeStep.value = fontSizeStep.value;
  isConfigDialogOpened.value = true;
};

const handleSaveConfig = async () => {
  storageMode.value = draftStorageMode.value;
  fontSizeStep.value = draftFontSizeStep.value;

  await updateConfig();
  await updateMemos();

  isConfigDialogOpened.value = false;
};

// メモの削除確認Dialogを開く
const handleOpenDeleteConfirm = (index) => {
  deleteIndex.value = index;
  isDeleteDialogOpened.value = true;
};

const handleDeleteMemo = async () => {
  isDeleteDialogOpened.value = false;
  isEditDialogOpened.value = false;
  if (memoList.value[deleteIndex.value].isPinned) {
    insertIndex.value--;
  }
  memoList.value.splice(deleteIndex.value, 1);
  await updateMemos();
};

const handleCopyToClipboard = (memo) => {
  memo.isCopied = true;
  navigator.clipboard.writeText(memo.body);

  setTimeout(() => {
    delete memo.isCopied;
  }, 2000);
};

const handleToggleMemoFix = async (memo) => {
  memo.isPinned = !memo.isPinned;
  sortMemos();
  if (isEditDialogOpened.value) {
    editIndex.value = memoList.value.indexOf(memo);
  }
  await updateMemos();
};

const handleChangeMemoColor = async (index, color) => {
  memoList.value[index].color = color;
  await updateMemos();
};
</script>

<style lang="scss" scoped>
.memo-list-root {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
}

.memo-list-inner {
  flex: 1 1 auto;
  min-height: 0;
}

.bg-memolist-wrap {
  width: 50%;
  max-height: 50%;
}

.card {
  cursor: default;
  .button-group {
    position: sticky;
    top: 0;
    z-index: 2;
    .top-button {
      opacity: 0;
    }
  }
  .card-text {
    z-index: 1;
  }
}

.card::-webkit-scrollbar {
  display: none;
}
.card:hover {
  outline: 2px solid darkgray;
  outline-offset: -2px;
  .button-group:hover ~ .card-text {
    opacity: 0.3;
  }
  .top-button {
    opacity: 0.2;
  }
  .top-button:hover {
    opacity: 1;
  }
}
.plus-button {
  bottom: 30px;
  right: 30px;
  opacity: 0.5;
}
.plus-button:hover {
  opacity: 1;
}

.deleting-text {
  height: 122px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 6;
}

.editing-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
}

.config-toggle-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.config-toggle {
  flex: 0 1 480px;
  width: 100%;
  max-width: 480px;
  min-width: 0;
}

.config-toggle :deep(.v-btn) {
  flex: 1 1 0;
  min-width: 0;
}

.config-dialog-card {
  min-height: 100%;
}

.text {
  font-family: "Noto Sans JP", sans-serif !important;
}

.text-memo,
.memo-edit-textarea :deep(.v-field__input) {
  font-size: var(--memo-font-size, 0.875rem) !important;
}

.text-draft {
  font-size: var(--memo-font-size-draft, 0.875rem) !important;
}
</style>
