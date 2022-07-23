const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

//create user
router.post('/createuser', [
    body('name', 'Its Too Short!').isLength({ min: 3 }),
    body('email', "this isn't an Email").isEmail(),
    body('password', 'Be Stronger Man, Stronger!').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
    }
    try {
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        const newUser = await user.save()
        const accessToken = jwt.sign({ id: newUser._id, password: req.body.password }, process.env.ACCESS_TOKEN_SECRET)
        res.status(201).json({ success: true, authToken: accessToken })
    } catch (error) {
        res.status(400).json({ success: false, message: 'Aww Snap looks like Somthing Worng' })
    }
})

//delete user

router.delete('/deleteuser', [
    body('email', "Isn't It?").isEmail(),
    body('password', 'I Cant See This, Tiny huh?').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user == null) {
            return res.status(404).json({ success: false, message: "You Didn't exits" })
        }
        const didPassMatched = await bcrypt.compare(password, user.password)
        if (!didPassMatched) {
            return res.status(400).json({ success: false, message: "Its really You???" })
        }
        const del = await User.deleteOne({ email })
        res.status(201).json({ success: true, message: del })
    } catch (err) {
        res.status(500).json({ message: err.message, success: false })
    }
})

//update user

router.patch('/updateuser', [
    body('authtoken', "Com'on You haven't Logged In yet?").isJWT()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() })
    }
    try {
        const userInfo = jwt.verify(req.body.authtoken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(userInfo.id)
        if (user == null) {
            return res.status(404).json({ success: false, message: "Naah Sorrry!, I Haven't That." })
        }
        const password = user.password
        const didPassMatched = await bcrypt.compare(userInfo.password, password)
        // Checking password
        if (!didPassMatched) {
            return res.status(400).json({ success: false, message: "I Dont Know That But Why Password Does Not Matched To The User!!!" })
        }
        // Updating Name
        if (req.body.update.type == 'name') {
            await User.findByIdAndUpdate(userInfo.id, { $set: { name: req.body.update.value } })
            return res.status(201).json({ success: true })
        }
        // Updating Eamil
        if (req.body.update.type == 'email' && isEmail(req.body.update.value) == true) {
            await User.findByIdAndUpdate(userInfo.id, { $set: { email: req.body.update.value } })
            return res.status(201).json({ success: true })
        }
        // Updating Password
        if (req.body.update.type == 'password') {
            const salt = await bcrypt.genSalt(10)
            const secPass = await bcrypt.hash(req.body.update.value, salt)
            await User.findByIdAndUpdate(userInfo.id, { $set: { password: secPass } })
            return res.status(201).json({ success: true })
        }
        // If somthing doesn't match say this -->
        else { res.json({ success: false, message: 'Invalid Query Was Given!' }) }
    } catch (error) {
        res.status(400).json({ error: "A Invalid Token or Internal server error, Maybe! ", message: error.message })
    }
})

//login
router.post('/login', [body('email', 'enter a valid email').isEmail(),
body('password', 'password must be 5 latters').isLength({ min: 5 })], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: "I See There's no email like this!" })
        }
        const didPassMatched = await bcrypt.compare(password, user.password)
        if (!didPassMatched) {
            return res.status(404).json({ success: false, message: "I Dont No, Who-Are You????" })
        }
        const authToken = jwt.sign({ id: user.id, password }, process.env.ACCESS_TOKEN_SECRET)
        res.json({ success: true, authToken })
        console.log(jwt.verify(authToken,process.env.ACCESS_TOKEN_SECRET))
    } catch (err) {
        res.status(400).send('I Guess This --> Internel Server Error')
    }
})

function isEmail(email) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/
    if (email.match(regex)) {
        return true
    } else {
        return false
    }
}

module.exports = router