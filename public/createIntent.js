var app = new Vue({
  el: '#app',
  data () {
    return {
      api: 'http://127.0.0.1:5000/api/v1/',
      name: '',
      suggestion: '',
      suggestions: [],
      message: ''
    }
  },

  methods: {
    
    addSuggestion: function (suggestion) {
      this.suggestions.push(suggestion)
    },

    removeSuggestion: function(suggestion){
      this.suggestions.splice(suggestion-1, 1);
    },

    submit: function(){
      axios
      .post(`${this.api}intent/create`,{
         name: this.name,
         suggestions: this.suggestions
      })
      .then(response => {
        console.log(response)
        this.message = response.data
      })
      .catch(e => {
        console.log(e)
      })
    }

  }

})

