<template>
  <div class="root" :class="[chat.type, { pseudoHover: commentMenuOpened }]" @dblclick="$emit('pinned')">
    <div class="comment-number">{{ chat.value.no }}</div>
    <div class="comment-body">{{ computedContent }}</div>
    <div class="comment-misc" @click.stop="$emit('commentMenu')"><i class="icon-btn icon-ellipsis-vertical"></i></div>
  </div>
</template>
<script lang="ts" src="./CommonComment.vue.ts"></script>

<style lang="less" scoped>
@import "../../../styles/_colors";
@import "../../../styles/mixins";
@import "../../../styles/comment";

.root {
  display: flex;
  flex-direction: row;

  &:hover, &.pseudoHover {
    .hover;

    & > .comment-body {
      color: @white;
    }

    & > .comment-misc {
      display: block;
    }
  }

  &.operator > .comment-body {
    color: @accent;
  }
}

.comment-number {
  .common--comment-number;
  color: @grey;
}

.comment-body {
  .common--comment-body;
  color: @white;
}

.comment-misc {
  .common--comment-misc;
  display: none;
}
</style>
