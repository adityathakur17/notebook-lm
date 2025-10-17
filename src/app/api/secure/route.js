import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/app/lib/auth";

export async function GET(req){
    const session = await getServerSession(NEXT_AUTH_CONFIG)

    if(!session){
        return Response.json({'error':'unauthorized'},{'status':401})
    }

    return Response.json({message:`Hello, ${session.user.name}`})
}