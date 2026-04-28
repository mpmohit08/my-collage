'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function approveAppointment(appointmentId: string) {
  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });

    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Error approving appointment:', error);
    return { success: false, error: 'Failed to approve appointment' };
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return { success: false, error: 'Failed to cancel appointment' };
  }
}

// ============================================
