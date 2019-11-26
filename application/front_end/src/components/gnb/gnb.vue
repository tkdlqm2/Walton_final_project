<template>
    <b-navbar>

      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img src="https://postfiles.pstatic.net/MjAxOTExMjZfMjUw/MDAxNTc0NzUyMzUxMDU4.2yg4k7urG-FQFbtvwUidofJzcNONR8K1K1CUPhjb_14g.wasnsj7rUVahpSo4Pwp2hKrjTn_92e48pQiutAYSk_0g.PNG.tkdlqm2/KakaoTalk_Photo_2019-11-26-16-10-27.png?type=w773">
        </b-navbar-item>
      </template>

      <!-- 
      <template slot="start">
        <b-navbar-item href="#"></b-navbar-item>
        <b-navbar-item href="#">Documentation</b-navbar-item>
        <b-navbar-dropdown label="Info">
          <b-navbar-item href="#">
            About
          </b-navbar-item>
          <b-navbar-item href="#">
            Contact
          </b-navbar-item>
        </b-navbar-dropdown>
      </template> 
      -->

      <template slot="end">
        <b-navbar-item tag="div">
          <div class="buttons">
            <a class="button is-light" @click="logout">Log out</a>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    logout() {

      // [1] 로그아웃 actions 실행
      this.$store.dispatch('LOGOUT')
                 .then( () => {
                    this.$buefy.snackbar.open('성공적으로 로그아웃하였습니다.');
                    this.$router.push('/');
                })
    }
  }
}
</script>

<style scoped>
.navbar-item img {
  max-height: 4.75rem;
  padding-left: 2rem;
  padding-top: 1rem;
}
</style>
