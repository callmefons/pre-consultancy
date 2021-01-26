const request = require('request');
const {google} = require('googleapis');
const serviceAccount = require('../preconsultancy-224605-firebase-adminsdk-s75tu-bc0314bb1f.json');

const jwtClient = new google.auth.JWT(
  serviceAccount.client_email, null, serviceAccount.private_key,
  ['https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/actions.fulfillment.conversation'],
  null
);

const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;

admin.initializeApp(serviceAccount);
const db = admin.firestore();

const settings = {timestampsInSnapshots: true};
db.settings(settings);



/** Collections and fields names in Firestore */
const FirestoreNames = {
  INTENT_TYPE: 'intentType',
  INTENTS: 'intents',
  FOLLOWUP_INTENTS: 'followupIntents',
  REASKING_INTENT: 'reaskingIntents',
  INTENT_ID: 'intentId',
  PARANT_ID: 'parentId',
  INTENT: 'intent',
  MAIN_QUESTION: 'mainQuestion',
  DIAGNOSIS:'diagnosis',
  ANSWER: 'answer',
  TRAINGING_PHRASE: 'trainingPhrases',
  CREATED_AT: 'createdAt'
};

const dialogflowApiV2 = 'https://dialogflow.googleapis.com/v2/projects/preconsultancy-224605/agent/intents/'
const dialowFlowSession = 'projects/preconsultancy-224605/agent/sessions/preconsultancy-224605-sessions/contexts/';


// Display list of all Authors.
exports.getAll = function(req, res) {
    
	let intents = []

    db.collection(FirestoreNames.INTENTS)
    .get()
    .then(snapshot => {
	    snapshot.forEach(doc => {
	      let obj = {
	      	id: doc.id,
	      	data: doc.data()
	      }
	      intents.push(obj)
	    });

	    return res.status(200).json({
	    	result: intents
	    })

	})
	  .catch(err => {
	    console.log('Error getting documents', err);
	});

};


exports.getById = function(req, res){

 	
	var docRef = db.collection(FirestoreNames.INTENTS).doc(req.params.id);

	docRef.get().then(function(doc) {
	    if (doc.exists) {
	        res.status(200).json({result: doc.data()})
	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch(function(error) {
	    console.log("Error getting document:", error);
	});

};


exports.create = function(req, res) {


	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}
				
	    request.post(dialogflowApiV2, 
	    	{'auth': {'bearer': tokens.access_token}, 
	    	json:req.body.intent}, 
	    	function (err, response, body) {

	    		if(response.statusCode != 200){
					res.status(response.statusCode).json({
	    				error: body.error.message
	    			})
	    		}else{
	    		
		    		let part = body.name + '';
		    		let parts = part.split('/');
					let intentId = parts.pop(); 

					req.body.intent.outputContexts[0].name = dialowFlowSession + intentId;

					request.patch(`${dialogflowApiV2}${intentId}`, 
			    	{'auth': {'bearer': tokens.access_token}, 
			    	json:req.body.intent}, 
			    	function (err, response, body) {

			    		if(response.statusCode != 200){
							res.status(response.statusCode).json({
			    				error: body
			    			})
			    		}else{
			    		
							db.collection(FirestoreNames.INTENTS)
		                    .doc(intentId)
		                    .set({
		                    	[FirestoreNames.INTENT_ID]: intentId,
		                        [FirestoreNames.INTENT]: req.body.intent,
		                        [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
		                    })
		                    .then((docRef) => {
		                        res.status(response.statusCode).json({
		                            status: true
		                        })
		                    });

			    		}

			    	});
	    		}

	    });
	});
  
};

exports.createFollowup = function(req, res) {


	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}
				
	    request.post(dialogflowApiV2, 
	    	{'auth': {'bearer': tokens.access_token}, 
	    	json:req.body.intent}, 
	    	function (err, response, body) {

	    		if(response.statusCode != 200){
					res.status(response.statusCode).json({
	    				error: body.error.message
	    			})
	    		}else{


		    		let part = body.name + '';
		    		let parts = part.split('/');
					let intentId = parts.pop(); 

					req.body.intent.outputContexts[0].name = dialowFlowSession + intentId;

					request.patch(`${dialogflowApiV2}${intentId}
					?intentView=INTENT_VIEW_FULL&updateMask=displayName,messages,trainingPhrases,inputContextNames,outputContexts`, 
			    	{'auth': {'bearer': tokens.access_token}, 
			    	json:req.body.intent}, 
			    	function (err, response, body) {

			    		if(response.statusCode != 200){
							res.status(response.statusCode).json({
			    				error: body
			    			})
			    		}else{
			    		
							db.collection(FirestoreNames.FOLLOWUP_INTENTS)
		                    .doc(intentId)
		                    .set({
		                    	[FirestoreNames.INTENT_ID]: intentId,
		                        [FirestoreNames.INTENT]: req.body.intent,
		                        [FirestoreNames.PARANT_ID]: req.body.parentId,
		                        [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
		                    })
		                    .then((docRef) => {
		                        res.status(response.statusCode).json({
		                            status: true
		                        })
		                    });


			    		}

			    	});
					
	    		}

	    });
	});
};


