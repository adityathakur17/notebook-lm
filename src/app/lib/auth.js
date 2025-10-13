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
                username:{label:'Username', type:'text', placeholder:'Enter username'},
                password:{label:'password', type:'password'}
            },
            async authorize(credentials,req){
                const {email, password} = credentials;

                
            }
        })
    ]
}