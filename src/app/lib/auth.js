import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import {NextAuthOptions} from 'next-auth';

export const NEXT_AUTH_CONFIG = {
    providers:[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),


        CredentialsProvider({
            name:'Credentials',
            credentials:{
                email:{label:'Email', type:'text', placeholder:'Enter Email'},
                password:{label:'password', type:'password'}
            },
            async authorize(credentials,req){
                const {email, password} = credentials;

                await connectDB()
                const user = await User.findOne({email})

                if(!user) throw new Error("User does not exist")
                
                const isValid = await bcrypt.compare(password, user.password)
                if(!isValid) throw new Error("Invalid Credentials")

                
            }
        })
    ]
}