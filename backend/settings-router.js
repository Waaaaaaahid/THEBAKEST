import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  restaurantName: { type: String, default: 'THE BAKEST' },
  tagline: { type: String, default: 'Freshly Baked. Beautifully Crafted.' },
  phone: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'hello@thebakest.com' },
  address: { type: String, default: '272-B, Near Al-Nihar, Jamia Nagar, Okhla, New Delhi' },
  logoUrl: { type: String, default: '' },
  heroImageUrl: { type: String, default: '' },
  storyImageUrl: { type: String, default: '' },
  restaurantOpen: { type: Boolean, default: true },
  openingHours: { type: Map, of: String, default: {} },
  deliveryCharge: { type: Number, default: 40 },
  taxRate: { type: Number, default: 5 },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
}, { timestamps: true });
const StoreSetting = mongoose.models.StoreSetting || mongoose.model('StoreSetting', settingsSchema);

const defaults = {
  restaurantName:'THE BAKEST', tagline:'Freshly Baked. Beautifully Crafted.', phone:'+91 98765 43210', email:'hello@thebakest.com',
  address:'272-B, Near Al-Nihar, Jamia Nagar, Okhla, New Delhi', logoUrl:'', heroImageUrl:'', storyImageUrl:'', restaurantOpen:true,
  openingHours:{Monday:'11:00 AM - 11:00 PM',Tuesday:'11:00 AM - 11:00 PM',Wednesday:'11:00 AM - 11:00 PM',Thursday:'11:00 AM - 11:00 PM',Friday:'11:00 AM - 12:00 AM',Saturday:'11:00 AM - 12:00 AM',Sunday:'12:00 PM - 11:00 PM'},
  deliveryCharge:40,taxRate:5,instagram:'https://instagram.com',facebook:'https://facebook.com',twitter:'https://twitter.com'
};
function publicSettings(s){ const o=s.toObject(); o.id=s._id.toString(); o._id=undefined; o.openingHours=Object.fromEntries(s.openingHours || []); return o; }
async function getSettings(){ let s=await StoreSetting.findOne({key:'main'}); if(!s)s=await StoreSetting.create({key:'main',...defaults}); return s; }
function admin(req,res,next){const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return res.status(401).json({success:false,message:'Authentication required'});try{const p=jwt.verify(h.slice(7),JWT_SECRET);if(p.role!=='admin')return res.status(403).json({success:false,message:'Admin access required'});req.auth=p;next()}catch{return res.status(401).json({success:false,message:'Invalid or expired token'})}}
router.get('/',async(req,res)=>{try{res.json({success:true,message:'Settings loaded',data:publicSettings(await getSettings())})}catch(e){res.status(500).json({success:false,message:e.message})}});
router.put('/',admin,async(req,res)=>{try{const allowed=['restaurantName','tagline','phone','email','address','logoUrl','heroImageUrl','storyImageUrl','restaurantOpen','openingHours','deliveryCharge','taxRate','instagram','facebook','twitter'];const update={};for(const k of allowed)if(req.body[k]!==undefined)update[k]=req.body[k];const s=await StoreSetting.findOneAndUpdate({key:'main'},{$set:{...defaults,...update,key:'main'}},{upsert:true,new:true,setDefaultsOnInsert:true});res.json({success:true,message:'Cafe settings updated',data:publicSettings(s)})}catch(e){res.status(500).json({success:false,message:e.message})}});
export default router;
