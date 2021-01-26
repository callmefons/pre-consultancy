<template>
  <div class="index">

  <v-container fluid>
      <v-layout align-center justify-center row fill-height>
        <v-flex xs12 md8>

             <div class="form-inline">
                  <v-text-field solo @keyup.enter.native="createIntent()" label="Add intent" v-model="intent.displayName"> </v-text-field>
            </div>
          
          <v-card>

            <v-card-title>
             <!-- Intents -->
            
             <!-- <v-spacer></v-spacer> -->
             <v-text-field
             v-model="search"
             append-icon="search"
             label="Search"
             single-line
             hide-details
             ></v-text-field>
           </v-card-title>


           <v-data-table data-app
           :items="intents"
           :search="search"
           :pagination.sync="pagination"
           :filter="filter"
           :customFilter="customFilter"
           class="elevation-1"
           >
          <template slot="items" slot-scope="props">
            <td class="editIntent" v-on:click="editIntent(props.item.data.intentId)"><p class="title pt-3">{{ props.item.data.intent.displayName}}</p></td>
            <td class="text-xs-right"><v-icon v-on:click="deleteIntent(props.item.data)" color="gray">delete_forever</v-icon></td>
          </template>
        </v-data-table>


          <v-snackbar
            v-model="snackbar.snackbar"
            :timeout="snackbar.timeout"
            :top="snackbar.y"
            :color="snackbar.color"
            :multi-line="snackbar.mode"
          >
          {{ snackbar.text }}
          <v-btn
            dark
            flat
            @click="snackbar.snackbar = false"
          >
            Close
          </v-btn>
    </v-snackbar>


      </v-card>

    </v-flex>
  </v-layout>
</v-container>


</div>
</template>

<script>

  import axios from 'axios';

  export default {
    name: 'index',
    data () {
      return {
        api: 'http://127.0.0.1:5000/api/v1/',
            dialowFlowSession: 'projects/pre-consultancy/agent/sessions/pre-consultancy-sessions/contexts/',

          intent: {
           displayName: '',
            trainingPhrases: [
              {
                'parts': [ {"text": ""}]
              }
            ],
            messages: [
              {
                "text" :  {"text": ""}
              }
            ],
            outputContexts: [
              {
                "name": "",
                "lifespanCount": 1
              }
            ]
        },
        intents: [],
        headers: [
        {
          text: 'Name',

          sortable: false,
          value: 'displayName'
        },
        { text: '#', value: 'editIntent', sortable: false},
        ],
        search: '',
        pagination: {},
        
        snackbar: {
        snackbar: false,
        y: 'top',
        mode: 'multi-line',
        color: 'cyan',
        timeout: 6000,
        text: ''
       },

      }
    },

    methods: {
      filter(val, search) {
        return val.includes(search);
      },

      customFilter(items, search, filter){
        if (search.trim() === '') return items
          return items.filter(item => filter(item.data.displayName, search));
      },

      getAll: function () {
       axios
       .get(`${this.api}intent/getAll`)
       .then(response => {
        let result = response.data.result;
        this.intents = result;
      })
       .catch(e => {
        console.log(e)
      })
     },

      createIntent(){

        this.intent.outputContexts[0].name = this.dialowFlowSession + this.intent.displayName.replace(/\s+/g, '').toLowerCase();

         axios
          .post(`${this.api}intent/create`,{
             intent: this.intent
          })
          .then(response => {
            if(response.status == 200){
              this.getAll()
            }else{
              this.snackbar.snackbar = true;
              this.snackbar.text =  response.statusText;
            }
          
          })
          .catch(e => {
            console.log(e.response)
            this.snackbar.snackbar = true;
            this.snackbar.text =  e.response.data.error;
          })

      },

      deleteObject: function(obj, arr){
        arr.splice(arr.sindexOf(obj), 1);
      },


     editIntent: function(id) {
      this.$router.push({name:'editIntent',params:{id:id}})
    },

    deleteIntent(intent){

      axios
        .post(`${this.api}intent/delete`,{
           intentId: intent.intentId,
           confirmIntentId: intent.confirmIntentId
        })
        .then(response => {
          this.getAll();
        })
        .catch(e => {
          console.log(e.response)
          this.snackbar.snackbar = true;
          this.snackbar.text =  e.response.data.error;
        })
    },

    gotoPage(name){
      this.$router.push({name:'createIntent'})
    }


  },

  created: function(){
    this.getAll()
  },



}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
td.editIntent{
  cursor: pointer;
}
</style>