import { Router } from 'express'
import Entry from '../models/Entry.js'
import auth from '../middleware/auth.js'
const router=Router()
router.use(auth)
router.get('/',async(req,res,next)=>{try{const entries=await Entry.find({user:req.user.id}).sort({dateKey:-1}).limit(366);res.json({entries})}catch(e){next(e)}})
router.post('/',async(req,res,next)=>{try{const mood=String(req.body.mood||''),note=String(req.body.note||'').trim();if(!['radiant','good','okay','low','tough'].includes(mood))return res.status(400).json({message:'Choose a mood before saving.'});if(note.length>500)return res.status(400).json({message:'Notes can be up to 500 characters.'});const dateKey=String(req.body.dateKey||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)||Number.isNaN(Date.parse(`${dateKey}T00:00:00Z`)))return res.status(400).json({message:'Please refresh and try the check-in again.'});const parsed=new Date(`${dateKey}T00:00:00Z`);if(parsed.toISOString().slice(0,10)!==dateKey)return res.status(400).json({message:'Please refresh and try the check-in again.'});const entry=await Entry.findOneAndUpdate({user:req.user.id,dateKey},{$set:{mood,note}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true});res.status(200).json({entry})}catch(e){next(e)}})
export default router
