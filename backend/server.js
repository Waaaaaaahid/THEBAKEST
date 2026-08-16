import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { seedBakestMenu } from './menu-seed.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const userSchema = new mongoose.Schema({ email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true}, firstName:String, lastName:String, phone:String, role:{type:String,enum:['customer','admin'],default:'customer'} }, {timestamps:true});
const categorySchema = new mongoose.Schema({ name:{type:String,required:true}, slug:{type:String,required:true,unique:true}, sort_order:{type:Number,default:0} }, {timestamps:true});
const menuSchema = new mongoose.Schema({ name:String, slug:{type:String,unique:true,sparse:true}, category_id:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null}, description:String, image:String, price:Number, price_variants:{type:Array,default:[]}, available:{type:Boolean,default:true}, featured:{type:Boolean,default:false}, bestseller:{type:Boolean,default:false}, veg:{type:Boolean,default:true}, tags:{type:[String],default:[]}, sort_order:{type:Number,default:0} }, {timestamps:true});
const orderSchema = new mongoose.Schema({ order_number:{type:String,unique:true}, user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, status:{type:String,default:'placed'}, items:Array, subtotal:Number, delivery_charge:Number, total:Number, payment_method:{type:String,enum:['cod','online'],default:'cod'}, customer_name:String, customer_phone:String, customer_email:String, address:String, city:String, pincode:String, instructions:String }, {timestamps:true});
const reviewSchema = new mongoose.Schema({ order_id:{type:mongoose.Schema.Types.ObjectId,ref:'Order',default:null}, user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, user_name:String, rating:{type:Number,min:1,max:5}, comment:String, status:{type:String,enum:['pending','approved','rejected'],default:'pending'} }, {timestamps:true});
const User=mongoose.model('User',userSchema), Category=mongoose.model('Category',categorySchema), Menu=mongoose.model('Menu',menuSchema), Order=mongoose.model('Order',orderSchema), Review=mongoose.model('Review',reviewSchema);

const publicUser=u=>({id:u._id.toString(),email:u.email,firstName:u.firstName||'',lastName:u.lastName||'',phone:u.phone||'',role:u.role,created_at:u.createdAt});
const tokenFor=u=>jwt.sign({id:u._id.toString(),role:u.role},JWT_SECRET,{expiresIn:'7d'});
const ok=(res,data,message='Success')=>res.json({success:true,message,data});
const fail=(res,message,status=400)=>res.status(status).json({success:false,message});
function auth(req,res,next){const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return fail(res,'Authentication required',401); try{req.auth=jwt.verify(h.slice(7),JWT_SECRET); next();}catch{return fail(res,'Invalid or expired token',401)}}
function admin(req,res,next){if(req.auth?.role!=='admin') return fail(res,'Admin access required',403); next()}
const id=(v)=>mongoose.isValidObjectId(v)?new mongoose.Types.ObjectId(v):null;

app.get('/api/health',(req,res)=>ok(res,{environment:process.env.NODE_ENV||'production',timestamp:new Date().toISOString()},'API is healthy'));
app.post('/api/auth/register',async(req,res)=>{try{const {email,password,firstName,lastName,phone}=req.body;if(!email||!password)return fail(res,'Email and password are required');if(password.length<6)return fail(res,'Password must be at least 6 characters');if(await User.exists({email:email.toLowerCase()}))return fail(res,'An account with this email already exists');const u=await User.create({email,passwordHash:await bcrypt.hash(password,12),firstName,lastName,phone});const access_token=tokenFor(u);ok(res,{access_token,refresh_token:access_token,user:publicUser(u)},'Account created')}catch(e){fail(res,e.message,500)}});
app.post('/api/auth/login',async(req,res)=>{try{const {email,password}=req.body;const u=await User.findOne({email:(email||'').toLowerCase()});if(!u||!(await bcrypt.compare(password||'',u.passwordHash)))return fail(res,'Invalid email or password',401);const access_token=tokenFor(u);ok(res,{access_token,refresh_token:access_token,user:publicUser(u)},'Login successful')}catch(e){fail(res,e.message,500)}});
app.get('/api/auth/me',auth,async(req,res)=>{const u=await User.findById(req.auth.id);if(!u)return fail(res,'User not found',404);ok(res,publicUser(u))});
app.put('/api/auth/update-profile',auth,async(req,res)=>{const u=await User.findByIdAndUpdate(req.auth.id,{$set:{firstName:req.body.firstName,lastName:req.body.lastName,phone:req.body.phone}},{new:true});if(!u)return fail(res,'User not found',404);ok(res,publicUser(u),'Profile updated')});

