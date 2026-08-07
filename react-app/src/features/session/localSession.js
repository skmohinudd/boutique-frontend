import { createDemoUser,getUser } from "../../api/userApi";
const KEY="boutique-current-user-id-v2";let inFlight=null;
export function resetLocalSession(){localStorage.removeItem(KEY);}
export async function getOrCreateLocalUserId(){if(inFlight)return inFlight;inFlight=(async()=>{const existing=localStorage.getItem(KEY);if(existing){try{const user=await getUser(existing);if(user?.status==="ACTIVE")return existing;}catch(error){if(error?.status!==404)throw error;}localStorage.removeItem(KEY);}const created=await createDemoUser();if(!created?.id)throw new Error("User Service did not return a user ID");localStorage.setItem(KEY,created.id);return created.id;})();try{return await inFlight;}finally{inFlight=null;}}
