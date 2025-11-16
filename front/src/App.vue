<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

nav {
  background-color: #2c3e50;
  padding: 1rem 2rem;
}

nav a {
  color: #fff;
  text-decoration: none;
  margin-right: 1rem;
  font-weight: 500;
}

nav a:hover,
nav a.router-link-active {
  color: #42b883;
}

main {
  padding: 2rem;
}
</style>
