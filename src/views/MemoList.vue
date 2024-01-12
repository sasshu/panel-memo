<template>
  <div class="pt-4 px-4 pb-16 h-100">
    <v-app-bar class="pr-2">
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
    </v-app-bar>
    <v-img
      v-if="!memoList.length"
      width="50%"
      height="100%"
      src="../assets/bg-memolist.svg"
      style="opacity: 0.5"
      class="mx-auto"
    ></v-img>
    <v-card
      v-for="(memo, index) in memoList"
      :key="index"
      :class="`mb-3 overflow-auto card`"
      :color="`${memo.color}-lighten-4`"
      elevation="4"
      max-height="200px"
      @dblclick="openMemo(memo)"
      v-show="isSearchTarget(memo)"
    >
      <div class="float-right pt-2 pr-2 button-group">
        <v-btn
          icon
          density="comfortable"
          variant="text"
          size="small"
          class="top-button"
          @click="handleOpenDeleteConfirm(memo)"
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
      <v-card-text class="text-pre-wrap text-body-2 card-text">
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
  <!-- メモの削除確認Dialog -->
  <v-dialog v-model="isDeleteDialogOpened" width="90%">
    <v-card class="rounded-lg">
      <v-card-title class="text-pre-wrap text-subtitle-1 font-weight-bold">
        以下のメモを削除しますか？
      </v-card-title>
      <v-card-text
        class="text-pre-wrap text-body-2 pt-0 pb-3 overflow-hidden deleting-text"
      >
        {{ memoList[deletingIndex].body }}
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
  <v-dialog v-model="isEditDialogOpened" fullscreen>
    <v-card
      :color="`${memoList[editingIndex].color}-lighten-4`"
      v-model="memoList[editingIndex]"
    >
      <v-toolbar
        density="comfortable"
        class="editing-toolbar"
        elevation="1"
        :color="`${memoList[editingIndex].color}-lighten-5`"
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
              v-for="color in selectableColors"
              :key="color"
              :value="color"
              :class="`bg-${color}-lighten-4 flex-grow-1`"
              @click="handleChangeMemoColor(color)"
            >
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          icon="mdi-delete-outline"
          density="comfortable"
          variant="text"
          size="large"
          @click="handleOpenDeleteConfirm(memoList[editingIndex])"
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
          @click="handleCopyToClipboard(memoList[editingIndex])"
          :disabled="memoList[editingIndex].isCopied"
        >
          <v-icon icon>
            {{
              memoList[editingIndex].isCopied
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
          @click="handleToggleMemoFix(memoList[editingIndex])"
        >
          <v-icon>{{
            memoList[editingIndex].isPinned ? "mdi-pin" : "mdi-pin-outline"
          }}</v-icon>
          <v-tooltip
            :text="memoList[editingIndex].isPinned ? '固定解除' : '固定'"
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
          :bg-color="`${memoList[editingIndex].color}-lighten-4`"
          class="px-3"
          v-model="memoList[editingIndex].body"
          spellcheck="false"
          @update:model-value="
            isMemoUpdated = true;
            updateMemos();
          "
        >
          {{ memoList[editingIndex].body }}</v-textarea
        >
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted } from "vue";
import { ref } from "vue";

// メモの背景色
const selectableColors = ["yellow", "green", "blue", "pink"];

// 全てのメモ
const memoList = ref([]);

const searchText = ref("");

const isDeleteDialogOpened = ref(false);
const deletingIndex = ref();

const isEditDialogOpened = ref(false);
const editingIndex = ref();

// メモのbody（テキスト）が更新されたらTrueに切り替わる
const isMemoUpdated = ref(false);

onMounted(async () => {
  await fetchMemos();
  sortMemos();
});

// Chrome Storageからメモを取得
const fetchMemos = async () => {
  await chrome.storage.sync.get("memos").then((data) => {
    memoList.value = JSON.parse(data.memos);
    memoList.value.forEach((memo) => {
      memo.isCopied = false;
    });
  });
};

// Chrome Storageのメモを更新
const updateMemos = async () => {
  await chrome.storage.sync.set({ memos: JSON.stringify(memoList.value) });
};

const isSearchTarget = (memo) => {
  return searchText.value == null || memo.body.includes(searchText.value);
};

// 固定されているメモを先頭に配置する
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
  memoList.value = [...fixedMemoList, ...nonFixedMemoList];
};

const openMemo = (memo) => {
  window.getSelection().removeAllRanges();
  editingIndex.value = memoList.value.indexOf(memo);
  isEditDialogOpened.value = true;
};

const handleCreateMemo = () => {
  const newMemo = {
    isPinned: false,
    color:
      selectableColors[Math.floor(Math.random() * selectableColors.length)],
    body: "",
    isCopied: false,
  };
  memoList.value.push(newMemo);
  isMemoUpdated.value = true;
  openMemo(newMemo);
};

const handleCloseMemo = async () => {
  isEditDialogOpened.value = false;

  if (isMemoUpdated.value) {
    isMemoUpdated.value = false;

    if (!memoList.value[editingIndex.value].body) {
      // 時間をおいて実行しないとDialogが消えない
      setTimeout(async () => {
        deleteMemo(editingIndex.value);
        await updateMemos();
      }, 500);
    } else {
      memoList.value.unshift(...deleteMemo(editingIndex.value));
      sortMemos();
      await updateMemos();
    }
  }
};

// メモの削除確認Dialogを開く
const handleOpenDeleteConfirm = (memo) => {
  deletingIndex.value = memoList.value.indexOf(memo);
  isDeleteDialogOpened.value = true;
};

const handleDeleteMemo = () => {
  isDeleteDialogOpened.value = false;
  isEditDialogOpened.value = false;

  // 時間をおいて実行しないとDialogが消えない
  setTimeout(async () => {
    deleteMemo(deletingIndex.value);
    await updateMemos();
  }, 500);
};

const deleteMemo = (index) => {
  return memoList.value.splice(index, 1);
};

const handleCopyToClipboard = (memo) => {
  memo.isCopied = true;
  navigator.clipboard.writeText(memo.body);

  setTimeout(() => {
    memo.isCopied = false;
  }, 2000);
};

const handleToggleMemoFix = async (memo) => {
  memo.isPinned = !memo.isPinned;
  sortMemos();
  if (isEditDialogOpened.value) {
    editingIndex.value = memoList.value.indexOf(memo);
  }
  await updateMemos();
};

const handleChangeMemoColor = async (color) => {
  memoList.value[editingIndex.value].color = color;
  await updateMemos();
};
</script>

<style lang="scss" scoped>
.text-subtitle-1,
.text-body-2 {
  font-family: "Noto Sans JP", sans-serif !important;
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
  -webkit-line-clamp: 6;
}

.editing-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
