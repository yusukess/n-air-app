<template>
  <div class="root" :class="chat.type" :title="computedTitle">
    <div class="comment-header"><i class="icon-nicoad"></i></div>
    <div class="comment-body">{{ computedContent }}</div>
  </div>
</template>
<script lang="ts" src="./NicoadComment.vue.ts"></script>

<style lang="less" scoped>
@import "../../../styles/_colors";
@import "../../../styles/mixins";
@import "../../../styles/comment";

.root {
  display: flex;
  flex-direction: row;

  .comment-row-fade(@nicoad-brand-color);
}

.comment-header {
  .common--comment-header();
  > i {
    color: @nicoad-brand-color;
  }
}

.comment-body {
  .common--comment-body();
  color: @light-grey;
}
</style>
