import { NextResponse } from 'next/server';
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    const { name, email, message } = await request.json()

    try {
        await resend.emails.send({
            from: "Contacto <noreply@contacto.cristianpirovano.com>",
            to: "cristianpirovanoportfolio@gmail.com",
            subject: "Contacto desde el sitio web",
            html: `
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensaje:</strong> ${message}</p>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}
