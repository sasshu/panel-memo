<template>
  <div class="pt-4 px-4 pb-16 h-100">
    <v-app-bar class="pr-2">
      <v-btn icon="mdi-plus" size="large" @click="handleCreateMemo()"></v-btn>
      <v-text-field
        v-model="searchText"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
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
          icon="mdi-delete-outline"
          density="comfortable"
          variant="text"
          size="small"
          class="top-button"
          @click="handleOpenDeleteConfirm(memo)"
        ></v-btn>
        <v-btn
          icon="mdi-checkbox-multiple-blank-outline"
          density="comfortable"
          variant="text"
          size="small"
          class="top-button"
          @click="handleCopyToClipboard(memo.body, index)"
        ></v-btn>
        <span
          class="text-body-2 font-weight-bold copied-message"
          :id="`copied-message-${index}`"
          >copied!</span
        >
        <v-btn
          :icon="memo.isPinned ? 'mdi-pin' : 'mdi-pin-outline'"
          density="comfortable"
          variant="text"
          size="small"
          :class="{ 'top-button': !memo.isPinned }"
          @click="handleToggleMemoFix(memo)"
        ></v-btn>
      </div>
      <v-card-text class="text-pre-wrap text-body-1 card-text">
        {{ memo.body }}
      </v-card-text>
    </v-card>

    <v-btn
      icon="mdi-plus"
      size="large"
      color="blue"
      class="plus-button"
      position="fixed"
      @click="handleCreateMemo()"
    ></v-btn>
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
          color="primary"
          variant="text"
          @click="isDeleteDialogOpened = false"
        >
          キャンセル
        </v-btn>
        <v-btn color="red" variant="text" @click="handleDeleteMemo()">
          削除
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
          icon="mdi-palette-outline"
          density="comfortable"
          variant="text"
          size="large"
          id="palette-activator"
        >
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
        ></v-btn>
        <v-btn
          icon="mdi-checkbox-multiple-blank-outline"
          density="comfortable"
          variant="text"
          size="large"
          @click="handleCopyToClipboard(memoList[editingIndex].body)"
        ></v-btn>
        <span class="text-body-2 font-weight-bold" id="copied-message-opened"
          >copied!</span
        >
        <v-btn
          :icon="
            memoList[editingIndex].isPinned ? 'mdi-pin' : 'mdi-pin-outline'
          "
          density="comfortable"
          variant="text"
          size="large"
          @click="handleToggleMemoFix(memoList[editingIndex])"
        ></v-btn>
        <v-btn
          icon="mdi-close"
          density="comfortable"
          variant="text"
          size="large"
          @click="handleCloseMemo()"
        >
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
          class="memo-input px-3"
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

const handleCopyToClipboard = (text, index = 0) => {
  navigator.clipboard.writeText(text);

  let messageElement;
  if (isEditDialogOpened.value) {
    messageElement = document.getElementById("copied-message-opened");
  } else {
    messageElement = document.getElementById(`copied-message-${index}`);
  }

  messageElement.style.display = "block";
  setTimeout(() => {
    messageElement.style.display = "none";
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
.card {
  cursor: default;
  .button-group {
    position: sticky;
    top: 0;
    z-index: 2;
    .top-button {
      opacity: 0;
    }
    .copied-message {
      display: none;
      position: absolute;
      top: -2px;
      right: 26px;
    }
  }
  .card-text {
    z-index: 1;
  }
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
  #copied-message-opened {
    display: none;
    position: absolute;
    top: -2px;
    right: 95px;
  }
}
</style>
