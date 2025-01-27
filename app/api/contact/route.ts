import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { name, email, message } = await request.json();

    try {
        // Procesa el mensaje (puedes integrar con SendGrid, Nodemailer, etc.)
        console.log({ name, email, message });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
