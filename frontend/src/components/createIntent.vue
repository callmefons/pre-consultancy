<template>
  <div class="createIntent">

    <v-container fluid>
      <v-layout align-center justify-center row fill-height>
        <v-flex xs12 md8>


          <v-card>

            <div class="pa-3">
              <p class="headline">Create Disease  <v-btn color="cyan" dark class="float-right" :disabled="!valid" @click="save">Add</v-btn>
</p>


              <p class="title">Disease name</p>
              <v-form v-model="valid">
                <v-text-field
                v-model="intent.displayName"
                :rules="nameRules"
                label="Disease name"
                required
                ></v-text-field>

                  <p class="title mt-5">First question</p>
               <div v-for="message in intent.messages">
                <div class="form-inline">
                 <v-text-field label="Confirmation question" v-model="message.text.text"> </v-text-field>
               </div>
             </div>



                <p class="title">Answers</p>
                <div class="form-inline">
                  <v-text-field solo @keyup.enter.native="addObject(trainingPhrases[0], intent)" label="add user answer"  v-model="trainingPhrases[0].text"> </v-text-field>
                </div>

                <div v-for="(traning) in intent.trainingPhrases">
                  <div class="form-inline">
                   <v-text-field v-model="traning.parts[0].text"> </v-text-field>
                   <v-icon v-on:click="deleteObject(traning, intent.trainingPhrases)" class="pl-2 pt-2" color="gray">delete_forever</v-icon>
                 </div>
               </div>

               <p class="title mt-5">Confirmation question <v-btn color="cyan" dark class="float-right" :disabled="!valid" @click="save">Add</v-btn></p>

               <div v-for="message in confirmIntent.messages">
                <div class="form-inline">
                 <v-text-field label="Confirmation question" v-model="message.text.text"> </v-text-field>
               </div>
             </div>

              <p class="title">Answers</p>
                <div class="form-inline">
                  <v-text-field solo @keyup.enter.native="addObject(trainingPhrases[1], confirmIntent)" label="add user answer" v-model="trainingPhrases[1].text"> </v-text-field>
                </div>

                <div v-for="(traning) in confirmIntent.trainingPhrases">
                  <div class="form-inline">
                   <v-text-field  v-model="traning.parts[0].text"> </v-text-field>
                   <v-icon v-on:click="deleteObject(traning, confirmIntent.trainingPhrases)" class="pl-2 pt-2" color="gray">delete_forever</v-icon>
                 </div>
               </div>

             <p class="title mt-5">Final answer</p>
             <v-text-field label="Confirmation question" v-model="finalAnswer"> </v-text-field>

           </v-form>
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
  name:'createIntent',
  data (){
   return{

    api: 'http://127.0.0.1:5000/api/v1/',
    dialowFlowSession: 'projects/preconsultancy-224605/agent/sessions/preconsultancy-224605-sessions/contexts/',

   	intent: {
      displayName: 'Retinopathy',
      trainingPhrases: [
        {
          'parts': [{'text': 'I have an eye problem'}]
        }
      ],
      messages: [
        {
          "text" :  {"text": "Do you have an eye problem?"}
        }
      ],
      outputContexts: [
        {
          "name": "",
          "lifespanCount": 2
        }
      ]
    },

    confirmIntent: {
      displayName: '',
      trainingPhrases: [
      {
        'parts': [{'text': 'Yes, I have seen'}]
      }
      ],
      messages: [
        {
          "text" :  {"text": "Do you see black shadow in visible range?"}
        }
      ],
      inputContextNames: [""],
      parentFollowupIntentName: ""

    },

    mainQuestion: '',
    finalAnswer: 'Please, see a doctor',
    trainingPhrases: [{'text': ''}, {'text': ''}],
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
  addObject(obj, arr){
    arr.trainingPhrases.push({'parts': [{'text': obj.text}]})
    obj.text = '';
  },

  deleteObject: function(obj, arr){
    console.log(obj);
    arr.splice(arr.indexOf(obj), 1);
  },

  save(){

    this.mainQuestion = this.intent.messages[0].text;

    this.intent.outputContexts[0].name = this.dialowFlowSession + this.intent.displayName.replace(/\s+/g, '').toLowerCase();
    // this.intent.messages[0].text.text = this.confirmIntent.messages[0].text.text;

    this.confirmIntent.displayName = this.intent.displayName + "-confirm";
    this.confirmIntent.inputContextNames[0] = this.intent.outputContexts[0].name;
    // this.confirmIntent.messages[0].text.text = this.finalAnswer;

    console.log(this.intent)
    console.log(this.confirmIntent)

    axios
          .post(`${this.api}intent/create`,{
             mainQuestion: this.mainQuestion,
             finalAnswer: this.finalAnswer,
             intent: this.intent,
             confirmIntent: this.confirmIntent
          })
          .then(response => {
            console.log(response)
            this.$router.push({name:'index'})
          })
          .catch(e => {
            console.log(e.response)
            this.snackbar.snackbar = true;
            this.snackbar.text =  e.response.data.error;
          })

  }

 }
}
</script>

<style scoped>

</style>