exports.createReasking = function(req, res) {


	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}
				
	    request.post(dialogflowApiV2, 
	    	{'auth': {'bearer': tokens.access_token}, 
	    	json:req.body.intent}, 
	    	function (err, response, body) {

	    		if(response.statusCode != 200){
					res.status(response.statusCode).json({
	    				error: body.error.message
	    			})
	    		}else{


		    		let part = body.name + '';
		    		let parts = part.split('/');
					let intentId = parts.pop(); 

					request.patch(`${dialogflowApiV2}${intentId}
					?intentView=INTENT_VIEW_FULL&updateMask=displayName,messages,trainingPhrases,inputContextNames,outputContexts`, 
			    	{'auth': {'bearer': tokens.access_token}, 
			    	json:req.body.intent}, 
			    	function (err, response, body) {

			    		if(response.statusCode != 200){
							res.status(response.statusCode).json({
			    				error: body
			    			})
			    		}else{
			    		
							db.collection(FirestoreNames.REASKING_INTENT)
		                    .doc(intentId)
		                    .set({
		                    	[FirestoreNames.INTENT_ID]: intentId,
		                        [FirestoreNames.INTENT]: req.body.intent,
		                        [FirestoreNames.PARANT_ID]: req.body.parentId,
		                        [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
		                    })
		                    .then((docRef) => {
		                        res.status(response.statusCode).json({
		                            status: true
		                        })
		                    });


			    		}

			    	});
					
	    		}

	    });
	});
};

exports.getFollowupIntents = function(req, res){

 	let intents = [];

	db.collection(FirestoreNames.FOLLOWUP_INTENTS)
	.where("parentId", "==", req.params.id)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            intents.push(doc.data());
        });

        return res.status(200).json({
	    	result: intents
	    })

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}


exports.getReaskingIntents = function(req, res){

 	let intents = [];

	db.collection(FirestoreNames.REASKING_INTENT)
	.where("parentId", "==", req.params.id)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            intents.push(doc.data());
        });

        return res.status(200).json({
	    	result: intents
	    })

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}


exports.edit = function(req, res) {

	// req.body.intent.outputContexts[0].name = dialowFlowSession + req.body.intent.outputContexts[0].name;
	
	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}
				

	    request.patch(`${dialogflowApiV2}${req.body.intentId}`, 
	    	{'auth': {'bearer': tokens.access_token}, 
	    	json:req.body.intent}, 
	    	function (err, response, body) {

	    		if(response.statusCode != 200){

	    			console.log(body)
					res.status(response.statusCode).json({
	    				error: body
	    			})
	    		}else{

	    		
					 db.collection(FirestoreNames.INTENTS)
                        .doc(req.body.intentId)
                        .update({
                            [FirestoreNames.INTENT_ID]: req.body.intentId,
                            [FirestoreNames.INTENT]: req.body.intent,
                            [FirestoreNames.MAIN_QUESTION]: req.body.mainQuestion,
                            [FirestoreNames.DIAGNOSIS]: req.body.diagnosis,
                            [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
                        })
                        .then((docRef) => {
                            res.status(response.statusCode).json({
                                status: true
                            })

                        });

	    		}

	    });
	});
  
};


