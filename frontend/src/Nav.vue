<template>
  <nav class="nav nav-masthead">
    <router-link class="nav-link" active-class="active" to="/" exact>EPUB List</router-link>
    <router-link class="nav-link" active-class="active" to="/add">Add new EPUB</router-link>
    <router-link class="nav-link" active-class="active" to="/contact">Contact Me</router-link>
    <router-link class="nav-link" active-class="active" to="/signin">Sign in</router-link>
  </nav>
</template>

<script>
module.exports = {
  data: function(){
    return {
      message: 'nav'
    };
  }
};
</script>