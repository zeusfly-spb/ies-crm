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

@media (max-width: 768px) {
  nav {
    padding: 0.75rem 1rem;
  }
  
  nav a {
    margin-right: 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  nav {
    padding: 0.5rem 0.75rem;
  }
  
  nav a {
    margin-right: 0.5rem;
    font-size: 0.85rem;
  }
}

nav a:hover,
nav a.router-link-active {
  color: #42b883;
}

main {
  padding: 2rem;
}

@media (max-width: 768px) {
  main {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  main {
    padding: 0.75rem;
  }
}
</style>
