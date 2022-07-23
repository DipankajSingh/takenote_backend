const express = require('express')
const router = express.Router()
const Note = require('../models/note')
const userMiddle = require('../fetchUser')

router.post('/addnote', userMiddle, async (req, res) => {
    const { title, body } = req.body
    if ((title == '' || title == null) && (body == '' || body == null)) {
        return res.status(400).json({ message: "nothing Provided, Please Give Me Somthing To Add!", success: false })}
    try {
        const note = new Note({ user: req.user, title, body })
        const newNote = await note.save()
        res.status(201).json({ newNote, success: true })
    } catch (error) { res.json({success:false,message:error.message}) }  // todo
})

router.get('/allnotes', userMiddle, async (req, res) => {
    try {
        res.json({ success: true, notes: await Note.find({ user: req.user }) })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})

router.patch('/updatenote',userMiddle, async (req, res) => {
    try {
        const noteId = await Note.findById(req.body.noteId)
        if (noteId == null) {
            return res.status(404).json({ success: false, message: "Not Found!, We Never Had!" })
        }
        if (req.body.update.type == 'both') {
            await Note.findByIdAndUpdate(req.body.noteId, {
                $set: {title: req.body.update.value.title,body: req.body.update.value.body}})
            return res.json({ success: true ,message:"Updated Success Full!"})}
        if (req.body.update.type == 'title') {
            await Note.findByIdAndUpdate(req.body.noteId, {
                $set: {title: req.body.update.value}})
            return res.json({ success: true,message:"Title Has Been Updated Successfully!" })}
        if (req.body.update.type == 'body') {
            await Note.findByIdAndUpdate(req.body.noteId, {
                $set: {body: req.body.update.value}})
            return res.json({ success: true ,message:"Content Has Been Updated Successfully!"})
        }
    } catch (error) {res.status(400).json({ success: false, error: error.message,message:"Somthing is Wrong From Our Side!" })}})

router.delete('/deletenote',userMiddle,async (req,res)=>{
    try {const noteToBeDelete=await Note.findById(req.body.noteId)
        if(noteToBeDelete!==null){
            await Note.findByIdAndDelete(noteToBeDelete._id)
            res.json({success:true,noteToBeDelete})}else{return res.json({message:"Not Found!, What Should I Delete Its Not There!",success:false})}
    } catch (error) {res.json({success:false,error:error.message,message:"Eowww! It's an Error."})}})

router.delete('/deletenotes',userMiddle,async (req,res)=>{
    try {
      const n=  await Note.find({user:req.user})
        n.forEach(async (value)=>{await Note.findByIdAndDelete(value._id)})
        res.send("Ok Sirr! ''' Every Note Was Deleted!!!")} catch (error) {
        res.json({success:false,message:error.message})}})

module.exports = router