exports.editFollowup = function(req, res) {
	
	// req.body.intent.inputContextNames[0] = dialowFlowSession + req.body.intent.inputContextNames[0];
	// req.body.intent.outputContexts[0].name = dialowFlowSession + req.body.intent.outputContexts[0].name;

	db.collection(FirestoreNames.FOLLOWUP_INTENTS)
    .doc(req.body.intentId)
    .update({
        [FirestoreNames.INTENT_ID]: req.body.intentId,
        [FirestoreNames.INTENT]: req.body.intent,
        [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
    })
    .then((docRef) => {

        req.body.intent.messages[0].text.text = req.body.question;

		jwtClient.authorize((err, tokens) => {
			
			if (err) {
				throw new Error(`Auth error: ${err}`);
			}
					

			 request.patch(`${dialogflowApiV2}${req.body.intentId}
		    	?intentView=INTENT_VIEW_FULL&updateMask=displayName,messages,trainingPhrases,inputContextNames,outputContexts
		    	`, 
		    	{'auth': {'bearer': tokens.access_token}, 
		    	json:req.body.intent}, 
		    	function (err, response, body) {

		    		if(response.statusCode != 200){
		    			console.log(body)
						res.status(response.statusCode).json({
							error: body
						})
		    		}else{

	    			  res.status(response.statusCode).json({
	                        status: true
	                    })
		    		}
		    });
		
		});

    });
  
 
};

exports.editReasking = function(req, res) {
	
	// req.body.intent.inputContextNames[0] = dialowFlowSession + req.body.intent.inputContextNames[0];
	// req.body.intent.outputContexts[0].name = dialowFlowSession + req.body.intent.outputContexts[0].name;

	db.collection(FirestoreNames.REASKING_INTENT)
    .doc(req.body.intentId)
    .update({
        [FirestoreNames.INTENT_ID]: req.body.intentId,
        [FirestoreNames.INTENT]: req.body.intent,
        [FirestoreNames.CREATED_AT]: FieldValue.serverTimestamp()
    })
    .then((docRef) => {


		jwtClient.authorize((err, tokens) => {
			
			if (err) {
				throw new Error(`Auth error: ${err}`);
			}
					
			 request.patch(`${dialogflowApiV2}${req.body.intentId}
		    	?intentView=INTENT_VIEW_FULL&updateMask=displayName,messages,trainingPhrases,inputContextNames,outputContexts
		    	`, 
		    	{'auth': {'bearer': tokens.access_token}, 
		    	json:req.body.intent}, 
		    	function (err, response, body) {

		    		if(response.statusCode != 200){
		    			
						res.status(response.statusCode).json({
							error: body
						})
		    		}else{

	    			  res.status(response.statusCode).json({
	                        status: true
	                    })
		    		}
		    });
		
		});

    });
  
 
};



exports.delete = function(req, res) {


	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}


		const options = {  
	    url: `${dialogflowApiV2}${req.body.intentId}`,
	    method: 'DELETE',
	    headers: {
	        'Accept': 'application/json',
	        'Accept-Charset': 'utf-8',
	        'Authorization': `Bearer ${tokens.access_token}`
	    }
		};

		request(options, function(err, response, body) {  
		    // let json = JSON.parse(body);
		    console.log(body);

		    	if(response.statusCode != 200){
					res.status(response.statusCode).json({
	    				error: body
	    			})
	    		}else{

		    		 db.collection(FirestoreNames.INTENTS)
			 			.doc(req.body.intentId)
					    .delete()
					    .then((docRef) => {


					    	// First perform the query
							db.collection(FirestoreNames.FOLLOWUP_INTENTS)
							  .where('parentId','==',req.body.intentId).get()
							  .then(function(querySnapshot) {
							        // Once we get the results, begin a batch
							        var batch = db.batch();

							        querySnapshot.forEach(function(doc) {
							            // For each doc, add a delete operation to the batch
							            batch.delete(doc.ref);
							        });

							        // Commit the batch
							        batch.commit();
							  }).then(function() {
							      res.status(response.statusCode).json({
							          status: true
							        })
							  }); 
					       
					    });


				
	    		}
		});

				
	  
	});
  
};


exports.deleteFollowup = function(req, res) {

	console.log(req.body.intentId)


	jwtClient.authorize((err, tokens) => {
		
		if (err) {
			throw new Error(`Auth error: ${err}`);
		}

		const options = {  
	    url: `${dialogflowApiV2}${req.body.intentId}`,
	    method: 'DELETE',
	    headers: {
	        'Accept': 'application/json',
	        'Accept-Charset': 'utf-8',
	        'Authorization': `Bearer ${tokens.access_token}`
	    }
		};

		request(options, function(err, response, body) {  
		    // let json = JSON.parse(body);
		    console.log(body);

		    	if(response.statusCode != 200){
					res.status(response.statusCode).json({
	    				error: body
	    			})
	    		}else{

		    		 db.collection(FirestoreNames.FOLLOWUP_INTENTS)
			 			.doc(req.body.intentId)
					    .delete()
					    .then((docRef) => {
					       res.status(response.statusCode).json({
					          status: true
					        })
					    });
				
	    		}
		});

				
	  
	});
  
};

exports.notify = function(req, res) {
	res.send('notify')
}