app.get('/api/categories',async(req,res)=>ok(res,await Category.find().sort({sort_order:1,name:1}),'Categories loaded'));
app.post('/api/categories',auth,admin,async(req,res)=>{try{const c=await Category.create({name:req.body.name,slug:req.body.slug||req.body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-'),sort_order:req.body.sortOrder||0});ok(res,c,'Category created')}catch(e){fail(res,e.message)}});
app.put('/api/categories/:id',auth,admin,async(req,res)=>{const c=await Category.findByIdAndUpdate(req.params.id,{$set:{...(req.body.name&&{name:req.body.name}),...(req.body.slug&&{slug:req.body.slug}),...(req.body.sortOrder!==undefined&&{sort_order:req.body.sortOrder})}},{new:true});c?ok(res,c,'Category updated'):fail(res,'Category not found',404)});
app.delete('/api/categories/:id',auth,admin,async(req,res)=>{await Category.findByIdAndDelete(req.params.id);ok(res,null,'Category deleted')});

function menuOut(m){const o=m.toObject();o.id=m._id.toString();o.category_id=o.category_id?.toString()||null;return o}
app.get('/api/menu',async(req,res)=>ok(res,(await Menu.find().populate('category_id').sort({sort_order:1,name:1})).map(menuOut),'Menu loaded'));
app.get('/api/menu/category/:id',async(req,res)=>{const cid=id(req.params.id);if(!cid)return fail(res,'Invalid category',400);ok(res,(await Menu.find({category_id:cid}).sort({sort_order:1,name:1})).map(menuOut),'Menu loaded')});
app.post('/api/menu',auth,admin,async(req,res)=>{try{const m=await Menu.create(req.body);ok(res,menuOut(m),'Menu item created')}catch(e){fail(res,e.message)}});
app.put('/api/menu/:id',auth,admin,async(req,res)=>{const m=await Menu.findByIdAndUpdate(req.params.id,req.body,{new:true});m?ok(res,menuOut(m),'Menu item updated'):fail(res,'Menu item not found',404)});
app.delete('/api/menu/:id',auth,admin,async(req,res)=>{await Menu.findByIdAndDelete(req.params.id);ok(res,null,'Menu item deleted')});

app.post('/api/orders',auth,async(req,res)=>{try{const body=req.body;const count=await Order.countDocuments();const o=await Order.create({...body,user_id:req.auth.id,order_number:`BK${Date.now().toString().slice(-8)}${String(count%100).padStart(2,'0')}`});ok(res,o,'Order placed')}catch(e){fail(res,e.message)}});
app.get('/api/orders',auth,async(req,res)=>{const q=req.auth.role==='admin'?{}:{user_id:req.auth.id};ok(res,await Order.find(q).sort({createdAt:-1}),'Orders loaded')});
app.get('/api/orders/:id',auth,async(req,res)=>{const o=await Order.findById(req.params.id);if(!o)return fail(res,'Order not found',404);if(req.auth.role!=='admin'&&o.user_id.toString()!==req.auth.id)return fail(res,'Forbidden',403);ok(res,o)});
app.put('/api/orders/status/:id',auth,admin,async(req,res)=>{const o=await Order.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});o?ok(res,o,'Order status updated'):fail(res,'Order not found',404)});

app.get('/api/reviews/approved',async(req,res)=>ok(res,await Review.find({status:'approved'}).sort({createdAt:-1}),'Reviews loaded'));
app.get('/api/reviews/all',auth,admin,async(req,res)=>ok(res,await Review.find().sort({createdAt:-1}),'Reviews loaded'));
app.get('/api/reviews/order/:id',auth,async(req,res)=>ok(res,await Review.findOne({order_id:req.params.id,user_id:req.auth.id}),'Review loaded'));
app.post('/api/reviews',auth,async(req,res)=>{const o=await Order.findOne({_id:req.body.orderId,user_id:req.auth.id,status:'delivered'});if(!o)return fail(res,'You can review only a delivered order',400);const r=await Review.create({order_id:o._id,user_id:req.auth.id,user_name:(await User.findById(req.auth.id)).firstName,rating:req.body.rating,comment:req.body.comment});ok(res,r,'Review submitted')});
app.put('/api/reviews/:id',auth,admin,async(req,res)=>{if(req.body.action==='delete'){await Review.findByIdAndDelete(req.params.id);return ok(res,null,'Review deleted')}const status=req.body.action==='approve'?'approved':'rejected';const r=await Review.findByIdAndUpdate(req.params.id,{status},{new:true});r?ok(res,r,'Review moderated'):fail(res,'Review not found',404)});

app.get('/api/admin/stats',auth,admin,async(req,res)=>{const [customers,orders,menuItems,reviews,revenue]=await Promise.all([User.countDocuments({role:'customer'}),Order.countDocuments(),Menu.countDocuments(),Review.countDocuments(),Order.aggregate([{$match:{status:{$ne:'cancelled'}}},{$group:{_id:null,total:{$sum:'$total'}}}])]);ok(res,{customers,orders,menuItems,reviews,revenue:revenue[0]?.total||0})});
app.get('/api/admin/customers',auth,admin,async(req,res)=>{const users=await User.find({role:'customer'}).select('-passwordHash').sort({createdAt:-1});ok(res,users.map(publicUser),'Customers loaded')});

app.use((req,res)=>fail(res,'Route not found',404));

async function seedAdmin(){
  const email=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  const password=process.env.ADMIN_PASSWORD||'';
  if(!email && !password){console.log('Admin seed skipped: ADMIN_EMAIL and ADMIN_PASSWORD are not set.');return;}
  if(!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be set for admin seeding');
  if(password.length<8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  const existing=await User.findOne({email});
  const passwordHash=await bcrypt.hash(password,12);
  if(existing){
    if(existing.role!=='admin') existing.role='admin';
    existing.passwordHash=passwordHash;
    await existing.save();
    console.log(`Admin account ready: ${email}`);
    return;
  }
  await User.create({email,passwordHash,firstName:'Admin',role:'admin'});
  console.log(`Admin account created: ${email}`);
}

mongoose.connect(process.env.MONGODB_URI).then(async()=>{await seedAdmin();await seedBakestMenu(Category,Menu);app.listen(PORT,()=>console.log(`THE BAKEST API running on ${PORT}`));}).catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1)});
