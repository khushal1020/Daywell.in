import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
const router=Router()
function tokenFor(user){return jwt.sign({sub:user.id},process.env.JWT_SECRET,{expiresIn:'7d'})}
function publicUser(user){return {id:user.id,name:user.name,email:user.email}}
router.post('/signup',async(req,res,next)=>{try{const name=String(req.body.name||'').trim(),email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');if(name.length<1||name.length>60)return res.status(400).json({message:'Please enter a name up to 60 characters.'});if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({message:'Please enter a valid email address.'});if(password.length<8||password.length>72)return res.status(400).json({message:'Password must be between 8 and 72 characters.'});if(await User.exists({email}))return res.status(409).json({message:'An account with this email already exists.'});const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12)});res.status(201).json({token:tokenFor(user),user:publicUser(user)})}catch(e){if(e.code===11000)return res.status(409).json({message:'An account with this email already exists.'});next(e)}})
router.post('/signin',async(req,res,next)=>{try{const email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');const user=await User.findOne({email});if(!user||!await bcrypt.compare(password,user.passwordHash))return res.status(401).json({message:'Email or password is incorrect.'});res.json({token:tokenFor(user),user:publicUser(user)})}catch(e){next(e)}})
router.get('/me',auth,(req,res)=>res.json({user:publicUser(req.user)}))
export default router
