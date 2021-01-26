<template>
  <div class="editIntent">

    <v-container fluid>
      <v-layout align-center justify-center row fill-height>
        <v-flex xs12 md8>

          <v-card>

            <div class="pa-3">

              <v-form v-model="valid">
                <p class="headline">Edit Disease  <v-btn color="cyan" dark class="float-right" @click="save">Save</v-btn></p>

                <p class="title">Disease name</p>
                <v-text-field v-model="intent.displayName" :rules="nameRules" label="Disease name" required></v-text-field>
<!-- 
                <v-text-field
                  v-model="intent.outputContexts[0].name" label="output" required
                  ></v-text-field> -->

                  <p class="title">Main question</p>
                  <div class="form-inline">
                    <v-text-field label="question" v-model="mainQuestion"> </v-text-field>
                  </div>

                  <p class="title">Possible answers</p>
                  <div class="form-inline">
                    <v-text-field solo @keyup.enter.native="addObject(currentTraining, intent.trainingPhrases)"
                    label="add user answer" v-model="currentTraining"
                    > </v-text-field>
                  </div>
                  
                  <div v-for="(traning) in intent.trainingPhrases">
                    <div class="form-inline">
                      <v-text-field v-model="traning.parts[0].text"> </v-text-field>
                      <v-icon v-on:click="deleteObject(traning, intent.trainingPhrases)" class="pl-2 pt-2" color="gray">delete_forever</v-icon>
                    </div>
                  </div>

                  <p class="title">Diagnosis</p>
                  <v-textarea name="Diagnosis" label="Diagnosis" v-model="diagnosis"></v-textarea>
                </v-form>

                <!-- **************************************************************************** -->
                <!-- Follow-up question -->
                <!-- **************************************************************************** -->
                <div v-if="followupIntents.length == 0"> 
                  <p class="headline mt-5">Add follow-up question  
                    <v-btn color="cyan" dark class="float-right" @click="createFollowup">Add</v-btn>
                  </p>
                </div>
                <div v-else>
                  <p class="headline mt-5">Follow-up question  </p>
                </div>


                <div v-for="(followupIntent, index) in followupIntents">
                  <p class="title mt-5">Question {{index + 1}}
                    <v-btn color="cyan" dark class="float-right" @click="deleteFollowup(followupIntent)">Delete</v-btn>
                    <v-btn color="cyan" dark class="float-right" @click="saveFollowup(index, followupIntent)">Save</v-btn>
                  </p>

                  <v-text-field v-model="followupIntent.intent.displayName" label="Disease name" required></v-text-field>

                  <div class="form-inline">
                    <v-text-field label="question" v-model="followupIntent.intent.messages[0].text.text"> </v-text-field>
                  </div>

                  <p class="title">Possible Answers</p>
                  <div class="form-inline">
                    <v-text-field solo @keyup.enter.native="addObject(currentFollowupTraining, followupIntent.intent.trainingPhrases)" label="add user answer" v-model="currentFollowupTraining"> </v-text-field>
                  </div>

                  <div v-for="(traning) in followupIntent.intent.trainingPhrases">
                    <div class="form-inline">
                      <v-text-field v-model="traning.parts[0].text"> </v-text-field>
                      <v-icon v-on:click="deleteObject(traning, followupIntent.intent.trainingPhrases)" class="pl-2 pt-2" color="gray">delete_forever</v-icon>
                    </div>
                  </div> 
                </div>

                <!-- **************************************************************************** -->
                <!-- Re-asking question -->
                <!-- **************************************************************************** -->
                <div v-if="reaskingIntents.length == 0"> 
                  <p class="headline mt-5">Add re-asking question  
                    <v-btn color="cyan" dark class="float-right" @click="createReasking">Add</v-btn>
                  </p>
                </div>
                <div v-else>
                  <p class="headline mt-5">Re-asking question</p>
                </div>


                <div v-for="(reaskingIntent, index) in reaskingIntents">
                  <p class="title mt-5">Answer {{index + 1}}
                    <v-btn color="cyan" dark class="float-right" @click="deleteFollowup(reaskingIntent)">Delete</v-btn>
                    <v-btn color="cyan" dark class="float-right" @click="saveReasking(index, reaskingIntent)">Save</v-btn>
                  </p>

                  <v-text-field v-model="reaskingIntent.intent.displayName" label="Disease name" required></v-text-field>

                  <div class="form-inline">
