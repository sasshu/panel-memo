<template>
  <div class="px-4 pb-16">
    <v-card
      v-for="(memo, index) in memoList"
      :key="index"
      :class="`mb-3 overflow-auto card`"
      :color="`${memo.color}-lighten-4`"
      elevation="4"
      max-height="200px"
      @dblclick="openMemo(memo)"
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
              @click="memoList[editingIndex].color = color"
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
        <span class="text-body-2 font-weight-bold" :id="`copied-message-opened`"
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
          @update:model-value="isMemoUpdated = true"
        >
          {{ memoList[editingIndex].body }}</v-textarea
        >
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref } from "vue";
import type { Ref } from "vue";

interface Memo {
  isPinned: boolean;
  color: string;
  body: string;
}

const selectableColors: string[] = ["yellow", "green", "blue", "pink"];

const memoList: Ref<Memo[]> = ref([
  {
    isPinned: false,
    color: "yellow",
    body: "<やること>\n・洗濯\n・掃除\n・皿洗い\n・仕事の予習\n・新幹線の予約\n・夕飯の買い物",
  },
  {
    isPinned: true,
    color: "green",
    body: "hellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohelloあああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああuuuuuuuuuuqqqqqqqqrrrrrrrrggggggg今日は楽しかったです。特に理由はありません。なぜか朝から楽しくてとてもはしゃいでしまいました。",
  },
  {
    isPinned: false,
    color: "blue",
    body: "goodmorninggoodmorning\ngoodmorninggoodmorning",
  },
  {
    isPinned: false,
    color: "green",
    body: "goodnightgoodnight\ngoodnightgoodnightgoodnight",
  },
  {
    isPinned: false,
    color: "pink",
    body: "seeyouseeyouseeyouseeyouseeyou\nseeyouseeyou",
  },
  {
    isPinned: true,
    color: "blue",
    body: "あいうえおあいうえお\nあいうえおあいうえお\nあいうえおあいうえお\nあいうえおあいうえお\nあいうえおあいうえお",
  },
  {
    isPinned: false,
    color: "yellow",
    body: "いろはにおへと\nちりぬるを\nわかよたれそ\nえひもせす\nういのおくやま\nけふこえて",
  },
]);

const isDeleteDialogOpened: Ref<boolean> = ref(false);
const deletingIndex: Ref<number> = ref();

const isEditDialogOpened: Ref<boolean> = ref(false);
const editingIndex: Ref<number> = ref();

const isMemoUpdated: Ref<boolean> = ref(false);

onMounted(() => {
  sortMemos();
});

const sortMemos = () => {
  const fixedMemoList: Memo[] = [];
  const nonFixedMemoList: Memo[] = [];
  for (const memo of memoList.value) {
    if (memo.isPinned) {
      fixedMemoList.push(memo);
    } else {
      nonFixedMemoList.push(memo);
    }
  }
  memoList.value = [...fixedMemoList, ...nonFixedMemoList];
};

const openMemo = (memo: Memo) => {
  editingIndex.value = memoList.value.indexOf(memo);
  isEditDialogOpened.value = true;
};

const handleCreateMemo = () => {
  const newMemo: Memo = {
    isPinned: false,
    color: memoList.value[memoList.value.length - 1].color,
    body: "",
  };
  memoList.value.push(newMemo);
  openMemo(newMemo);
};

const handleCloseMemo = () => {
  isEditDialogOpened.value = false;

  if (memoList.value[editingIndex.value].body == "") {
    setTimeout(() => {
      deleteMemo(editingIndex.value);
    }, 200);
  }

  if (isMemoUpdated.value) {
    memoList.value.unshift(...deleteMemo(editingIndex.value));
    sortMemos();
  }
  isMemoUpdated.value = false;
};

const handleOpenDeleteConfirm = (memo: Memo) => {
  deletingIndex.value = memoList.value.indexOf(memo);
  isDeleteDialogOpened.value = true;
};

const handleDeleteMemo = () => {
  isDeleteDialogOpened.value = false;
  isEditDialogOpened.value = false;
  setTimeout(() => {
    deleteMemo(deletingIndex.value);
  }, 500);
};

const deleteMemo = (index: number) => {
  return memoList.value.splice(index, 1);
};

const handleCopyToClipboard = (text: string, index: number = 0) => {
  navigator.clipboard.writeText(text);

  let messageElement: HTMLElement;
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

const handleToggleMemoFix = (memo: Memo) => {
  memo.isPinned = !memo.isPinned;
  sortMemos();
  if (isEditDialogOpened.value) {
    editingIndex.value = memoList.value.indexOf(memo);
  }
};
</script>

<style lang="scss" scoped>
.card {
  cursor: default;
  user-select: none;
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
