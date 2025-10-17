'use client'
import {signIn} from 'next-auth/react';
import {useState} from 'react';

export default function LoginPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async(e)=>{
        e.preventDefault()
        await signIn("credentials",{email,password,redirect:true,callbackUrl:"/chat"})
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
                <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
                <button type='submit'>Login</button>
            </form>
            <button onClick={()=>signIn("google")}>Sign in with Google</button>
        </div>
    )
}