<!--                     <v-text-field label="answer" v-model="reaskingIntent.intent.messages[0].text.text"> </v-text-field>
 -->                    <v-textarea label="answer" v-model="reaskingIntent.intent.messages[0].text.text"></v-textarea>
                  </div>

                  <p class="title">Possible Asking</p>
                  <div class="form-inline">
                    <v-text-field solo @keyup.enter.native="addObject(currentReaskingTraining, followupIntent.intent.trainingPhrases)" label="add user question" v-model="currentReaskingTraining"> </v-text-field>
                  </div>

                  <div v-for="(traning) in reaskingIntent.intent.trainingPhrases">
                    <div class="form-inline">
                      <v-text-field v-model="traning.parts[0].text"> </v-text-field>
                      <v-icon v-on:click="deleteObject(traning, reaskingIntent.intent.trainingPhrases)" class="pl-2 pt-2" color="gray">delete_forever</v-icon>
                    </div>
                  </div> 
                </div>



            </div>

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
  export default{
    name:'editIntent',
    data (){ 
      return{

        api: 'http://127.0.0.1:5000/api/v1/',
        dialowFlowSession: 'projects/preconsultancy-224605/agent/sessions/preconsultancy-224605-sessions/contexts/',

        question: '',
        answer: '',
        followupIntents:[],
        reaskingIntents:[],
        intentId: '',
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

        followupIntent: {
          displayName: '',
          trainingPhrases: [
          {
            'parts': [{'text': ''}]
          }
          ],
          messages: [
          {
            "text" :  {"text": ""}
          }
          ],
          inputContextNames: [""],
          outputContexts: [
          {
            "name": "",
            "lifespanCount": 1
          }
          ],
          parentFollowupIntentName: ""

        },

        reaskingIntent: {
          displayName: '',
          trainingPhrases: [
          {
            'parts': [{'text': ''}]
          }
          ],
          messages: [
          {
            "text" :  {"text": ""}
          }
          ],
          parentFollowupIntentName: ""

        },

        intentId: '',
        confirmIntentId: '',
        mainQuestion: '',
        diagnosis: '',
        trainingPhrases: [{'text': ''}, {'text': ''}],
        currentTraining: '',
        currentFollowupTraining: '',
        currentReaskingTraining: '',
        errorMessage: '',

        valid: false,
        name: '',
        nameRules: [
        v => !!v || 'Name is required',
        ],

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

      getById: function () {

        axios
        .get(`${this.api}intent/getById/${this.$route.params.id}`)
        .then(response => {
          this.intentId = response.data.result.intentId;
          this.intent = response.data.result.intent;

            // let part = response.data.result.intent.outputContexts[0].name;
            // let parts = part.split('/');
            // let outputContexts = parts.pop(); 

            // this.intent.outputContexts[0].name = outputContexts;

            response.data.result.mainQuestion === undefined ? 
            this.mainQuestion = null :
            this.mainQuestion = response.data.result.mainQuestion;

            response.data.result.diagnosis === undefined ? 
            this.diagnosis = null:
            this.diagnosis = response.data.result.diagnosis;
            
          })
        .catch(e => {
          console.log(e)
        })


        axios
        .get(`${this.api}intent/getFollowupIntents/${this.$route.params.id}`)
        .then(response => {   
          this.followupIntents = response.data.result;
          })
        .catch(e => {
          console.log(e)
        })

        axios
        .get(`${this.api}intent/getReaskingIntents/${this.$route.params.id}`)
        .then(response => {   
          this.reaskingIntents = response.data.result;
          })
        .catch(e => {
          console.log(e)
        })

      },

      createFollowup(){

        let displayName = ""; 

        if(this.followupIntents == undefined){
          displayName = this.intent.displayName + '-0';
        }else{
          displayName = this.intent.displayName + '-' + this.followupIntents.length.toString();
        }

        this.followupIntent.displayName = displayName;
        this.followupIntent.parentFollowupIntentName = `projects/preconsultancy-224605/agent/intents/${this.intentId}`
        this.followupIntent.inputContextNames[0] =  this.intent.outputContexts[0].name;
        this.followupIntent.outputContexts[0].name = this.dialowFlowSession + this.intent.displayName.replace(/\s+/g, '').toLowerCase();


        // if(this.followupIntent.length == undefined){
        //   this.followupIntent.inputContextNames[0] = this.dialowFlowSession + this.intent.outputContexts[0].name;
        // }else{
        //   this.followupIntent.inputContextNames[0] = this.dialowFlowSession + this.followupIntents[this.followupIntents.length - 1].intent.outputContexts[0].name;
        // }

        axios
        .post(`${this.api}intent/createFollowup`,{
         parentId: this.intentId,
         intent: this.followupIntent
       })
        .then(response => {
          if(response.status == 200){

           this.getById()

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

      createReasking(){

        let displayName = ""; 

        if(this.reaskingIntents == undefined){
          displayName = this.intent.displayName + '-reasking-0';
        }else{
          displayName = this.intent.displayName + '-reasking-' + this.reaskingIntents.length.toString();
        }

        this.reaskingIntent.displayName = displayName;
        this.reaskingIntent.parentFollowupIntentName = `projects/preconsultancy-224605/agent/intents/${this.intentId}`
        //this.reaskingIntent.inputContextNames[0] =  this.intent.outputContexts[0].name;
       // this.reaskingIntent.outputContexts[0].name = this.dialowFlowSession + this.intent.displayName.replace(/\s+/g, '').toLowerCase();


        axios
        .post(`${this.api}intent/createReasking`,{
         parentId: this.intentId,
         intent: this.reaskingIntent
       })
        .then(response => {
          if(response.status == 200){

           this.getById()

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

      save(){

        if(this.followupIntents.length == 0){
          this.intent.messages[0].text.text = this.diagnosis;
        }else{
         this.intent.messages[0].text.text = this.followupIntents[this.followupIntents.length - 1].intent.messages[0].text.text;
       }        

       axios
       .post(`${this.api}intent/edit`,{
        intentId: this.intentId,
        intent: this.intent,
        mainQuestion: this.mainQuestion,
        diagnosis: this.diagnosis
      })
       .then(response => {
        this.snackbar.snackbar = true;
        this.snackbar.text = response.statusText;
      })
       .catch(e => {
        console.log(e)
      })

     },

     saveFollowup(index, followupIntent){

        // ******************* main intent ******************* //

        if(this.followupIntents.length == 0){
          this.intent.messages[0].text.text = this.diagnosis;
        }else{
         this.intent.messages[0].text.text = this.followupIntents[index].intent.messages[0].text.text;
       }


       axios
       .post(`${this.api}intent/edit`,{
        intentId: this.intentId,
        intent: this.intent,
        mainQuestion: this.mainQuestion,
        diagnosis: this.diagnosis
      })
       .then(response => {
        this.snackbar.snackbar = true;
        this.snackbar.text = response.statusText;
      })
       .catch(e => {
        console.log(e)
      })

        // ******************* follow-up intent ******************* //
        axios
        .post(`${this.api}intent/editFollowup`,{
          intentId: followupIntent.intentId,
          intent: followupIntent.intent,
          question: this.diagnosis
        })
        .then(response => {
          this.snackbar.snackbar = true;
          this.snackbar.text = response.statusText;
        })
        .catch(e => {
         console.log(e)
       })

      },

      saveReasking(index, reaskingIntent){

        axios
        .post(`${this.api}intent/editReasking`,{
          intentId: reaskingIntent.intentId,
          intent: reaskingIntent.intent,
        })
        .then(response => {
          this.snackbar.snackbar = true;
          this.snackbar.text = response.statusText;
        })
        .catch(e => {
         console.log(e)
       })

      },

      addObject(obj, arr){
        arr.push({'parts': [{'text': obj}]})
        obj = '';
      },

      addFollowup(obj, arr){
        arr.push({'parts': [{'text': obj}]})
        this.currentFollowupTraining = '';
      },

      deleteObject: function(obj, arr){
        arr.splice(arr.indexOf(obj), 1);
      },

      deleteFollowup(followupIntent){

        axios
        .post(`${this.api}intent/deleteFollowup`,{
         intentId: followupIntent.intentId
       })
        .then(response => {
          this.getById();
        })
        .catch(e => {
          console.log(e.response)
          this.snackbar.snackbar = true;
          this.snackbar.text =  e.response.data.error;
        })

      }

    },

    created: function(){
      this.getById();
    },

    
  }
</script>

<style scoped>

</style>
