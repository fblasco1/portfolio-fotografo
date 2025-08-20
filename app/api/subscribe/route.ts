import { Resend } from "resend";

export async function POST(req: Request) {
    try {
        // Verificar que la API key esté configurada
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("Error: RESEND_API_KEY no está configurada");
            return Response.json({ 
                error: "Configuración de email no disponible. Por favor, contacta al administrador." 
            }, { status: 500 });
        }

        const { email } = await req.json();

        if (!email) {
            return Response.json({ error: "El email es obligatorio" }, { status: 400 });
        }

        const resend = new Resend(apiKey);

        const response = await resend.contacts.create({
            email: email,
            unsubscribed: false,
            audienceId: '63c905c4-6e5a-4bfa-936f-48f6da4a4fc9',
        });

        console.log("Suscripción exitosa:", { email, response });
        return Response.json({ success: true, data: response });
    } catch (error: any) {
        console.error("Error al suscribirse:", error);
        
        // Proporcionar mensajes de error más específicos
        let errorMessage = "Error al suscribirse";
        
        if (error.statusCode === 401) {
            errorMessage = "Error de autenticación con el servicio de email";
        } else if (error.statusCode === 400) {
            errorMessage = "Email inválido o ya suscrito";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return Response.json({ error: errorMessage }, { status: 500 });
    }
}
