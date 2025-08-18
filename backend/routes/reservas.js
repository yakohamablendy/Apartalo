const express = require('express');
const router = express.Router();


const { crearReserva, getReservasUsuario, cancelarReserva } = require('../controllers/reservasController');
const { verifyToken } = require('../controllers/authController');


/**
 * @route   
 * @desc    
 * @access  
 */
router.post('/', verifyToken, crearReserva);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/usuario/:id', verifyToken, getReservasUsuario);

/**
 * @route  
 * @desc    
 * @access  
 */
router.delete('/:id', verifyToken, cancelarReserva);


module.exports = router;