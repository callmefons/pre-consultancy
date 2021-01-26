const express = require('express');
const router = express.Router();

// Require controller modules.
const intentController = require('../controllers/intentController');


router.get('/getAll', intentController.getAll);
router.get('/getById/:id', intentController.getById);
router.get('/getFollowupIntents/:id', intentController.getFollowupIntents);
router.get('/getReaskingIntents/:id', intentController.getReaskingIntents);
router.post('/create', intentController.create);
router.post('/createFollowup', intentController.createFollowup);
router.post('/createReasking', intentController.createReasking);
router.post('/edit', intentController.edit);
router.post('/editFollowup', intentController.editFollowup);
router.post('/editReasking', intentController.editReasking);
router.post('/delete', intentController.delete);
router.post('/deleteFollowup', intentController.deleteFollowup);


router.post('/notify', intentController.notify);


module.exports = router;
