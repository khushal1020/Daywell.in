import mongoose from 'mongoose'
const entrySchema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},dateKey:{type:String,required:true},mood:{type:String,required:true,enum:['radiant','good','okay','low','tough']},note:{type:String,default:'',maxlength:500}},{timestamps:true})
entrySchema.index({user:1,dateKey:1},{unique:true})
export default mongoose.model('Entry',entrySchema)
