const jwt = require('jsonwebtoken')
const User=require('./models/user')
const bcrypt = require('bcryptjs')


const fetchuser =async (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ success:false,message: "Not A Valid Token, Try Logout And Logging In Again!" })
    }
    
    try {
        const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = data.id
        req.password=data.password
        const user= await User.findById(req.user)
        if (user==null) {
            return res.status(404).json({success:false,message:"You Are Not In Database!!!"})
        }
        const pass=await bcrypt.compare(req.password,user.password)
        if(pass==false){
            return res.status(400).json({success:false,message:"Somehow Your Password Is Not Matching!"})
        }
        next()
        
    } catch (error) {
        res.status(400).send({error:error.message,success:false, message: "Looks Like authentication Token Is Invalid." })
    }
}

module.exports = fetchuser