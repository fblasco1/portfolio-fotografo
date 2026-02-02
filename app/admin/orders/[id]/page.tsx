import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrderDetail from './components/OrderDetail';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== 'pirovanofotografia@gmail.com') {
    redirect('/admin/login');
  }

  const { id } = await params;

  return <OrderDetail orderId={id} />;
}
