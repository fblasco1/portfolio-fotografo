import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return Response.json({ error: "El email es obligatorio" }, { status: 400 });
        }

        const response = await resend.contacts.create({
            email: email,
            unsubscribed: false,
            audienceId: '63c905c4-6e5a-4bfa-936f-48f6da4a4fc9',
        });

        return Response.json({ success: true, data: response });
    } catch (error) {
        console.error("Error al suscribirse:", error);
        return Response.json({ error: "Error al suscribirse" }, { status: 500 });
    }
}
