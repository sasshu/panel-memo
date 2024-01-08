<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <v-app>
    <!-- <v-app-bar color="primary">
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title> ここに検索機能を配置 </v-app-bar-title>
    </v-app-bar> -->
    <v-main>
      <nav>
        <router-link to="/">List</router-link>
        <router-link to="/detail">Detail</router-link>
      </nav>
      <router-view />
    </v-main>
  </v-app>
</template>
