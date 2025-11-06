import { NextResponse } from 'next/server';
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
    const { name, email, message, subject } = await request.json()

    if (!resend) {
        console.warn('⚠️ RESEND_API_KEY no configurada, saltando envío de email de contacto');
        return NextResponse.json({ success: false, error: 'Servicio de email no configurado' }, { status: 500 });
    }

    try {
        // Usar el asunto proporcionado o el predeterminado
        const emailSubject = subject || "Contacto desde el sitio web";
        
        await resend.emails.send({
            from: "Contacto <noreply@contacto.cristianpirovano.com>",
            to: "cristianpirovanoportfolio@gmail.com",
            subject: emailSubject,
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
