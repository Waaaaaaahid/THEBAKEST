const API_BASE = (import.meta.env.VITE_API_URL as string || 'https://the-bakest-api-tp4g.onrender.com/api').replace(/\/$/, '');

const TOKEN_KEY = 'bakest_auth_token';
const REFRESH_KEY = 'bakest_auth_refresh';
const USER_KEY = 'bakest_auth_user';

export interface AuthUser { id:string; email:string; firstName:string; lastName:string; phone:string; role:'customer'|'admin'; created_at?:string; }
function getToken(){return localStorage.getItem(TOKEN_KEY)}
function setAuth(access:string, refresh:string, user:AuthUser){localStorage.setItem(TOKEN_KEY,access);localStorage.setItem(REFRESH_KEY,refresh);localStorage.setItem(USER_KEY,JSON.stringify(user))}
function clearAuth(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REFRESH_KEY);localStorage.removeItem(USER_KEY)}
function getStoredUser():AuthUser|null{try{const raw=localStorage.getItem(USER_KEY);return raw?JSON.parse(raw):null}catch{return null}}
async function apiCall<T=unknown>(path:string,options:RequestInit={}):Promise<{success:boolean;message:string;data?:T}>{const token=getToken();const headers:Record<string,string>={'Content-Type':'application/json',...((options.headers as Record<string,string>)||{})};if(token)headers.Authorization=`Bearer ${token}`;try{const res=await fetch(`${API_BASE}${path}`,{...options,headers});if(res.status===401){clearAuth();}try{return await res.json()}catch{return {success:false,message:'Unexpected response from server'}}}catch{return {success:false,message:'Network error — please check your connection'}}}
export const authApi={
 register:(email:string,password:string,firstName:string,lastName:string,phone:string)=>apiCall<{access_token:string;refresh_token:string;user:AuthUser}>('/auth/register',{method:'POST',body:JSON.stringify({email,password,firstName,lastName,phone})}),
 login:(email:string,password:string)=>apiCall<{access_token:string;refresh_token:string;user:AuthUser}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
 me:()=>apiCall<AuthUser>('/auth/me',{method:'GET'}),
 updateProfile:(firstName:string,lastName:string,phone:string)=>apiCall('/auth/update-profile',{method:'PUT',body:JSON.stringify({firstName,lastName,phone})}),
 logout:()=>{clearAuth();return Promise.resolve({success:true,message:'Logged out'})},getStoredUser,setAuth,clearAuth,getToken,
};
export const categoriesApi={list:()=>apiCall<unknown[]>('/categories'),create:(data:{name:string;slug?:string;sortOrder?:number})=>apiCall('/categories',{method:'POST',body:JSON.stringify(data)}),update:(id:string,data:{name?:string;slug?:string;sortOrder?:number})=>apiCall(`/categories/${id}`,{method:'PUT',body:JSON.stringify(data)}),delete:(id:string)=>apiCall(`/categories/${id}`,{method:'DELETE'})};
export const menuApi={list:()=>apiCall<unknown[]>('/menu'),byCategory:(categoryId:string)=>apiCall<unknown[]>(`/menu/category/${categoryId}`),create:(data:Record<string,unknown>)=>apiCall('/menu',{method:'POST',body:JSON.stringify(data)}),update:(id:string,data:Record<string,unknown>)=>apiCall(`/menu/${id}`,{method:'PUT',body:JSON.stringify(data)}),delete:(id:string)=>apiCall(`/menu/${id}`,{method:'DELETE'})};
export const ordersApi={list:()=>apiCall<unknown[]>('/orders'),get:(id:string)=>apiCall<unknown>(`/orders/${id}`),create:(data:Record<string,unknown>)=>apiCall<unknown>('/orders',{method:'POST',body:JSON.stringify(data)}),updateStatus:(id:string,status:string)=>apiCall(`/orders/status/${id}`,{method:'PUT',body:JSON.stringify({status})})};
export const reviewsApi={approved:()=>apiCall<unknown[]>('/reviews/approved'),all:()=>apiCall<unknown[]>('/reviews/all'),byOrder:(orderId:string)=>apiCall<unknown|null>(`/reviews/order/${orderId}`),create:(orderId:string,rating:number,comment:string)=>apiCall('/reviews',{method:'POST',body:JSON.stringify({orderId,rating,comment})}),moderate:(id:string,action:'approve'|'reject'|'delete')=>apiCall(`/reviews/${id}`,{method:'PUT',body:JSON.stringify({action})})};
export const adminApi={stats:()=>apiCall<Record<string,unknown>>('/admin/stats'),customers:()=>apiCall<unknown[]>('/admin/customers')};
