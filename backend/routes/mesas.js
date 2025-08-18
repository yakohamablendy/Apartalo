const express = require('express');
const router = express.Router();

const { getAllMesas, getMesasDisponibles } = require('../controllers/mesasController');


const { verifyToken } = require('../controllers/authController');



/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/', verifyToken, getAllMesas);

/**
 * @route   
 * @desc    
 * @access  
 * @params 
 */
router.get('/disponibles', verifyToken, getMesasDisponibles);


module.exports = router;