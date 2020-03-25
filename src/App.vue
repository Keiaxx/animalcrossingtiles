<template>
  <fish-layout class="app demo3">
    <nav slot="header">
      <div class="logo">Animal Crossing Photo Tile Generator</div>

      <fish-message type="error">
        Attention! This app is in pre beta alpha not so done release mode. Things may be broken, slow, or not even work at all.

        If you find a problem feel free to send an issue or pull request on <a href="https://github.com/Keiaxx/animalcrossingtiles" target="_blank">GITHUB CLICK ME</a>
      </fish-message>
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
