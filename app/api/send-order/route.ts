import { Resend } from "resend";
import { getScopedI18n } from "@/locales/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const t = await getScopedI18n("shop");

    try {
        const { name, country, email, cart } = await req.json();

        // Formatear correctamente la lista de artículos con cantidad
        const formattedItems = cart
            .map((item: { titleKey: string, quantity: number }) => `- ${t(item.titleKey)} (x${item.quantity})`)
            .join("\n");

        const { data, error } = await resend.emails.send({
            from: "Ventas <noreply@contacto.cristianpirovano.com>",
            to: ["cristianpirovanoportfolio@gmail.com"],
            subject: `${name} - Nueva Orden de Compra`,
            text: `¡Hola! Se ha realizado una nueva orden de compra en la tienda online. A continuación los detalles:
        
Nombre: ${name}
País: ${country}
Email: ${email}

Artículos comprados:
${formattedItems}
      `,
        });

        if (error) {
            return new Response(JSON.stringify({ error }), { status: 500 });
        }

        // Responder con éxito para que el frontend pueda vaciar el carrito
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
    }
}
