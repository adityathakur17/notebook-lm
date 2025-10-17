import {connectDB} from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req){
    try{
        const {username, email, password} = await req.json()
        await connectDB()

        const existing = await User.findOne({email})

        if(existing){
            return Response.json({error:'User already exists'},{status:400})
        } 
        
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({email, username, password:hashedPassword})
        return Response.json({message:'User created successfully'})

    }catch(err){
        console.error(err)
        return Response.json({error:'Something went wrong'},{status:500})
    }
}