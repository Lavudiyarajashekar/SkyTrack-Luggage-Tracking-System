'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane,User,Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function LoginPage(){

const router=useRouter();

const [username,setUsername]=useState('');
const [password,setPassword]=useState('');
const [loading,setLoading]=useState(false);


const handleLogin = async (e:any) => {
  e.preventDefault();

  try {
    setLoading(true);

    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);

    const res = await api.post(
      '/auth/token',
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = res.data.access_token;

    // store token
    localStorage.setItem('token', token);

    // 🔥 decode token
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );

    // 🔥 ROLE BASED REDIRECT
    if (payload.role === "admin") {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }

  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.detail || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};


return(

<div className="
relative
min-h-screen
overflow-hidden
bg-slate-100
">

{/* atmospheric sky */}
<div className="
absolute inset-0
bg-gradient-to-b
from-sky-100
via-blue-50
to-slate-100
"/>


{/* sun glow */}
<div className="
absolute
top-0
right-0
w-[700px]
h-[700px]
rounded-full
bg-white/70
blur-3xl
"/>



{/* -------- HUGE ROTATING EARTH -------- */}

<motion.div
animate={{
x:[0,-70,0],
y:[0,-30,0]
}}
transition={{
repeat:Infinity,
duration:40,
ease:'linear'
}}
className="
absolute
bottom-[-700px]
left-[-350px]
w-[1900px]
h-[1900px]
rounded-full
overflow-hidden
shadow-[0_-40px_120px_rgba(0,0,0,.2)]
"
>

{/* Earth texture */}
<motion.img
src="/images/earth.jpg"
alt=""
animate={{
rotate:[0,-8]
}}
transition={{
repeat:Infinity,
duration:80,
ease:'linear'
}}
className="
absolute
inset-0
w-full
h-full
object-cover
scale-125
"
/>



{/* rotating cloud layer 1 */}
<motion.img
src="/images/clouds.png"
alt=""
animate={{
rotate:[0,12]
}}
transition={{
repeat:Infinity,
duration:120,
ease:'linear'
}}
className="
absolute
inset-0
w-full
h-full
object-cover
opacity-50
scale-110
"
/>

{/* cloud layer 2 for depth */}
<motion.img
src="/images/clouds.png"
alt=""
animate={{
rotate:[0,-16]
}}
transition={{
repeat:Infinity,
duration:160,
ease:'linear'
}}
className="
absolute
inset-0
w-full
h-full
object-cover
opacity-30
scale-125
"
/>



{/* atmosphere rim */}
<div className="
absolute inset-0
rounded-full
border-[14px]
border-white/60
"/>

</motion.div>



{/* flight path */}
<div
className="
absolute
top-[34%]
left-[4%]
w-[95%]
h-[280px]
border-t-[8px]
border-dashed
border-white
rounded-[100%]
rotate-[-22deg]
opacity-90
z-20
"
/>



{/* plane touching path */}
<motion.div
animate={{
x:[-120,1150],
y:[240,-330],
rotate:[-10,8]
}}
transition={{
repeat:Infinity,
duration:14,
ease:'linear'
}}
className="
absolute
z-50
"
>

<motion.div
animate={{
y:[0,-10,0]
}}
transition={{
repeat:Infinity,
duration:2
}}
className="relative"
>

{/* plane glow */}
<div className="
absolute
inset-0
blur-xl
bg-cyan-200/40
scale-150
rounded-full
"/>

<Plane
size={110}
strokeWidth={1.7}
className="
relative
text-white
drop-shadow-[0_12px_25px_rgba(0,0,0,.25)]
"
/>

</motion.div>

</motion.div>



{/* moving foreground clouds for 3D depth */}
<motion.div
animate={{x:[0,150,0]}}
transition={{
repeat:Infinity,
duration:25
}}
className="
absolute
top-28
left-10
w-96
h-32
rounded-full
bg-white/70
blur-md
"
/>

<motion.div
animate={{x:[0,-120,0]}}
transition={{
repeat:Infinity,
duration:30
}}
className="
absolute
top-56
right-20
w-[500px]
h-36
rounded-full
bg-white/60
blur-md
"
/>




{/* TITLE */}
<div className="
absolute
left-20
top-28
z-40
max-w-2xl
">

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:1}}
>

<h1 className="
text-7xl
font-bold
leading-tight
text-slate-800
">
Real-Time
<br/>
<span className="text-cyan-600">
Baggage Tracking
</span>
</h1>

<p className="
mt-8
text-2xl
text-slate-600
leading-relaxed
">
Track every bag across the globe in real time.
</p>

</motion.div>

</div>




{/* -------- FLOATING GLASS LOGIN -------- */}

<div className="
absolute
inset-0
flex
items-center
justify-end
pr-24
z-50
">

<motion.div
initial={{
opacity:0,
y:60,
scale:.95
}}
animate={{
opacity:1,
y:0,
scale:1
}}
transition={{
duration:1
}}
whileHover={{
rotateY:6,
rotateX:2
}}
className="w-full max-w-md"
>

<div className="
backdrop-blur-3xl
bg-white/30
border border-white/60
rounded-[36px]
p-10
shadow-[0_20px_80px_rgba(0,0,0,.18)]
">

<div className="
mx-auto
mb-8
w-24
h-24
rounded-3xl
bg-white/45
backdrop-blur-xl
flex items-center justify-center
shadow-xl
">
<Plane size={42} className="text-slate-700"/>
</div>


<div className="text-center mb-10">
<h2 className="
text-4xl
font-bold
text-slate-800
mb-3
">
Welcome
</h2>

<p className="text-slate-600">
   Access Airline Baggage Operations 
</p>
</div>


<form
onSubmit={handleLogin}
className="space-y-5"
>

<div className="relative">
<User className="absolute left-4 top-4 text-slate-500"/>

<input
value={username}
onChange={e=>setUsername(e.target.value)}
placeholder="Username"
className="
w-full
pl-12
p-4
rounded-2xl
bg-white/50
backdrop-blur-xl
border border-white/60
outline-none
"
/>
</div>


<div className="relative">
<Lock className="absolute left-4 top-4 text-slate-500"/>

<input
type="password"
value={password}
onChange={e=>setPassword(e.target.value)}
placeholder="Password"
className="
w-full
pl-12
p-4
rounded-2xl
bg-white/50
backdrop-blur-xl
border border-white/60
outline-none
"
/>
</div>


<motion.button
whileHover={{
scale:1.03,
y:-3
}}
whileTap={{
scale:.98
}}
disabled={loading}
className="
w-full
p-4
rounded-2xl
font-semibold
text-white
bg-gradient-to-r
from-slate-600
via-cyan-600
to-sky-500
shadow-xl
"
>
{loading ? 'Signing In...' : 'Launch Dashboard'}
</motion.button>

</form>


<div className="mt-6 text-center text-sm text-slate-600">
  Don't have an account?{' '}
  <Link href="/signup" className="text-cyan-600 font-semibold hover:underline">
    Sign Up
  </Link>
</div>

<div className="
grid grid-cols-3
mt-8
text-sm
text-slate-600
text-center
">
<div>Secure Auth</div>
<div>Live Tracking</div>
<div>Airline Ops</div>
</div>

</div>

</motion.div>

</div>


</div>

)

}