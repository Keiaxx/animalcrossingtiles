<template>
  <fish-layout class="app demo3">
    <nav slot="header">
      <div class="logo">Animal Crossing Photo Tile Generator</div>
    </nav>

    <div slot="content">
      <router-view/>
    </div>

    <div slot="footer">2020 Keiaxx Box Salad</div>
  </fish-layout>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background: black;
}
.fish.layout.demo3 > .header {
  padding: 0;
  background: #e0f0fa;
}

.logo {
  padding: 0.7em .8em;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
