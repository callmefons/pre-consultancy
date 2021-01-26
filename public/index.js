const NotFound = { template: '<p>Page not found</p>' }
const Home = { template: '<p>home page</p>' }
const About = { template: '<p>about page</p>' }

const routes = {
  '/': Home,
  '/about': About
}


var app = new Vue({
  el: '#app',
  data () {
    return {
      api: 'http://127.0.0.1:5000/api/v1/',
      intents: [],
    }
  },

  methods: {
    
    list: function () {
       axios
      .get(`${this.api}intent/list`)
      .then(response => {
        let result = response.data.result;
        this.intents = result;
      })
      .catch(e => {
        console.log(e)
      })
    }

  },

  created: function(){
      this.list()
  }
})

